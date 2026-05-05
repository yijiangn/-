import "server-only";
import { getSupabaseServerEnv } from "@/lib/supabase/config";

type SearchParamValue = string | number | boolean | null | undefined;

interface SupabaseRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  searchParams?: Record<string, SearchParamValue>;
  body?: BodyInit | object | null;
  headers?: HeadersInit;
  preferRepresentation?: boolean;
}

export async function supabaseRestRequest<T>(path: string, options: SupabaseRequestOptions = {}) {
  const env = getSupabaseServerEnv();
  return supabaseRestRequestWithAuth<T>(path, env.serviceRoleKey, env.serviceRoleKey, options);
}

export async function supabaseUserRestRequest<T>(
  path: string,
  accessToken: string,
  options: SupabaseRequestOptions = {}
) {
  const env = getSupabaseServerEnv();
  return supabaseRestRequestWithAuth<T>(path, env.anonKey, accessToken, options);
}

async function supabaseRestRequestWithAuth<T>(
  path: string,
  apiKey: string,
  accessToken: string,
  options: SupabaseRequestOptions = {}
) {
  const env = getSupabaseServerEnv();
  const url = new URL(`${env.url}/rest/v1/${path}`);

  Object.entries(options.searchParams ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    url.searchParams.set(key, String(value));
  });

  const body =
    options.body && typeof options.body === "object" && !(options.body instanceof Blob) && !(options.body instanceof FormData)
      ? JSON.stringify(options.body)
      : options.body ?? undefined;

  const headers = new Headers(options.headers);
  headers.set("apikey", apiKey);
  headers.set("Authorization", `Bearer ${accessToken}`);

  if (typeof body === "string") {
    headers.set("Content-Type", "application/json");
  }

  if (options.preferRepresentation) {
    headers.set("Prefer", "return=representation");
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export async function uploadToSupabaseStorage(filePath: string, fileBody: ArrayBuffer, contentType: string) {
  const env = getSupabaseServerEnv();
  const url = `${env.url}/storage/v1/object/${env.storageBucket}/${filePath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": contentType,
      "x-upsert": "true"
    },
    body: fileBody
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const payload = (await response.json()) as { Key?: string; path?: string };

  return {
    bucket: env.storageBucket,
    path: payload.path ?? payload.Key ?? filePath,
    publicUrl: `${env.url}/storage/v1/object/public/${env.storageBucket}/${payload.path ?? payload.Key ?? filePath}`
  };
}
