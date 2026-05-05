import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { ApiRequestError, requestJson } from "@/services/request-json";

export interface AuthSessionProfile {
  id: string;
  email?: string;
  phone?: string;
  userMetadata?: Record<string, unknown>;
  appMetadata?: Record<string, unknown>;
}

interface PasswordLoginResponse {
  accessToken: string;
  profile: AuthSessionProfile;
}

export async function getCurrentUserFromApi() {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置。", 503);
  }

  return requestJson<AuthSessionProfile>("/api/auth/me", {
    cache: "no-store"
  });
}

export async function signInWithPasswordFromApi(email: string, password: string) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置。", 503);
  }

  return requestJson<PasswordLoginResponse>("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });
}
