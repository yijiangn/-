import type { SubjectKey } from "@/lib/constants/subjects";

export type MistakeImportance = 1 | 2 | 3 | 4 | 5;

export type MistakeArchiveView = "active" | "archived" | "all";

export interface MistakeAttachment {
  id: string;
  label: string;
  kind: "screenshot" | "photo" | "file";
  tone: "emerald" | "sky" | "amber" | "rose" | "slate";
  storagePath?: string | null;
  publicUrl?: string | null;
}

export interface MistakeRecord {
  id: string;
  title: string;
  subjectKey: SubjectKey;
  chapter?: string;
  importance: MistakeImportance;
  source: string;
  content: string;
  caution: string;
  tags: string[];
  attachments: MistakeAttachment[];
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MistakeFilters {
  query: string;
  subjectKey: SubjectKey | "all";
  importance: MistakeImportance | "all";
  source: string | "all";
  tag: string | "all";
  archiveView: MistakeArchiveView;
}
