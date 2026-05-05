import { knowledgeContentTypeLabelMap } from "@/features/knowledge/utils";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeImportance, MistakeRecord } from "@/features/mistakes/types";
import { mistakeImportanceLabelMap } from "@/features/mistakes/utils";
import type { GlobalSearchFilters, SearchContentType, SearchImportanceFilter, SearchScope, TaskSearchType, UnifiedSearchRecord } from "@/features/search/types";
import type { StudyTask } from "@/features/tasks/types";
import { getTaskStepLabel, taskBucketLabelMap } from "@/features/tasks/utils";

export const defaultGlobalSearchFilters: GlobalSearchFilters = {
  query: "",
  scope: "all",
  subjectKey: "all",
  tag: "all",
  contentType: "all",
  archiveView: "active",
  source: "all",
  importance: "all"
};

export const searchScopeOptions: Array<{ value: SearchScope; label: string }> = [
  { value: "all", label: "全部" },
  { value: "task", label: "任务" },
  { value: "mistake", label: "错题" },
  { value: "knowledge", label: "知识点" }
];

export const searchContentTypeOptions: Array<{ value: SearchContentType; label: string }> = [
  { value: "all", label: "全部类型" },
  { value: "task_today", label: "今日任务" },
  { value: "task_long_term", label: "长期任务" },
  { value: "mistake", label: "错题" },
  { value: "concept", label: "知识点" },
  { value: "formula", label: "公式" },
  { value: "problem_pattern", label: "题型" },
  { value: "word", label: "单词" },
  { value: "phrase", label: "短语" },
  { value: "essay_material", label: "作文素材" },
  { value: "high_freq_point", label: "高频考点" },
  { value: "question_type", label: "题目类型" }
];

export const searchArchiveViewOptions = [
  { value: "active", label: "仅显示有效内容" },
  { value: "archived", label: "仅显示已归档" },
  { value: "all", label: "显示全部" }
] as const;

export const searchImportanceOptions: Array<{ value: SearchImportanceFilter; label: string }> = [
  { value: "all", label: "全部重要程度" },
  { value: 5, label: "5 - 核心必回看" },
  { value: 4, label: "4 - 高优先级" },
  { value: 3, label: "3 - 常规复盘" },
  { value: 2, label: "2 - 一般" },
  { value: 1, label: "1 - 低优先级" }
];

export const searchResultKindLabelMap = {
  task: "任务",
  mistake: "错题",
  knowledge: "知识点"
} as const;

export const searchImportanceLabelMap: Record<MistakeImportance, string> = mistakeImportanceLabelMap;

export function buildUnifiedSearchRecords(tasks: StudyTask[], mistakes: MistakeRecord[], knowledgeRecords: KnowledgeRecord[]): UnifiedSearchRecord[] {
  const taskRecords: UnifiedSearchRecord[] = tasks.map((task) => {
    const typeValue: TaskSearchType = task.bucket === "today" ? "task_today" : "task_long_term";

    return {
      id: task.id,
      kind: "task",
      title: task.title,
      subjectKey: task.subjectKey,
      tags: [],
      preview: task.focus,
      archivedAt: task.archivedAt,
      updatedAt: task.createdAt,
      route: "/tasks",
      typeValue,
      typeLabel: taskBucketLabelMap[task.bucket],
      raw: task,
      bucket: task.bucket,
      status: task.status,
      progress: task.progress,
      stepLabel: getTaskStepLabel(task)
    };
  });

  const mistakeRecords: UnifiedSearchRecord[] = mistakes.map((record) => ({
    id: record.id,
    kind: "mistake",
    title: record.title,
    subjectKey: record.subjectKey,
    tags: record.tags,
    preview: record.content,
    archivedAt: record.archivedAt,
    updatedAt: record.updatedAt,
    route: "/mistakes",
    typeValue: "mistake",
    typeLabel: "错题",
    raw: record,
    source: record.source,
    importance: record.importance
  }));

  const normalizedKnowledgeRecords: UnifiedSearchRecord[] = knowledgeRecords.map((record) => ({
    id: record.id,
    kind: "knowledge",
    title: record.title,
    subjectKey: record.subjectKey,
    tags: record.tags,
    preview: record.summary,
    archivedAt: record.archivedAt,
    updatedAt: record.updatedAt,
    route: "/knowledge",
    typeValue: record.contentType,
    typeLabel: knowledgeContentTypeLabelMap[record.contentType],
    raw: record,
    source: record.source,
    importance: record.importance
  }));

  return [...taskRecords, ...mistakeRecords, ...normalizedKnowledgeRecords];
}

