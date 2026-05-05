import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask, TaskFormValues } from "@/features/tasks/types";
import type { SubjectKey } from "@/lib/constants/subjects";

type ValidationFailure = {
  success: false;
  message: string;
};

type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationResult<T> = ValidationFailure | ValidationSuccess<T>;

const subjectKeys = ["math", "english", "cs408"] as const satisfies SubjectKey[];
const taskStatuses = ["not_started", "in_progress", "delayed", "completed"] as const;
const taskBuckets = ["today", "long_term"] as const;
const importanceLevels = [1, 2, 3, 4, 5] as const;
const knowledgeContentTypes = [
  "concept",
  "formula",
  "problem_pattern",
  "word",
  "phrase",
  "essay_material",
  "high_freq_point",
  "question_type"
] as const;
const attachmentKinds = ["screenshot", "photo", "file"] as const;
const attachmentTones = ["emerald", "sky", "amber", "rose", "slate"] as const;

function ok<T>(data: T): ValidationSuccess<T> {
  return { success: true, data };
}

function fail<T>(message: string): ValidationResult<T> {
  return { success: false, message };
}

function isOneOf<T extends string | number>(value: unknown, options: readonly T[]): value is T {
  return options.includes(value as T);
}

function asRequiredString(value: unknown, fieldLabel: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return fail<string>(`${fieldLabel}不能为空。`);
  }

  return ok(value.trim());
}

function asOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function asOptionalNullableString(value: unknown) {
  if (value == null) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asSafeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function asProgress(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fail<number>("任务进度必须是 0 到 100 之间的数字。");
  }

  const normalized = Math.round(value);

  if (normalized < 0 || normalized > 100) {
    return fail<number>("任务进度必须在 0 到 100 之间。");
  }

  return ok(normalized);
}

function validateTaskSteps(value: unknown, currentStep: unknown) {
  const steps = asSafeStringArray(value);

  if (steps.length === 0) {
    return fail<{ steps: string[]; currentStep: number }>("任务步骤至少需要保留一项。");
  }

  if (typeof currentStep !== "number" || !Number.isInteger(currentStep) || currentStep < 0 || currentStep >= steps.length) {
    return fail<{ steps: string[]; currentStep: number }>("当前任务步骤索引无效。");
  }

  return ok({ steps, currentStep });
}

function validateAttachment(input: unknown): ValidationResult<MistakeRecord["attachments"][number]> {
  if (!input || typeof input !== "object") {
    return fail<MistakeRecord["attachments"][number]>("附件数据无效。");
  }

  const candidate = input as Record<string, unknown>;
  const idResult = asRequiredString(candidate.id, "附件 ID");
  if (!idResult.success) {
    return fail<MistakeRecord["attachments"][number]>(idResult.message);
  }

  const labelResult = asRequiredString(candidate.label, "附件名称");
  if (!labelResult.success) {
    return fail<MistakeRecord["attachments"][number]>(labelResult.message);
  }

  if (!isOneOf(candidate.kind, attachmentKinds)) {
    return fail("附件类型无效。");
  }

  if (!isOneOf(candidate.tone, attachmentTones)) {
    return fail("附件配色无效。");
  }

  return ok({
    id: idResult.data,
    label: labelResult.data,
    kind: candidate.kind,
    tone: candidate.tone
  });
}

function validateAttachments(value: unknown): ValidationResult<MistakeRecord["attachments"]> {
  if (!Array.isArray(value)) {
    return fail<MistakeRecord["attachments"]>("附件列表格式无效。");
  }

  const attachments: MistakeRecord["attachments"] = [];

  for (const item of value) {
    const result = validateAttachment(item);
    if (!result.success) {
      return result;
    }

    attachments.push(result.data);
  }

  return ok(attachments);
}

export function validateTaskFormValues(input: TaskFormValues): ValidationResult<TaskFormValues> {
  const titleResult = asRequiredString(input.title, "任务名称");
  if (!titleResult.success) {
    return titleResult;
  }

  if (!isOneOf(input.subjectKey, subjectKeys)) {
    return fail("任务科目无效。");
  }

  if (!isOneOf(input.bucket, taskBuckets)) {
    return fail("任务类型无效。");
  }

  if (!isOneOf(input.status, taskStatuses)) {
    return fail("任务状态无效。");
  }

  const progressResult = asProgress(input.progress);
  if (!progressResult.success) {
    return progressResult;
  }

  return ok({
    ...input,
    title: titleResult.data,
    progress: progressResult.data,
    focus: asOptionalString(input.focus),
    note: asOptionalString(input.note),
    estimateLabel: asOptionalString(input.estimateLabel),
    deadlineLabel: asOptionalString(input.deadlineLabel)
  });
}

