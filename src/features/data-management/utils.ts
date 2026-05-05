import type { KnowledgeAttachment, KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeAttachment, MistakeImportance, MistakeRecord } from "@/features/mistakes/types";
import { type GlobalSearchFilters, type UnifiedSearchRecord } from "@/features/search/types";
import { buildUnifiedSearchRecords, defaultGlobalSearchFilters, filterSearchRecords, searchResultKindLabelMap } from "@/features/search/utils";
import type { StudyTask, TaskBucket, TaskStatus } from "@/features/tasks/types";
import { normalizeTask } from "@/features/tasks/utils";
import type { DataCollections, ExportConfig, ExportPayload, ImportApplyResult, ImportPreviewItem, ImportTarget } from "@/features/data-management/types";
import { subjectMetaMap, subjectMetas, type SubjectKey } from "@/lib/constants/subjects";
import { validateKnowledgeRecord, validateMistakeRecord, validateTaskPayload } from "@/lib/validation";

export const defaultExportConfig: ExportConfig = {
  format: "markdown",
  fileName: "kaoyan-study-export",
  filters: { ...defaultGlobalSearchFilters }
};

export const importTargetOptions: Array<{ value: ImportTarget; label: string; description: string }> = [
  { value: "task", label: "任务", description: "适合导入计划清单、CSV 模板和文本草稿" },
  { value: "mistake", label: "错题", description: "适合导入错题文本、截图、图片和基础文件" },
  { value: "knowledge", label: "知识点", description: "适合导入知识点文本、公式、单词、作文素材和文件" }
];

export function buildExportRecords(collections: DataCollections, filters: GlobalSearchFilters) {
  const records = buildUnifiedSearchRecords(collections.tasks, collections.mistakes, collections.knowledge);
  return filterSearchRecords(records, filters);
}

