import "server-only";
import { getSupabaseServerEnv } from "@/lib/supabase/config";

export class SupabaseAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.name = "SupabaseAuthError";
    this.status = status;
  }
}

export interface AuthenticatedSupabaseRequest {
  accessToken: string;
  userId: string;
}

export interface AuthenticatedSupabaseUser {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function fetchSupabaseUserProfile(accessToken: string): Promise<AuthenticatedSupabaseUser> {
  const env = getSupabaseServerEnv();
  const response = await fetch(`${env.url}/auth/v1/user`, {
    headers: {
      apikey: env.anonKey,
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new SupabaseAuthError("登录状态已失效，请重新连接云端账号。", 401);
  }

  const payload = (await response.json()) as AuthenticatedSupabaseUser;

  if (!payload.id) {
    throw new SupabaseAuthError("未能识别当前用户身份。", 401);
  }

  return payload;
}

export async function requireAuthenticatedSupabaseRequest(request: Request): Promise<AuthenticatedSupabaseRequest> {
  const accessToken = getBearerToken(request);

  if (!accessToken) {
    throw new SupabaseAuthError("未检测到登录凭证，请先登录后再访问云端数据。", 401);
  }

  const user = await fetchSupabaseUserProfile(accessToken);

  return {
    accessToken,
    userId: user.id
  };
}
