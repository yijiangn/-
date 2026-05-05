import { NextResponse } from "next/server";
import { fetchSupabaseUserProfile, requireAuthenticatedSupabaseRequest, SupabaseAuthError } from "@/lib/supabase/auth";
import { hasSupabaseServerEnv } from "@/lib/supabase/config";

export async function GET(request: Request) {
  if (!hasSupabaseServerEnv()) {
    return NextResponse.json({ message: "Supabase 未配置。" }, { status: 503 });
  }

  try {
    const context = await requireAuthenticatedSupabaseRequest(request);
    const user = await fetchSupabaseUserProfile(context.accessToken);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      userMetadata: user.user_metadata ?? {},
      appMetadata: user.app_metadata ?? {}
    });
  } catch (error) {
    if (error instanceof SupabaseAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json({ message: "获取当前用户信息失败。" }, { status: 500 });
  }
}
