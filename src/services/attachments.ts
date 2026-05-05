import type { KnowledgeAttachment } from "@/features/knowledge/types";
import type { MistakeAttachment } from "@/features/mistakes/types";
import { uploadStudyAttachment } from "@/services/uploads";
import type { DbAttachmentRow } from "@/types/database";

export type StudyAttachment = MistakeAttachment | KnowledgeAttachment;

const attachmentTones: StudyAttachment["tone"][] = ["emerald", "sky", "amber", "rose", "slate"];

function getAttachmentKind(file: File): StudyAttachment["kind"] {
  if (file.type.startsWith("image/")) {
    return "photo";
  }

  return "file";
}

export function mapDbAttachmentToStudyAttachment(row: DbAttachmentRow): StudyAttachment {
  return {
    id: row.id,
    label: row.label,
    kind: row.kind,
    tone: row.tone,
    storagePath: row.storage_path,
    publicUrl: row.public_url
  };
}

export function buildLocalAttachmentFromFile(file: File, index = 0): StudyAttachment {
  return {
    id: `local-attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: file.name,
    kind: getAttachmentKind(file),
    tone: attachmentTones[index % attachmentTones.length]
  };
}

export async function uploadPendingStudyAttachments(recordId: string, files: File[]) {
  const uploaded: StudyAttachment[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const formData = new FormData();
    formData.set("file", file);
    formData.set("recordId", recordId);
    formData.set("label", file.name);
    formData.set("kind", getAttachmentKind(file));
    formData.set("tone", attachmentTones[index % attachmentTones.length]);

    const row = await uploadStudyAttachment(formData);
    uploaded.push(mapDbAttachmentToStudyAttachment(row));
  }

  return uploaded;
}