export function downloadExportFile(payload: ExportPayload) {
  const fileNameBase = sanitizeFileName(payload.config.fileName || "kaoyan-study-export");
  const extension = payload.config.format === "markdown" ? "md" : "csv";
  const mimeType = payload.config.format === "markdown" ? "text/markdown;charset=utf-8" : "text/csv;charset=utf-8";
  const content = payload.config.format === "markdown" ? buildMarkdownExport(payload.records, payload.config.filters) : buildCsvExport(payload.records);

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileNameBase}.${extension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function buildMarkdownExport(records: UnifiedSearchRecord[], filters: GlobalSearchFilters) {
  const lines: string[] = [];

  lines.push("---");
  lines.push(`exported_at: ${new Date().toISOString()}`);
  lines.push(`scope: ${filters.scope}`);
  lines.push(`subject: ${filters.subjectKey}`);
  lines.push(`archive: ${filters.archiveView}`);
  lines.push(`tag: ${filters.tag}`);
  lines.push(`type: ${filters.contentType}`);
  lines.push(`source: ${filters.source}`);
  lines.push(`importance: ${filters.importance}`);
  lines.push("---");
  lines.push("");
  lines.push("# 考研学习数据导出");
  lines.push("");

  const groupedByKind = groupBy(records, (record) => record.kind);

  Object.entries(groupedByKind).forEach(([kind, kindRecords]) => {
    lines.push(`## ${searchResultKindLabelMap[kind as keyof typeof searchResultKindLabelMap]}`);
    lines.push("");

    const groupedBySubject = groupBy(kindRecords, (record) => record.subjectKey);

    Object.entries(groupedBySubject).forEach(([subjectKey, subjectRecords]) => {
      lines.push(`### ${subjectMetaMap[subjectKey as SubjectKey].label}`);
      lines.push("");

      subjectRecords.forEach((record) => {
        lines.push(`#### ${record.typeLabel}｜${record.title}`);
        lines.push(`- 类型：${record.typeLabel}`);
        lines.push(`- 科目：${subjectMetaMap[record.subjectKey].label}`);
        if (record.source) {
          lines.push(`- 来源：${record.source}`);
        }
        if (record.importance) {
          lines.push(`- 重要程度：${record.importance}`);
        }
        lines.push(`- 是否归档：${record.archivedAt ? "是" : "否"}`);
        if (record.tags.length > 0) {
          lines.push(`- 标签：${record.tags.join("、")}`);
        }
        lines.push("");

        if (record.kind === "task") {
          lines.push("##### 执行重点");
          lines.push(record.raw.focus);
          lines.push("");
          lines.push("##### 进度");
          lines.push(`- 状态：${record.status}`);
          lines.push(`- 百分比：${record.progress}%`);
          lines.push(`- 当前步骤：${record.stepLabel}`);
          if (record.raw.note) {
            lines.push("");
            lines.push("##### 备注");
            lines.push(record.raw.note);
          }
        } else if (record.kind === "mistake") {
          lines.push("##### 错题内容");
          lines.push(record.raw.content);
          lines.push("");
          lines.push("##### 注意事项");
          lines.push(record.raw.caution);
          if (record.raw.attachments.length > 0) {
            lines.push("");
            lines.push("##### 附件");
            record.raw.attachments.forEach((attachment) => lines.push(`- ${attachment.label}`));
          }
        } else {
          lines.push("##### 摘要");
          lines.push(record.raw.summary);
          lines.push("");
          lines.push("##### 核心内容");
          lines.push(record.raw.content);
          lines.push("");
          lines.push("##### 记忆提示");
          lines.push(record.raw.reviewTip);
          if (record.raw.attachments.length > 0) {
            lines.push("");
            lines.push("##### 附件");
            record.raw.attachments.forEach((attachment) => lines.push(`- ${attachment.label}`));
          }
        }

        lines.push("");
      });
    });
  });

  return lines.join("\n");
}

export function buildCsvExport(records: UnifiedSearchRecord[]) {
  const rows = records.map((record) => {
    if (record.kind === "task") {
      return {
        id: record.id,
        kind: record.kind,
        subject: subjectMetaMap[record.subjectKey].label,
        type: record.typeLabel,
        title: record.title,
        summary: record.preview,
        content: record.raw.focus,
        note_or_tip: record.raw.note ?? "",
        source: "",
        importance: "",
        tags: "",
        status: record.status,
        bucket: record.bucket,
        progress: record.progress,
        step: record.stepLabel,
        archived: record.archivedAt ? "true" : "false",
        updated_at: record.updatedAt
      };
    }

    if (record.kind === "mistake") {
      return {
        id: record.id,
        kind: record.kind,
        subject: subjectMetaMap[record.subjectKey].label,
        type: record.typeLabel,
        title: record.title,
        summary: record.preview,
        content: record.raw.content,
        note_or_tip: record.raw.caution,
        source: record.source ?? "",
        importance: String(record.importance ?? ""),
        tags: record.tags.join("|"),
        status: "",
        bucket: "",
        progress: "",
        step: "",
        archived: record.archivedAt ? "true" : "false",
        updated_at: record.updatedAt
      };
    }

    return {
      id: record.id,
      kind: record.kind,
      subject: subjectMetaMap[record.subjectKey].label,
      type: record.typeLabel,
      title: record.title,
      summary: record.raw.summary,
      content: record.raw.content,
      note_or_tip: record.raw.reviewTip,
      source: record.source ?? "",
      importance: String(record.importance ?? ""),
      tags: record.tags.join("|"),
      status: "",
      bucket: "",
      progress: "",
      step: "",
      archived: record.archivedAt ? "true" : "false",
      updated_at: record.updatedAt
    };
  });

  const headers = Object.keys(rows[0] ?? {
    id: "",
    kind: "",
    subject: "",
    type: "",
    title: "",
    summary: "",
    content: "",
    note_or_tip: "",
    source: "",
    importance: "",
    tags: "",
    status: "",
    bucket: "",
    progress: "",
    step: "",
    archived: "",
    updated_at: ""
  });

  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsvValue(String(row[header as keyof typeof row] ?? ""))).join(","))].join("\n");
}

export async function buildImportPreview(target: ImportTarget, textInput: string, files: File[]) {
  const previewItems: ImportPreviewItem[] = [];

  if (textInput.trim()) {
    previewItems.push(createPreviewFromText(target, textInput.trim(), "手动文本输入", "text"));
  }

  for (const file of files) {
    const extension = getFileExtension(file.name);

    if (extension === "csv") {
      const text = await file.text();
      const csvItems = createPreviewFromCsv(target, text, file.name);
      previewItems.push(...csvItems);
      continue;
    }

    if (["txt", "md"].includes(extension)) {
      const text = await file.text();
      previewItems.push(createPreviewFromText(target, text, file.name, "text"));
      continue;
    }

    previewItems.push(createPreviewFromFile(target, file));
  }

  return previewItems;
}

