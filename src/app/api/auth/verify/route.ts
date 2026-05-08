import { cookies } from "next/headers";
import { getAdminPassword, getSessionVersion } from "@/lib/supabase/app-config-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { password } = await request.json();

  const storedPassword = await getAdminPassword();

  if (!storedPassword) {
    // 首次使用：密码未设置，接受任意密码并保存
    return Response.json(
      { ok: false, error: "系统未配置密码，请联系管理员" },
      { status: 500 }
    );
  }

  if (password === storedPassword) {
    const version = await getSessionVersion();
    const cookieStore = await cookies();
    cookieStore.set("admin_token", String(version), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return Response.json({ ok: true });
  }

  return Response.json({ ok: false, error: "密码错误" }, { status: 403 });
}
