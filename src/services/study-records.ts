import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import { hasSupabaseClientEnv } from "@/lib/supabase/public-config";
import { ApiRequestError, requestJson } from "@/services/request-json";

type RecordType = "mistake" | "knowledge";

export async function listStudyRecordsFromApi(recordType: RecordType) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置。", 503);
  }

  return requestJson<Array<MistakeRecord | KnowledgeRecord>>(`/api/study-records?recordType=${recordType}`, {
    cache: "no-store"
  });
}

export async function createStudyRecordInApi(recordType: "mistake", record: MistakeRecord): Promise<MistakeRecord>;
export async function createStudyRecordInApi(recordType: "knowledge", record: KnowledgeRecord): Promise<KnowledgeRecord>;
export async function createStudyRecordInApi(recordType: RecordType, record: MistakeRecord | KnowledgeRecord) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置。", 503);
  }

  return requestJson<MistakeRecord | KnowledgeRecord>("/api/study-records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ recordType, record })
  });
}

export async function updateStudyRecordInApi(recordType: "mistake", record: MistakeRecord): Promise<MistakeRecord>;
export async function updateStudyRecordInApi(recordType: "knowledge", record: KnowledgeRecord): Promise<KnowledgeRecord>;
export async function updateStudyRecordInApi(recordType: RecordType, record: MistakeRecord | KnowledgeRecord) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置。", 503);
  }

  return requestJson<MistakeRecord | KnowledgeRecord>(`/api/study-records/${record.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ recordType, record })
  });
}

export async function deleteStudyRecordInApi(recordId: string) {
  if (!hasSupabaseClientEnv()) {
    throw new ApiRequestError("Supabase 未配置。", 503);
  }

  await requestJson<{ success: boolean }>(`/api/study-records/${recordId}`, {
    method: "DELETE"
  });
}