export function applyImportPreview(previewItems: ImportPreviewItem[], collections: DataCollections): ImportApplyResult {
  const importedTasks: StudyTask[] = [];
  const importedMistakes: MistakeRecord[] = [];
  const importedKnowledge: KnowledgeRecord[] = [];

  previewItems.forEach((item) => {
    if (!item.payload) {
      return;
    }

    if (item.target === "task") {
      const validation = validateTaskPayload(item.payload);
      if (validation.success) {
        importedTasks.push(normalizeTask(validation.data));
      }
      return;
    }

    if (item.target === "mistake") {
      const validation = validateMistakeRecord(item.payload);
      if (validation.success) {
        importedMistakes.push(validation.data);
      }
      return;
    }

    const validation = validateKnowledgeRecord(item.payload);
    if (validation.success) {
      importedKnowledge.push(validation.data);
    }
  });

  return {
    tasks: [...importedTasks, ...collections.tasks],
    mistakes: [...importedMistakes, ...collections.mistakes],
    knowledge: [...importedKnowledge, ...collections.knowledge],
    importedCount: importedTasks.length + importedMistakes.length + importedKnowledge.length
  };
}

export function buildTaskTemplateCsv() {
  return [
    "title,subject,bucket,status,progress,focus,note,estimate_label,deadline_label,steps,current_step,archived",
    "高数真题复盘,math,today,not_started,0,先完成真题再整理错因,可选备注,60 分钟,今晚 20:00,开始任务 > 处理中 > 整理复盘 > 完成,0,false"
  ].join("\n");
}

export function buildMistakeTemplateCsv() {
  return [
    "title,subject,chapter,importance,source,content,caution,tags,archived",
    "极限题误用洛必达,math,极限与连续,5,真题复盘,错题内容正文,注意事项正文,极限|洛必达|高频,false"
  ].join("\n");
}

export function buildKnowledgeTemplateCsv() {
  return [
    "title,subject,content_type,chapter,source,importance,summary,content,review_tip,tags,archived",
    "洛必达法则使用条件,math,formula,极限与连续,真题复盘卡片,5,一句摘要,正文内容,记忆提示,洛必达|公式|高频,false"
  ].join("\n");
}

