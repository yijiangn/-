import { ImageIcon } from "@/components/ui/icons";
import type { KnowledgeAttachment } from "@/features/knowledge/types";
import { getAttachmentToneClasses } from "@/features/knowledge/utils";

interface KnowledgeAttachmentGridProps {
  attachments: KnowledgeAttachment[];
  compact?: boolean;
}

function getAttachmentKindLabel(kind: KnowledgeAttachment["kind"]) {
  if (kind === "screenshot") {
    return "截图";
  }

  if (kind === "photo") {
    return "拍照";
  }

  return "基础文件";
}

export function KnowledgeAttachmentGrid({ attachments, compact = false }: KnowledgeAttachmentGridProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className={`rounded-[28px] border bg-gradient-to-br p-4 shadow-float ${getAttachmentToneClasses(attachment.tone)}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-medium text-stone-600">
              <ImageIcon className="h-4 w-4" />
              {getAttachmentKindLabel(attachment.kind)}
            </span>
          </div>

          {attachment.publicUrl && attachment.kind !== "file" ? (
            <img
              src={attachment.publicUrl}
              alt={attachment.label}
              className={`${compact ? "mt-5 h-20" : "mt-6 h-28"} w-full rounded-[24px] border border-white/70 bg-white/55 object-cover`}
            />
          ) : (
            <div className={`${compact ? "mt-5 h-20" : "mt-6 h-28"} rounded-[24px] border border-white/70 bg-white/55`} />
          )}

          <p className="mt-3 text-sm font-medium text-stone-700">{attachment.label}</p>
        </div>
      ))}
    </div>
  );
}