export function filterSearchRecords(records: UnifiedSearchRecord[], filters: GlobalSearchFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return records
    .filter((record) => {
      if (filters.scope !== "all" && record.kind !== filters.scope) {
        return false;
      }

      if (filters.archiveView === "active" && record.archivedAt) {
        return false;
      }

      if (filters.archiveView === "archived" && !record.archivedAt) {
        return false;
      }

      if (filters.subjectKey !== "all" && record.subjectKey !== filters.subjectKey) {
        return false;
      }

      if (filters.tag !== "all" && !record.tags.includes(filters.tag)) {
        return false;
      }

      if (filters.contentType !== "all" && record.typeValue !== filters.contentType) {
        return false;
      }

      if (filters.source !== "all" && record.source !== filters.source) {
        return false;
      }

      if (filters.importance !== "all" && record.importance !== filters.importance) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return getSearchableValues(record).some((value) => value.toLowerCase().includes(normalizedQuery));
    })
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function getSearchableValues(record: UnifiedSearchRecord) {
  if (record.kind === "task") {
    return [
      record.title,
      record.raw.focus,
      record.raw.note,
      record.raw.deadlineLabel,
      record.raw.estimateLabel,
      ...record.raw.steps
    ].filter((value): value is string => Boolean(value));
  }

  if (record.kind === "mistake") {
    return [
      record.title,
      record.raw.chapter,
      record.raw.source,
      record.raw.content,
      record.raw.caution,
      ...record.tags
    ].filter((value): value is string => Boolean(value));
  }

  return [
    record.title,
    record.raw.chapter,
    record.raw.source,
    record.raw.summary,
    record.raw.content,
    record.raw.reviewTip,
    ...record.tags
  ].filter((value): value is string => Boolean(value));
}

export function getAvailableSearchTags(records: UnifiedSearchRecord[]) {
  return Array.from(new Set(records.flatMap((record) => record.tags))).sort((left, right) => left.localeCompare(right, "zh-CN"));
}

export function getAvailableSearchSources(records: UnifiedSearchRecord[]) {
  return Array.from(new Set(records.map((record) => record.source).filter((value): value is string => Boolean(value)))).sort(
    (left, right) => left.localeCompare(right, "zh-CN")
  );
}

export function calculateSearchOverview(records: UnifiedSearchRecord[], filteredRecords: UnifiedSearchRecord[], filters: GlobalSearchFilters) {
  const activeFilterCount = [
    filters.query,
    filters.scope !== "all" ? filters.scope : null,
    filters.subjectKey !== "all" ? filters.subjectKey : null,
    filters.tag !== "all" ? filters.tag : null,
    filters.contentType !== "all" ? filters.contentType : null,
    filters.archiveView !== "active" ? filters.archiveView : null,
    filters.source !== "all" ? filters.source : null,
    filters.importance !== "all" ? String(filters.importance) : null
  ].filter(Boolean).length;

  return {
    totalCount: records.length,
    filteredCount: filteredRecords.length,
    activeFilterCount,
    taskCount: filteredRecords.filter((record) => record.kind === "task").length,
    mistakeCount: filteredRecords.filter((record) => record.kind === "mistake").length,
    knowledgeCount: filteredRecords.filter((record) => record.kind === "knowledge").length
  };
}

export function buildSearchSections(records: UnifiedSearchRecord[]) {
  const order: Array<UnifiedSearchRecord["kind"]> = ["task", "mistake", "knowledge"];

  return order
    .map((kind) => ({
      kind,
      label: searchResultKindLabelMap[kind],
      records: records.filter((record) => record.kind === kind)
    }))
    .filter((section) => section.records.length > 0);
}
