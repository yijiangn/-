import "server-only";
import { supabaseRestRequest } from "@/lib/supabase/rest";

interface AppConfigRow {
  key: string;
  value: string;
}

export async function getAppConfig(key: string): Promise<string | null> {
  const rows = await supabaseRestRequest<AppConfigRow[]>("app_config", {
    searchParams: { key: `eq.${key}` },
  });
  return rows.length ? rows[0].value : null;
}

export async function setAppConfig(key: string, value: string) {
  await supabaseRestRequest("app_config", {
    method: "POST",
    body: { key, value },
    headers: { Prefer: "resolution=merge-duplicates" },
  });
}

export async function getSessionVersion(): Promise<number> {
  const v = await getAppConfig("session_version");
  return v ? parseInt(v, 10) : 1;
}

export async function incrementSessionVersion() {
  const current = await getSessionVersion();
  const next = current + 1;
  await setAppConfig("session_version", String(next));
  return next;
}

export async function getAdminPassword(): Promise<string | null> {
  return getAppConfig("admin_password");
}

export async function setAdminPassword(password: string) {
  await setAppConfig("admin_password", password);
}
