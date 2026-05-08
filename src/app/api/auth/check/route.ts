import { cookies } from "next/headers";
import { getSessionVersion } from "@/lib/supabase/app-config-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const cookieVersion = cookieStore.get("admin_token")?.value;
  const currentVersion = await getSessionVersion();

  if (!cookieVersion || parseInt(cookieVersion, 10) !== currentVersion) {
    return Response.json({ ok: false, reason: "session_expired" }, { status: 401 });
  }

  return Response.json({ ok: true });
}
