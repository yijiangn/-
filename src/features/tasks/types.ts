import type { SubjectKey } from "@/lib/constants/subjects";

export type TaskStatus = "not_started" | "in_progress" | "delayed" | "completed";

export type TaskBucket = "today" | "long_term";

export type ArchiveView = "active" | "archived" | "all";

export interface StudyTask {
  id: string;
  title: string;
  subjectKey: SubjectKey;
  bucket: TaskBucket;
  status: TaskStatus;
  progress: number;
  steps: string[];
  currentStep: number;
  focus: string;
  note?: string;
  estimateLabel?: string;
  deadlineLabel?: string;
  archivedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface TaskFilters {
  query: string;
  bucket: TaskBucket | "all";
  subjectKey: SubjectKey | "all";
  status: TaskStatus | "all";
  archiveView: ArchiveView;
}

export interface TaskFormValues {
  title: string;
  subjectKey: SubjectKey;
  bucket: TaskBucket;
  status: TaskStatus;
  progress: number;
  focus: string;
  note: string;
  estimateLabel: string;
  deadlineLabel: string;
}
