export type DbSubjectKey = "math" | "english" | "cs408";
export type DbTaskBucket = "today" | "long_term";
export type DbTaskStatus = "not_started" | "in_progress" | "delayed" | "completed";
export type DbRecordType = "mistake" | "knowledge";

export interface DbTaskRow {
  id: string;
  user_id: string | null;
  title: string;
  subject_key: DbSubjectKey;
  bucket: DbTaskBucket;
  status: DbTaskStatus;
  progress: number;
  steps: string[];
  current_step: number;
  focus: string;
  note: string | null;
  estimate_label: string | null;
  deadline_label: string | null;
  archived_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbStudyRecordRow {
  id: string;
  user_id: string | null;
  record_type: DbRecordType;
  title: string;
  subject_key: DbSubjectKey;
  content_type: string | null;
  chapter: string | null;
  importance: 1 | 2 | 3 | 4 | 5 | null;
  source: string | null;
  summary: string | null;
  content: string;
  review_tip: string | null;
  caution: string | null;
  tags: string[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbAttachmentRow {
  id: string;
  user_id: string | null;
  record_id: string;
  label: string;
  kind: "screenshot" | "photo" | "file";
  tone: "emerald" | "sky" | "amber" | "rose" | "slate";
  storage_path: string | null;
  public_url: string | null;
  created_at: string;
}
