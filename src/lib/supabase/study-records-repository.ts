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

// Service role 版本 —— 不需要用户身份，使用 service_role key 直连

export async function listMistakesService() {
  const rows = await listStudyRecordRowsService("mistake");
  const attachments = await listAttachmentsForRecordIdsService(rows.map((row) => row.id));

  return rows.map((row) => mapMistakeFromDbRow(row, attachments.filter((item) => item.record_id === row.id)));
}

export async function listKnowledgeRecordsService() {
  const rows = await listStudyRecordRowsService("knowledge");
  const attachments = await listAttachmentsForRecordIdsService(rows.map((row) => row.id));

  return rows.map((row) => mapKnowledgeFromDbRow(row, attachments.filter((item) => item.record_id === row.id)));
}

export async function insertMistakeService(record: MistakeRecord) {
  const [row] = await supabaseRestRequest<DbStudyRecordRow[]>("study_records", {
    method: "POST",
    body: mapMistakeToDbRow(record),
    preferRepresentation: true
  });

  if (record.attachments.length > 0) {
    await upsertAttachmentsService(record.id, record.attachments);
  }

  const attachments = await listAttachmentsForRecordIdsService([record.id]);
  return mapMistakeFromDbRow(row, attachments);
}

export async function updateMistakeService(record: MistakeRecord) {
  const [row] = await supabaseRestRequest<DbStudyRecordRow[]>("study_records", {
    method: "PATCH",
    searchParams: {
      id: `eq.${record.id}`
    },
    body: mapMistakeToDbRow(record),
    preferRepresentation: true
  });

  await replaceAttachmentsService(record.id, record.attachments);
  const attachments = await listAttachmentsForRecordIdsService([record.id]);
  return mapMistakeFromDbRow(row, attachments);
}

export async function insertKnowledgeService(record: KnowledgeRecord) {
  const [row] = await supabaseRestRequest<DbStudyRecordRow[]>("study_records", {
    method: "POST",
    body: mapKnowledgeToDbRow(record),
    preferRepresentation: true
  });

  if (record.attachments.length > 0) {
    await upsertAttachmentsService(record.id, record.attachments);
  }

  const attachments = await listAttachmentsForRecordIdsService([record.id]);
  return mapKnowledgeFromDbRow(row, attachments);
}

export async function updateKnowledgeService(record: KnowledgeRecord) {
  const [row] = await supabaseRestRequest<DbStudyRecordRow[]>("study_records", {
    method: "PATCH",
    searchParams: {
      id: `eq.${record.id}`
    },
    body: mapKnowledgeToDbRow(record),
    preferRepresentation: true
  });

  await replaceAttachmentsService(record.id, record.attachments);
  const attachments = await listAttachmentsForRecordIdsService([record.id]);
  return mapKnowledgeFromDbRow(row, attachments);
}

export async function removeStudyRecordService(recordId: string) {
  await supabaseRestRequest("study_records", {
    method: "DELETE",
    searchParams: {
      id: `eq.${recordId}`
    }
  });
}

export async function uploadRecordFileService(params: {
  recordId: string;
  label: string;
  kind: DbAttachmentRow["kind"];
  tone: DbAttachmentRow["tone"];
  fileName: string;
  contentType: string;
  fileBody: ArrayBuffer;
}) {
  const safeName = params.fileName.replace(/[^\w.-]+/g, "-");
  const filePath = `service/${params.recordId}/${Date.now()}-${safeName}`;
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

  const [row] = await supabaseRestRequest<DbAttachmentRow[]>("attachments", {
    method: "POST",
    body: attachmentRow,
    preferRepresentation: true
  });

  return row;
}

async function listStudyRecordRowsService(recordType: DbRecordType) {
  return supabaseRestRequest<DbStudyRecordRow[]>("study_records", {
    searchParams: {
      select: "*",
      record_type: `eq.${recordType}`,
      order: "created_at.desc"
    }
  });
}

async function listAttachmentsForRecordIdsService(recordIds: string[]) {
  if (recordIds.length === 0) {
    return [] as DbAttachmentRow[];
  }

  return supabaseRestRequest<DbAttachmentRow[]>("attachments", {
    searchParams: {
      select: "*",
      record_id: `in.(${recordIds.join(",")})`,
      order: "created_at.asc"
    }
  });
}

async function replaceAttachmentsService(
  recordId: string,
  attachments: MistakeRecord["attachments"] | KnowledgeRecord["attachments"]
) {
  await supabaseRestRequest("attachments", {
    method: "DELETE",
    searchParams: {
      record_id: `eq.${recordId}`
    }
  });

  if (attachments.length === 0) {
    return;
  }

  await upsertAttachmentsService(recordId, attachments);
}

async function upsertAttachmentsService(
  recordId: string,
  attachments: MistakeRecord["attachments"] | KnowledgeRecord["attachments"]
) {
  const rows = attachments.map((attachment) => mapAttachmentToDbRow(recordId, attachment));

  await supabaseRestRequest<DbAttachmentRow[]>("attachments", {
    method: "POST",
    body: rows,
    preferRepresentation: true
  });
}