function createPreviewFromText(target: ImportTarget, content: string, sourceLabel: string, sourceKind: ImportPreviewItem["sourceKind"]) {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = (lines[0] || `${getTargetLabel(target)}导入内容`).replace(/^#+\s*/, "");
  const body = lines.slice(1).join("\n") || content;

  return {
    id: createId("preview"),
    target,
    sourceKind,
    title,
    summary: body.slice(0, 120),
    tags: [],
    sourceLabel,
    warnings: [],
    payload: createPayloadFromText(target, title, body, sourceLabel)
  } satisfies ImportPreviewItem;
}

function createPreviewFromCsv(target: ImportTarget, csvText: string, sourceLabel: string) {
  const rows = parseCsv(csvText);

  return rows.map((row) => {
    const payload = createPayloadFromCsvRow(target, row, sourceLabel);

    return {
      id: createId("preview"),
      target,
      sourceKind: "csv",
      title: getStringField(row, "title") || `${getTargetLabel(target)} CSV 导入`,
      summary: getStringField(row, "summary") || getStringField(row, "content") || "CSV 导入预览",
      tags: splitTags(getStringField(row, "tags")),
      sourceLabel,
      warnings: payload ? [] : ["该行缺少必要字段，无法导入"],
      payload
    } satisfies ImportPreviewItem;
  });
}

function createPreviewFromFile(target: ImportTarget, file: File) {
  const extension = getFileExtension(file.name);
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(extension);
  const warnings = target === "task" ? ["任务不建议直接导入图片或基础文件，建议改为文本或 CSV。"] : [];

  return {
    id: createId("preview"),
    target,
    sourceKind: isImage ? "image" : "file",
    title: stripExtension(file.name),
    summary: `文件导入：${file.name}（${formatFileSize(file.size)}）`,
    tags: [],
    sourceLabel: file.name,
    warnings,
    payload: target === "task" ? null : createPayloadFromFile(target, file, isImage)
  } satisfies ImportPreviewItem;
}

function createPayloadFromText(target: ImportTarget, title: string, body: string, sourceLabel: string) {
  if (target === "task") {
    return normalizeTask({
      id: createId("task"),
      title,
      subjectKey: "math",
      bucket: "today",
      status: "not_started",
      progress: 0,
      steps: ["开始任务", "处理中", "整理复盘", "完成"],
      currentStep: 0,
      focus: body.slice(0, 140) || "导入文本任务",
      note: `导入来源：${sourceLabel}`,
      estimateLabel: "待安排",
      deadlineLabel: "待安排",
      archivedAt: null,
      createdAt: new Date().toISOString()
    } satisfies StudyTask);
  }

  if (target === "mistake") {
    return {
      id: createId("mistake"),
      title,
      subjectKey: "math",
      chapter: undefined,
      importance: 3,
      source: sourceLabel,
      content: body,
      caution: "导入后请补充注意事项和错因。",
      tags: [],
      attachments: [],
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } satisfies MistakeRecord;
  }

  return {
    id: createId("knowledge"),
    title,
    subjectKey: "math",
    contentType: "concept",
    chapter: undefined,
    source: sourceLabel,
    importance: 3,
    summary: body.slice(0, 90) || title,
    content: body,
    reviewTip: "导入后请补充记忆提示和标签。",
    tags: [],
    attachments: [],
    archivedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } satisfies KnowledgeRecord;
}

function createPayloadFromCsvRow(target: ImportTarget, row: Record<string, string>, sourceLabel: string) {
  if (target === "task") {
    const title = getStringField(row, "title");

    if (!title) {
      return null;
    }

    const subjectKey = parseSubjectKey(getStringField(row, "subject")) ?? "math";
    const bucket = parseTaskBucket(getStringField(row, "bucket")) ?? "today";
    const status = parseTaskStatus(getStringField(row, "status")) ?? "not_started";
    const steps = splitSteps(getStringField(row, "steps"));
    const currentStep = Math.max(0, Number(getStringField(row, "current_step") || 0));

    return normalizeTask({
      id: createId("task"),
      title,
      subjectKey,
      bucket,
      status,
      progress: Number(getStringField(row, "progress") || 0),
      steps: steps.length > 0 ? steps : ["开始任务", "处理中", "整理复盘", "完成"],
      currentStep,
      focus: getStringField(row, "focus") || "CSV 导入任务",
      note: getStringField(row, "note") || `导入来源：${sourceLabel}`,
      estimateLabel: getStringField(row, "estimate_label") || undefined,
      deadlineLabel: getStringField(row, "deadline_label") || undefined,
      archivedAt: parseBoolean(getStringField(row, "archived")) ? new Date().toISOString() : null,
      createdAt: new Date().toISOString()
    } satisfies StudyTask);
  }

  if (target === "mistake") {
    const title = getStringField(row, "title");
    const content = getStringField(row, "content");

    if (!title || !content) {
      return null;
    }

    return {
      id: createId("mistake"),
      title,
      subjectKey: parseSubjectKey(getStringField(row, "subject")) ?? "math",
      chapter: getStringField(row, "chapter") || undefined,
      importance: parseImportance(getStringField(row, "importance")) ?? 3,
      source: getStringField(row, "source") || sourceLabel,
      content,
      caution: getStringField(row, "caution") || "导入后请补充注意事项。",
      tags: splitTags(getStringField(row, "tags")),
      attachments: [],
      archivedAt: parseBoolean(getStringField(row, "archived")) ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } satisfies MistakeRecord;
  }

  const title = getStringField(row, "title");
  const content = getStringField(row, "content");

  if (!title || !content) {
    return null;
  }

  return {
    id: createId("knowledge"),
    title,
    subjectKey: parseSubjectKey(getStringField(row, "subject")) ?? "math",
    contentType: parseKnowledgeType(getStringField(row, "content_type")) ?? "concept",
    chapter: getStringField(row, "chapter") || undefined,
    source: getStringField(row, "source") || sourceLabel,
    importance: parseImportance(getStringField(row, "importance")) ?? 3,
    summary: getStringField(row, "summary") || content.slice(0, 90),
    content,
    reviewTip: getStringField(row, "review_tip") || "导入后请补充记忆提示。",
    tags: splitTags(getStringField(row, "tags")),
    attachments: [],
    archivedAt: parseBoolean(getStringField(row, "archived")) ? new Date().toISOString() : null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } satisfies KnowledgeRecord;
}

function createPayloadFromFile(target: Exclude<ImportTarget, "task">, file: File, isImage: boolean) {
  const attachment = createAttachment(file, isImage ? (target === "mistake" ? "rose" : "sky") : "slate", isImage);

  if (target === "mistake") {
    return {
      id: createId("mistake"),
      title: stripExtension(file.name),
      subjectKey: "math",
      chapter: undefined,
      importance: 3,
      source: "文件导入",
      content: `从文件导入：${file.name}`,
      caution: "导入后请补充错题内容和注意事项。",
      tags: [],
      attachments: [attachment as MistakeAttachment],
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } satisfies MistakeRecord;
  }

  return {
    id: createId("knowledge"),
    title: stripExtension(file.name),
    subjectKey: "math",
    contentType: "concept",
    chapter: undefined,
    source: "文件导入",
    importance: 3,
    summary: `从文件导入：${file.name}`,
    content: `文件名：${file.name}`,
    reviewTip: "导入后请补充摘要、标签和记忆提示。",
    tags: [],
    attachments: [attachment as KnowledgeAttachment],
    archivedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  } satisfies KnowledgeRecord;
}

function createAttachment(file: File, tone: MistakeAttachment["tone"], isImage: boolean) {
  return {
    id: createId("attachment"),
    label: file.name,
    kind: isImage ? "photo" : "file",
    tone
  };
}

function groupBy<T, K extends string>(items: T[], getKey: (item: T) => K) {
  return items.reduce<Record<K, T[]>>((result, item) => {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

function escapeCsvValue(value: string) {
  const normalized = value.replace(/\r?\n/g, " ");
  if (/[",]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }
  return normalized;
}

function sanitizeFileName(fileName: string) {
  return fileName.trim().replace(/[\\/:*?"<>|]/g, "-") || "kaoyan-study-export";
}

function parseCsv(csvText: string) {
  const rows: string[][] = [];
  let currentValue = "";
  let currentRow: string[] = [];
  let isQuoted = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"') {
      if (isQuoted && nextChar === '"') {
        currentValue += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
      continue;
    }

    if (char === "," && !isQuoted) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !isQuoted) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentValue);
      if (currentRow.some((value) => value.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  const [headerRow, ...bodyRows] = rows;
  const headers = (headerRow || []).map((header) => header.trim());

  return bodyRows
    .filter((row) => row.some((value) => value.trim() !== ""))
    .map((row) =>
      headers.reduce<Record<string, string>>((result, header, index) => {
        result[header] = row[index]?.trim() ?? "";
        return result;
      }, {})
    );
}

function getStringField(row: Record<string, string>, key: string) {
  return row[key]?.trim() || "";
}

function splitTags(rawValue: string) {
  return rawValue
    .split(/[|,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function splitSteps(rawValue: string) {
  return rawValue
    .split(/>|＞|→/)
    .map((step) => step.trim())
    .filter(Boolean);
}

function parseSubjectKey(rawValue: string) {
  const normalized = rawValue.trim().toLowerCase();
  if (!normalized) return null;

  const match = subjectMetas.find(
    (subject) =>
      subject.key === normalized || subject.label === rawValue.trim() || subject.label.toLowerCase() === normalized
  );

  return match?.key ?? null;
}

function parseTaskBucket(rawValue: string): TaskBucket | null {
  if (rawValue === "today" || rawValue === "long_term") {
    return rawValue;
  }
  if (rawValue === "今日任务") return "today";
  if (rawValue === "长期任务") return "long_term";
  return null;
}

function parseTaskStatus(rawValue: string): TaskStatus | null {
  if (["not_started", "in_progress", "delayed", "completed"].includes(rawValue)) {
    return rawValue as TaskStatus;
  }
  if (rawValue === "未开始") return "not_started";
  if (rawValue === "进行中") return "in_progress";
  if (rawValue === "延期") return "delayed";
  if (rawValue === "已完成") return "completed";
  return null;
}

function parseImportance(rawValue: string): 1 | 2 | 3 | 4 | 5 | null {
  const numeric = Number(rawValue);
  if ([1, 2, 3, 4, 5].includes(numeric)) {
    return numeric as 1 | 2 | 3 | 4 | 5;
  }
  return null;
}

function parseKnowledgeType(rawValue: string) {
  const allowed = ["concept", "formula", "problem_pattern", "word", "phrase", "essay_material", "high_freq_point", "question_type"];
  return allowed.includes(rawValue) ? (rawValue as KnowledgeRecord["contentType"]) : null;
}

function parseBoolean(rawValue: string) {
  return ["true", "1", "yes", "是"].includes(rawValue.trim().toLowerCase());
}

function getTargetLabel(target: ImportTarget) {
  if (target === "task") return "任务";
  if (target === "mistake") return "错题";
  return "知识点";
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
