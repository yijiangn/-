import type { KnowledgeContentType, KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeImportance, MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask, TaskBucket, TaskStatus } from "@/features/tasks/types";
import type { SubjectKey } from "@/lib/constants/subjects";

export type SearchScope = "all" | "task" | "mistake" | "knowledge";

export type SearchArchiveView = "active" | "archived" | "all";

export type TaskSearchType = "task_today" | "task_long_term";

export type SearchContentType = "all" | TaskSearchType | "mistake" | KnowledgeContentType;

export type SearchImportanceFilter = "all" | MistakeImportance;

export interface GlobalSearchFilters {
  query: string;
  scope: SearchScope;
  subjectKey: SubjectKey | "all";
  tag: string | "all";
  contentType: SearchContentType;
  archiveView: SearchArchiveView;
  source: string | "all";
  importance: SearchImportanceFilter;
}

interface BaseSearchRecord {
  id: string;
  kind: "task" | "mistake" | "knowledge";
  title: string;
  subjectKey: SubjectKey;
  tags: string[];
  preview: string;
  archivedAt?: string | null;
  updatedAt: string;
  source?: string;
  importance?: 1 | 2 | 3 | 4 | 5;
  route: "/tasks" | "/mistakes" | "/knowledge";
  typeValue: Exclude<SearchContentType, "all">;
  typeLabel: string;
}

export interface TaskSearchRecord extends BaseSearchRecord {
  kind: "task";
  raw: StudyTask;
  bucket: TaskBucket;
  status: TaskStatus;
  progress: number;
  stepLabel: string;
  typeValue: TaskSearchType;
}

export interface MistakeSearchRecord extends BaseSearchRecord {
  kind: "mistake";
  raw: MistakeRecord;
  importance: MistakeImportance;
  source: string;
  typeValue: "mistake";
}

export interface KnowledgeSearchRecord extends BaseSearchRecord {
  kind: "knowledge";
  raw: KnowledgeRecord;
  typeValue: KnowledgeContentType;
}

export type UnifiedSearchRecord = TaskSearchRecord | MistakeSearchRecord | KnowledgeSearchRecord;
