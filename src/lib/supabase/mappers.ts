import type { KnowledgeAttachment, KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeAttachment, MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask } from "@/features/tasks/types";
import type { DbAttachmentRow, DbStudyRecordRow, DbTaskRow } from "@/types/database";

export function mapTaskToDbRow(task: StudyTask): DbTaskRow {
  const now = new Date().toISOString();

  return {
    id: task.id,
    user_id: null,
    title: task.title,
    subject_key: task.subjectKey,
    bucket: task.bucket,
    status: task.status,
    progress: task.progress,
    steps: task.steps,
    current_step: task.currentStep,
    focus: task.focus,
    note: task.note ?? null,
    estimate_label: task.estimateLabel ?? null,
    deadline_label: task.deadlineLabel ?? null,
    archived_at: task.archivedAt ?? null,
    completed_at: task.completedAt ?? null,
    created_at: task.createdAt,
    updated_at: now
  };
}

export function mapDbRowToTask(row: DbTaskRow): StudyTask {
  return {
    id: row.id,
    title: row.title,
    subjectKey: row.subject_key,
    bucket: row.bucket,
    status: row.status,
    progress: row.progress,
    steps: row.steps,
    currentStep: row.current_step,
    focus: row.focus,
    note: row.note ?? undefined,
    estimateLabel: row.estimate_label ?? undefined,
    deadlineLabel: row.deadline_label ?? undefined,
    archivedAt: row.archived_at,
    completedAt: row.completed_at,
    createdAt: row.created_at
  };
}

export function mapMistakeToDbRow(record: MistakeRecord): DbStudyRecordRow {
  const now = new Date().toISOString();

  return {
    id: record.id,
    user_id: null,
    record_type: "mistake",
    title: record.title,
    subject_key: record.subjectKey,
    content_type: null,
    chapter: record.chapter ?? null,
    importance: record.importance,
    source: record.source,
    summary: null,
    content: record.content,
    review_tip: null,
    caution: record.caution,
    tags: record.tags,
    archived_at: record.archivedAt ?? null,
    created_at: record.createdAt,
    updated_at: now
  };
}

export function mapKnowledgeToDbRow(record: KnowledgeRecord): DbStudyRecordRow {
  const now = new Date().toISOString();

  return {
    id: record.id,
    user_id: null,
    record_type: "knowledge",
    title: record.title,
    subject_key: record.subjectKey,
    content_type: record.contentType,
    chapter: record.chapter ?? null,
    importance: record.importance ?? null,
    source: record.source ?? null,
    summary: record.summary,
    content: record.content,
    review_tip: record.reviewTip,
    caution: null,
    tags: record.tags,
    archived_at: record.archivedAt ?? null,
    created_at: record.createdAt,
    updated_at: now
  };
}

export function mapMistakeFromDbRow(row: DbStudyRecordRow, attachments: DbAttachmentRow[]): MistakeRecord {
  return {
    id: row.id,
    title: row.title,
    subjectKey: row.subject_key,
    chapter: row.chapter ?? undefined,
    importance: row.importance ?? 3,
    source: row.source ?? "未标注来源",
    content: row.content,
    caution: row.caution ?? "",
    tags: row.tags ?? [],
    attachments: attachments.map(mapDbAttachmentToMistakeAttachment),
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapKnowledgeFromDbRow(row: DbStudyRecordRow, attachments: DbAttachmentRow[]): KnowledgeRecord {
  return {
    id: row.id,
    title: row.title,
    subjectKey: row.subject_key,
    contentType: (row.content_type as KnowledgeRecord["contentType"]) ?? "concept",
    chapter: row.chapter ?? undefined,
    source: row.source ?? undefined,
    importance: row.importance ?? undefined,
    summary: row.summary ?? "",
    content: row.content,
    reviewTip: row.review_tip ?? "",
    tags: row.tags ?? [],
    attachments: attachments.map(mapDbAttachmentToKnowledgeAttachment),
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function mapAttachmentToDbRow(
  recordId: string,
  attachment: MistakeAttachment | KnowledgeAttachment,
  upload?: { path: string; publicUrl: string }
): DbAttachmentRow {
  return {
    id: attachment.id,
    user_id: null,
    record_id: recordId,
    label: attachment.label,
    kind: attachment.kind,
    tone: attachment.tone,
    storage_path: upload?.path ?? attachment.storagePath ?? null,
    public_url: upload?.publicUrl ?? attachment.publicUrl ?? null,
    created_at: new Date().toISOString()
  };
}

function mapDbAttachmentToMistakeAttachment(row: DbAttachmentRow): MistakeAttachment {
  return {
    id: row.id,
    label: row.label,
    kind: row.kind,
    tone: row.tone,
    storagePath: row.storage_path,
    publicUrl: row.public_url
  };
}

function mapDbAttachmentToKnowledgeAttachment(row: DbAttachmentRow): KnowledgeAttachment {
  return {
    id: row.id,
    label: row.label,
    kind: row.kind,
    tone: row.tone,
    storagePath: row.storage_path,
    publicUrl: row.public_url
  };
}
