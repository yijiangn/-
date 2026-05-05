import "server-only";

interface SupabaseServerEnv {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  storageBucket: string;
}

export function hasSupabaseServerEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSupabaseServerEnv(): SupabaseServerEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const storageBucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "study-attachments";

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase 环境变量未配置，请先填写 .env.local。");
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
    storageBucket
  };
}
