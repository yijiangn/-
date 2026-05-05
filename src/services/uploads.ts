import { getClientAuthHeaders } from "@/lib/supabase/client-auth";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { ApiRequestError } from "@/services/request-json";
import type { DbAttachmentRow } from "@/types/database";

export async function uploadStudyAttachment(formData: FormData) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置", 503);
  }

  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: getClientAuthHeaders(),
    body: formData
  });

  if (!response.ok) {
    let message = "上传失败，请稍后再试。";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // ignore response body parse failure
    }

    throw new ApiRequestError(message, response.status);
  }

  return (await response.json()) as DbAttachmentRow;
}
