import { getClientAuthHeaders } from "@/lib/supabase/client-auth";

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload?.message) {
      return payload.message;
    }
  } catch {
    // Fall through to plain text.
  }

  try {
    const text = await response.text();
    if (text.trim()) {
      return text;
    }
  } catch {
    // Keep a stable fallback message.
  }

  return "请求失败，请稍后再试。";
}

export async function requestJson<T>(input: RequestInfo, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  Object.entries(getClientAuthHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = await fetch(input, {
    ...init,
    headers
  });

  if (!response.ok) {
    throw new ApiRequestError(await readErrorMessage(response), response.status);
  }

  return (await response.json()) as T;
}
