import "server-only";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import { mapAttachmentToDbRow, mapKnowledgeFromDbRow, mapKnowledgeToDbRow, mapMistakeFromDbRow, mapMistakeToDbRow } from "@/lib/supabase/mappers";
import { supabaseRestRequest, supabaseUserRestRequest, uploadToSupabaseStorage } from "@/lib/supabase/rest";
import type { DbAttachmentRow, DbRecordType, DbStudyRecordRow } from "@/types/database";

interface StudyRecordRepositoryContext {
  accessToken: string;
  userId: string;
}

export async function listMistakes(context: StudyRecordRepositoryContext) {
  const rows = await listStudyRecordRows(context, "mistake");
  const attachments = await listAttachmentsForRecordIds(context, rows.map((row) => row.id));

  return rows.map((row) => mapMistakeFromDbRow(row, attachments.filter((item) => item.record_id === row.id)));
}

export async function listKnowledgeRecords(context: StudyRecordRepositoryContext) {
  const rows = await listStudyRecordRows(context, "knowledge");
  const attachments = await listAttachmentsForRecordIds(context, rows.map((row) => row.id));

  return rows.map((row) => mapKnowledgeFromDbRow(row, attachments.filter((item) => item.record_id === row.id)));
}

export async function insertMistake(context: StudyRecordRepositoryContext, record: MistakeRecord) {
  const [row] = await supabaseUserRestRequest<DbStudyRecordRow[]>("study_records", context.accessToken, {
    method: "POST",
    body: {
      ...mapMistakeToDbRow(record),
      user_id: context.userId
    },
    preferRepresentation: true
  });

  if (record.attachments.length > 0) {
    await upsertAttachments(context, record.id, record.attachments);
  }

  const attachments = await listAttachmentsForRecordIds(context, [record.id]);
  return mapMistakeFromDbRow(row, attachments);
}

export async function updateMistake(context: StudyRecordRepositoryContext, record: MistakeRecord) {
  const [row] = await supabaseUserRestRequest<DbStudyRecordRow[]>("study_records", context.accessToken, {
    method: "PATCH",
    searchParams: {
      id: `eq.${record.id}`,
      user_id: `eq.${context.userId}`
    },
    body: {
      ...mapMistakeToDbRow(record),
      user_id: context.userId
    },
    preferRepresentation: true
  });

  await replaceAttachments(context, record.id, record.attachments);
  const attachments = await listAttachmentsForRecordIds(context, [record.id]);
  return mapMistakeFromDbRow(row, attachments);
}

export async function insertKnowledge(context: StudyRecordRepositoryContext, record: KnowledgeRecord) {
  const [row] = await supabaseUserRestRequest<DbStudyRecordRow[]>("study_records", context.accessToken, {
    method: "POST",
    body: {
      ...mapKnowledgeToDbRow(record),
      user_id: context.userId
    },
    preferRepresentation: true
  });

  if (record.attachments.length > 0) {
    await upsertAttachments(context, record.id, record.attachments);
  }

  const attachments = await listAttachmentsForRecordIds(context, [record.id]);
  return mapKnowledgeFromDbRow(row, attachments);
}

export async function updateKnowledge(context: StudyRecordRepositoryContext, record: KnowledgeRecord) {
  const [row] = await supabaseUserRestRequest<DbStudyRecordRow[]>("study_records", context.accessToken, {
    method: "PATCH",
    searchParams: {
      id: `eq.${record.id}`,
      user_id: `eq.${context.userId}`
    },
    body: {
      ...mapKnowledgeToDbRow(record),
      user_id: context.userId
    },
    preferRepresentation: true
  });

  await replaceAttachments(context, record.id, record.attachments);
  const attachments = await listAttachmentsForRecordIds(context, [record.id]);
  return mapKnowledgeFromDbRow(row, attachments);
}

export async function removeStudyRecord(context: StudyRecordRepositoryContext, recordId: string) {
  await supabaseUserRestRequest("study_records", context.accessToken, {
    method: "DELETE",
    searchParams: {
      id: `eq.${recordId}`,
      user_id: `eq.${context.userId}`
    }
  });
}

export async function uploadRecordFile(params: {
  recordId: string;
  label: string;
  kind: DbAttachmentRow["kind"];
  tone: DbAttachmentRow["tone"];
  fileName: string;
  contentType: string;
  fileBody: ArrayBuffer;
  userId: string;
}) {
  const safeName = params.fileName.replace(/[^\w.-]+/g, "-");
  const filePath = `${params.userId}/${params.recordId}/${Date.now()}-${safeName}`;
  const upload = await uploadToSupabaseStorage(filePath, params.fileBody, params.contentType);

  const attachmentRow = mapAttachmentToDbRow(
    params.recordId,
    {
      id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: params.label,
      kind: params.kind,
      tone: params.tone
    },
    upload
  );
  attachmentRow.user_id = params.userId;

  const [row] = await supabaseRestRequest<DbAttachmentRow[]>("attachments", {
    method: "POST",
    body: attachmentRow,
    preferRepresentation: true
  });

  return row;
}

async function listStudyRecordRows(context: StudyRecordRepositoryContext, recordType: DbRecordType) {
  return supabaseUserRestRequest<DbStudyRecordRow[]>("study_records", context.accessToken, {
    searchParams: {
      select: "*",
      user_id: `eq.${context.userId}`,
      record_type: `eq.${recordType}`,
      order: "created_at.desc"
    }
  });
}

async function listAttachmentsForRecordIds(context: StudyRecordRepositoryContext, recordIds: string[]) {
  if (recordIds.length === 0) {
    return [] as DbAttachmentRow[];
  }

  return supabaseUserRestRequest<DbAttachmentRow[]>("attachments", context.accessToken, {
    searchParams: {
      select: "*",
      user_id: `eq.${context.userId}`,
      record_id: `in.(${recordIds.join(",")})`,
      order: "created_at.asc"
    }
  });
}

async function replaceAttachments(
  context: StudyRecordRepositoryContext,
  recordId: string,
  attachments: MistakeRecord["attachments"] | KnowledgeRecord["attachments"]
) {
  await supabaseUserRestRequest("attachments", context.accessToken, {
    method: "DELETE",
    searchParams: {
      user_id: `eq.${context.userId}`,
      record_id: `eq.${recordId}`
    }
  });

  if (attachments.length === 0) {
    return;
  }

  await upsertAttachments(context, recordId, attachments);
}

async function upsertAttachments(
  context: StudyRecordRepositoryContext,
  recordId: string,
  attachments: MistakeRecord["attachments"] | KnowledgeRecord["attachments"]
) {
  const rows = attachments.map((attachment) => ({
    ...mapAttachmentToDbRow(recordId, attachment),
    user_id: context.userId
  }));

  await supabaseUserRestRequest<DbAttachmentRow[]>("attachments", context.accessToken, {
    method: "POST",
    body: rows,
    preferRepresentation: true
  });
}
