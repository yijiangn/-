import { ImageIcon, SparklesIcon, TagIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { UnifiedSearchRecord } from "@/features/search/types";
import { searchImportanceLabelMap, searchResultKindLabelMap } from "@/features/search/utils";
import { getKnowledgeTypeClasses } from "@/features/knowledge/utils";
import { getMistakeImportanceClasses } from "@/features/mistakes/utils";
import { getTaskStatusClasses, taskStatusLabelMap } from "@/features/tasks/utils";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface SearchResultCardProps {
  record: UnifiedSearchRecord;
  isSelected: boolean;
  onSelect: (recordId: string) => void;
}

export function SearchResultCard({ record, isSelected, onSelect }: SearchResultCardProps) {
  const subject = subjectMetaMap[record.subjectKey];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelect(record.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(record.id);
        }
      }}
      className={cn(
        "rounded-[26px] border bg-white/76 p-4 shadow-float outline-none backdrop-blur-md transition duration-200 focus-visible:ring-2 focus-visible:ring-moss-200",
        isSelected ? "border-moss-300 ring-2 ring-moss-100" : "border-white/55 hover:border-moss-200 hover:bg-white/86",
        record.archivedAt && "opacity-75"
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-medium text-stone-600">
          {searchResultKindLabelMap[record.kind]}
        </span>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", subject.accentSurfaceClass, subject.accentTextClass)}>
          {subject.label}
        </span>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            record.kind === "knowledge"
              ? getKnowledgeTypeClasses(record.raw.contentType)
              : record.kind === "mistake"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-sage-200 bg-sage-50 text-sage-800"
          )}
        >
          {record.typeLabel}
        </span>
        {record.importance ? (
          <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", getMistakeImportanceClasses(record.importance))}>
            {searchImportanceLabelMap[record.importance]}
          </span>
        ) : null}
        {record.archivedAt ? (
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-500">已归档</span>
        ) : null}
      </div>

      <h3 className="mt-3 text-base font-semibold text-stone-950 sm:text-lg">{record.title}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{record.preview}</p>

      {record.kind === "task" ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm text-stone-500">
            <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", getTaskStatusClasses(record.status))}>
              {taskStatusLabelMap[record.status]}
            </span>
            <span>{record.progress}%</span>
          </div>
          <ProgressBar value={record.progress} />
          <p className="text-xs leading-5 text-stone-500">当前步骤：{record.stepLabel}</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-500">
          {record.source ? <span>来源：{record.source}</span> : null}
          <span className="inline-flex items-center gap-1">
            <ImageIcon className="h-3.5 w-3.5" />
            {record.raw.attachments.length} 张图
          </span>
        </div>
      )}

      {record.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {record.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-medium text-stone-500">
              <TagIcon className="h-3.5 w-3.5" />
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-sage-200 bg-sage-50/60 px-3 py-2 text-xs text-stone-500">
          <span className="inline-flex items-center gap-2">
            <SparklesIcon className="h-3.5 w-3.5" />
            当前内容暂无标签
          </span>
        </div>
      )}
    </article>
  );
}
