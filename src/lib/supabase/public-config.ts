export function hasSupabaseClientEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isServiceMode() {
  return process.env.NEXT_PUBLIC_SERVICE_MODE === "true";
}
