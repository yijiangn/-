import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.ADMIN_TOKEN) {
    const cookieStore = await cookies();
    cookieStore.set("admin_token", password, {
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