export function validateTaskPayload(input: unknown): ValidationResult<StudyTask> {
  if (!input || typeof input !== "object") {
    return fail("任务数据格式无效。");
  }

  const candidate = input as Record<string, unknown>;
  const idResult = asRequiredString(candidate.id, "任务 ID");
  if (!idResult.success) {
    return idResult;
  }

  const titleResult = asRequiredString(candidate.title, "任务名称");
  if (!titleResult.success) {
    return titleResult;
  }

  if (!isOneOf(candidate.subjectKey, subjectKeys)) {
    return fail("任务科目无效。");
  }

  if (!isOneOf(candidate.bucket, taskBuckets)) {
    return fail("任务类型无效。");
  }

  if (!isOneOf(candidate.status, taskStatuses)) {
    return fail("任务状态无效。");
  }

  const progressResult = asProgress(candidate.progress);
  if (!progressResult.success) {
    return progressResult;
  }

  const stepsResult = validateTaskSteps(candidate.steps, candidate.currentStep);
  if (!stepsResult.success) {
    return stepsResult;
  }

  const createdAtResult = asRequiredString(candidate.createdAt, "创建时间");
  if (!createdAtResult.success) {
    return createdAtResult;
  }

  return ok({
    id: idResult.data,
    title: titleResult.data,
    subjectKey: candidate.subjectKey,
    bucket: candidate.bucket,
    status: candidate.status,
    progress: progressResult.data,
    steps: stepsResult.data.steps,
    currentStep: stepsResult.data.currentStep,
    focus: asOptionalString(candidate.focus),
    note: asOptionalString(candidate.note) || undefined,
    estimateLabel: asOptionalString(candidate.estimateLabel) || undefined,
    deadlineLabel: asOptionalString(candidate.deadlineLabel) || undefined,
    archivedAt: asOptionalNullableString(candidate.archivedAt),
    createdAt: createdAtResult.data
  });
}

export function validateMistakeRecord(input: unknown): ValidationResult<MistakeRecord> {
  if (!input || typeof input !== "object") {
    return fail("错题数据格式无效。");
  }

  const candidate = input as Record<string, unknown>;
  const idResult = asRequiredString(candidate.id, "错题 ID");
  if (!idResult.success) {
    return idResult;
  }

  const titleResult = asRequiredString(candidate.title, "错题标题");
  if (!titleResult.success) {
    return titleResult;
  }

  if (!isOneOf(candidate.subjectKey, subjectKeys)) {
    return fail("错题科目无效。");
  }

  if (!isOneOf(candidate.importance, importanceLevels)) {
    return fail("错题重要程度无效。");
  }

  const sourceResult = asRequiredString(candidate.source, "错题来源");
  if (!sourceResult.success) {
    return sourceResult;
  }

  const contentResult = asRequiredString(candidate.content, "错题内容");
  if (!contentResult.success) {
    return contentResult;
  }

  const cautionResult = asRequiredString(candidate.caution, "注意事项");
  if (!cautionResult.success) {
    return cautionResult;
  }

  const createdAtResult = asRequiredString(candidate.createdAt, "创建时间");
  if (!createdAtResult.success) {
    return createdAtResult;
  }

  const updatedAtResult = asRequiredString(candidate.updatedAt, "更新时间");
  if (!updatedAtResult.success) {
    return updatedAtResult;
  }

  const attachmentsResult = validateAttachments(candidate.attachments);
  if (!attachmentsResult.success) {
    return attachmentsResult;
  }

  return ok({
    id: idResult.data,
    title: titleResult.data,
    subjectKey: candidate.subjectKey,
    chapter: asOptionalString(candidate.chapter) || undefined,
    importance: candidate.importance,
    source: sourceResult.data,
    content: contentResult.data,
    caution: cautionResult.data,
    tags: asSafeStringArray(candidate.tags),
    attachments: attachmentsResult.data,
    archivedAt: asOptionalNullableString(candidate.archivedAt),
    createdAt: createdAtResult.data,
    updatedAt: updatedAtResult.data
  });
}

export function validateKnowledgeRecord(input: unknown): ValidationResult<KnowledgeRecord> {
  if (!input || typeof input !== "object") {
    return fail("知识点数据格式无效。");
  }

  const candidate = input as Record<string, unknown>;
  const idResult = asRequiredString(candidate.id, "知识点 ID");
  if (!idResult.success) {
    return idResult;
  }

  const titleResult = asRequiredString(candidate.title, "知识点标题");
  if (!titleResult.success) {
    return titleResult;
  }

  if (!isOneOf(candidate.subjectKey, subjectKeys)) {
    return fail("知识点科目无效。");
  }

  if (!isOneOf(candidate.contentType, knowledgeContentTypes)) {
    return fail("知识点类型无效。");
  }

  if (candidate.importance != null && !isOneOf(candidate.importance, importanceLevels)) {
    return fail("知识点重要程度无效。");
  }

  const summaryResult = asRequiredString(candidate.summary, "摘要");
  if (!summaryResult.success) {
    return summaryResult;
  }

  const contentResult = asRequiredString(candidate.content, "正文内容");
  if (!contentResult.success) {
    return contentResult;
  }

  const reviewTipResult = asRequiredString(candidate.reviewTip, "复盘提示");
  if (!reviewTipResult.success) {
    return reviewTipResult;
  }

  const createdAtResult = asRequiredString(candidate.createdAt, "创建时间");
  if (!createdAtResult.success) {
    return createdAtResult;
  }

  const updatedAtResult = asRequiredString(candidate.updatedAt, "更新时间");
  if (!updatedAtResult.success) {
    return updatedAtResult;
  }

  const attachmentsResult = validateAttachments(candidate.attachments);
  if (!attachmentsResult.success) {
    return attachmentsResult;
  }

  return ok({
    id: idResult.data,
    title: titleResult.data,
    subjectKey: candidate.subjectKey,
    contentType: candidate.contentType,
    chapter: asOptionalString(candidate.chapter) || undefined,
    source: asOptionalString(candidate.source) || undefined,
    importance: isOneOf(candidate.importance, importanceLevels) ? candidate.importance : undefined,
    summary: summaryResult.data,
    content: contentResult.data,
    reviewTip: reviewTipResult.data,
    tags: asSafeStringArray(candidate.tags),
    attachments: attachmentsResult.data,
    archivedAt: asOptionalNullableString(candidate.archivedAt),
    createdAt: createdAtResult.data,
    updatedAt: updatedAtResult.data
  });
}
