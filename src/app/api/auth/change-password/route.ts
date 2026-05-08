import { cookies } from "next/headers";
import {
  getAdminPassword,
  setAdminPassword,
  incrementSessionVersion,
  getSessionVersion,
} from "@/lib/supabase/app-config-repository";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { oldPassword, newPassword } = await request.json();

  if (!newPassword || newPassword.trim().length < 4) {
    return Response.json(
      { ok: false, error: "新密码至少 4 个字符" },
      { status: 400 }
    );
  }

  // 验证旧密码
  const storedPassword = await getAdminPassword();
  if (storedPassword && oldPassword !== storedPassword) {
    return Response.json({ ok: false, error: "旧密码错误" }, { status: 403 });
  }

  // 更新密码 + 递增版本号 → 其他设备自动登出
  await setAdminPassword(newPassword.trim());
  const newVersion = await incrementSessionVersion();

  // 更新当前设备的 cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_token", String(newVersion), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ ok: true });
}
