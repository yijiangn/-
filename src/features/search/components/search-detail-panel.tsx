import Link from "next/link";
import { ArrowRightIcon, ImageIcon, SparklesIcon, TagIcon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SectionCard } from "@/components/ui/section-card";
import { KnowledgeAttachmentGrid } from "@/features/knowledge/components/knowledge-attachment-grid";
import { getKnowledgeTypeClasses } from "@/features/knowledge/utils";
import { MistakeAttachmentGrid } from "@/features/mistakes/components/mistake-attachment-grid";
import { getMistakeImportanceClasses } from "@/features/mistakes/utils";
import type { UnifiedSearchRecord } from "@/features/search/types";
import { searchImportanceLabelMap, searchResultKindLabelMap } from "@/features/search/utils";
import { getTaskStatusClasses, taskStatusLabelMap } from "@/features/tasks/utils";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface SearchDetailPanelProps {
  record: UnifiedSearchRecord | null;
}

export function SearchDetailPanel({ record }: SearchDetailPanelProps) {
  if (!record) {
    return (
      <SectionCard title="结果详情" subtitle="选中一条结果后在这里展开查看" className="h-full">
        <div className="rounded-[28px] border border-dashed border-sage-200 bg-sage-50/60 px-5 py-12 text-center">
          <p className="text-base font-medium text-stone-800">还没有选中搜索结果</p>
          <p className="mt-2 text-sm leading-6 text-stone-500">点击左侧任意结果卡片，这里会显示更完整的内容、图文信息和跳转入口。</p>
        </div>
      </SectionCard>
    );
  }

  const subject = subjectMetaMap[record.subjectKey];

  return (
    <SectionCard title="结果详情" subtitle="右侧详情适合完整回看和确认跳转" className="h-full">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
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
          </div>

          <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-950">{record.title}</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {record.source ? (
              <div className="rounded-3xl border border-stone-200 bg-white/80 p-4">
                <p className="text-xs text-stone-500">来源</p>
                <p className="mt-2 text-sm font-medium text-stone-800">{record.source}</p>
              </div>
            ) : null}
            <div className="rounded-3xl border border-stone-200 bg-white/80 p-4">
              <p className="text-xs text-stone-500">归档状态</p>
              <p className="mt-2 text-sm font-medium text-stone-800">{record.archivedAt ? "已归档" : "有效内容"}</p>
            </div>
          </div>
        </div>

        {record.kind === "task" ? (
          <>
            <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-900">任务进度</p>
                <span className={cn("rounded-full border px-3 py-1 text-xs font-medium", getTaskStatusClasses(record.status))}>
                  {taskStatusLabelMap[record.status]}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-stone-500">
                <span>{record.stepLabel}</span>
                <span>{record.progress}%</span>
              </div>
              <ProgressBar value={record.progress} className="mt-3" />
            </div>

            <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
              <p className="text-sm font-semibold text-stone-900">任务说明</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{record.raw.focus}</p>
              {record.raw.note ? <p className="mt-3 text-sm leading-7 text-stone-500">{record.raw.note}</p> : null}
            </div>
          </>
        ) : record.kind === "mistake" ? (
          <>
            <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
              <p className="text-sm font-semibold text-stone-900">错题内容</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{record.raw.content}</p>
            </div>

            <div className="rounded-[28px] border border-amber-100 bg-amber-50/85 p-5 shadow-float backdrop-blur-md">
              <p className="text-sm font-semibold text-amber-700">注意事项</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{record.raw.caution}</p>
            </div>

            {record.raw.attachments.length > 0 ? (
              <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <ImageIcon className="h-4 w-4" />
                  图文附件
                </p>
                <div className="mt-4">
                  <MistakeAttachmentGrid attachments={record.raw.attachments} />
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <>
            <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
              <p className="text-sm font-semibold text-stone-900">内容摘要</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{record.raw.summary}</p>
            </div>

            <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
              <p className="text-sm font-semibold text-stone-900">核心内容</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{record.raw.content}</p>
            </div>

            <div className="rounded-[28px] border border-moss-100 bg-moss-50/80 p-5 shadow-float backdrop-blur-md">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-moss-700">
                <SparklesIcon className="h-4 w-4" />
                记忆提示
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{record.raw.reviewTip}</p>
            </div>

            {record.raw.attachments.length > 0 ? (
              <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                  <ImageIcon className="h-4 w-4" />
                  图文附件
                </p>
                <div className="mt-4">
                  <KnowledgeAttachmentGrid attachments={record.raw.attachments} />
                </div>
              </div>
            ) : null}
          </>
        )}

        {record.tags.length > 0 ? (
          <div className="rounded-[28px] border border-white/55 bg-white/78 p-5 shadow-float backdrop-blur-md">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
              <TagIcon className="h-4 w-4" />
              标签
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {record.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-stone-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <Link
          href={record.route}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-moss-200 bg-moss-50 px-4 py-3 text-sm font-medium text-moss-700 transition hover:bg-moss-100"
        >
          前往{searchResultKindLabelMap[record.kind]}页
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </SectionCard>
  );
}
