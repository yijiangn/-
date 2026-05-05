import type { SubjectKey } from "@/lib/constants/subjects";

export type KnowledgeContentType =
  | "concept"
  | "formula"
  | "problem_pattern"
  | "word"
  | "phrase"
  | "essay_material"
  | "high_freq_point"
  | "question_type";

export type KnowledgeArchiveView = "active" | "archived" | "all";

export interface KnowledgeAttachment {
  id: string;
  label: string;
  kind: "screenshot" | "photo" | "file";
  tone: "emerald" | "sky" | "amber" | "rose" | "slate";
  storagePath?: string | null;
  publicUrl?: string | null;
}

export interface KnowledgeRecord {
  id: string;
  title: string;
  subjectKey: SubjectKey;
  contentType: KnowledgeContentType;
  chapter?: string;
  source?: string;
  importance?: 1 | 2 | 3 | 4 | 5;
  summary: string;
  content: string;
  reviewTip: string;
  tags: string[];
  attachments: KnowledgeAttachment[];
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeFilters {
  query: string;
  subjectKey: SubjectKey | "all";
  contentType: KnowledgeContentType | "all";
  tag: string | "all";
  archiveView: KnowledgeArchiveView;
}
