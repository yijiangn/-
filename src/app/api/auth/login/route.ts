import { NextResponse } from "next/server";
import { getSupabaseServerEnv, hasSupabaseServerEnv } from "@/lib/supabase/config";

interface LoginRequestBody {
  email?: string;
  password?: string;
}

interface SupabasePasswordLoginResponse {
  access_token?: string;
  user?: {
    id?: string;
    email?: string;
    phone?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  };
  error_description?: string;
  msg?: string;
}

export async function POST(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as LoginRequestBody;
  const email = body.email?.trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "请输入邮箱和密码。" }, { status: 400 });
  }

  const env = getSupabaseServerEnv();
  const response = await fetch(`${env.url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });

  const payload = (await response.json().catch(() => ({}))) as SupabasePasswordLoginResponse;

  if (!response.ok || !payload.access_token || !payload.user?.id) {
    return NextResponse.json(
      { message: payload.error_description || payload.msg || "邮箱或密码不正确。" },
      { status: response.status || 401 }
    );
  }

  return NextResponse.json({
    accessToken: payload.access_token,
    profile: {
      id: payload.user.id,
      email: payload.user.email,
      phone: payload.user.phone,
      userMetadata: payload.user.user_metadata ?? {},
      appMetadata: payload.user.app_metadata ?? {}
    }
  });
}
