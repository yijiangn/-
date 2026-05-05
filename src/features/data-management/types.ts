import type { KnowledgeRecord } from "@/features/knowledge/types";
import type { MistakeRecord } from "@/features/mistakes/types";
import type { GlobalSearchFilters, UnifiedSearchRecord } from "@/features/search/types";
import type { StudyTask } from "@/features/tasks/types";

export type DataManagementTab = "export" | "import";

export type ExportFormat = "markdown" | "csv";

export type ImportTarget = "task" | "mistake" | "knowledge";

export type ImportSourceKind = "text" | "csv" | "image" | "file";

export interface ExportConfig {
  format: ExportFormat;
  fileName: string;
  filters: GlobalSearchFilters;
}

export interface ImportPreviewItem {
  id: string;
  target: ImportTarget;
  sourceKind: ImportSourceKind;
  title: string;
  summary: string;
  tags: string[];
  sourceLabel: string;
  warnings: string[];
  payload: StudyTask | MistakeRecord | KnowledgeRecord | null;
}

export interface ImportApplyResult {
  tasks: StudyTask[];
  mistakes: MistakeRecord[];
  knowledge: KnowledgeRecord[];
  importedCount: number;
}

export interface DataCollections {
  tasks: StudyTask[];
  mistakes: MistakeRecord[];
  knowledge: KnowledgeRecord[];
}

export interface ExportPayload {
  config: ExportConfig;
  records: UnifiedSearchRecord[];
}
