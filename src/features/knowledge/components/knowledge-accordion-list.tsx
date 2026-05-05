"use client";

import { useState } from "react";
import { ArchiveIcon, ChevronDownIcon, EditIcon, TagIcon, TrashIcon } from "@/components/ui/icons";
import { KnowledgeAttachmentGrid } from "@/features/knowledge/components/knowledge-attachment-grid";
import type { KnowledgeContentType, KnowledgeRecord } from "@/features/knowledge/types";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface KnowledgeAccordionListProps {
  records: KnowledgeRecord[];
  onArchiveToggle: (recordId: string) => void;
  onDelete: (recordId: string) => void;
  onEdit: (record: KnowledgeRecord) => void;
}

const contentTypeLabelMap: Record<KnowledgeContentType, string> = {
  concept: "知识点",
  formula: "公式",
  problem_pattern: "题型",
  word: "单词",
  phrase: "短语",
  essay_material: "作文素材",
  high_freq_point: "高频考点",
  question_type: "题目类型"
};

export function KnowledgeAccordionList({ records, onArchiveToggle, onDelete, onEdit }: KnowledgeAccordionListProps) {
  const [openId, setOpenId] = useState<string | null>(records[0]?.id ?? null);

  if (records.length === 0) {
    return (
      <section className="panel p-6 text-center">
        <p className="text-sm font-black text-stone-900">当前筛选下没有知识点记录</p>
        <p className="mt-2 text-xs font-medium text-stone-500">可以调整筛选条件，或新增一条知识点。</p>
      </section>
    );
  }

  return (
    <section className="grid gap-3">
      {records.map((record) => {
        const subject = subjectMetaMap[record.subjectKey];
        const isOpen = openId === record.id;

        return (
          <article key={record.id} className={cn("panel overflow-hidden p-0", record.archivedAt && "opacity-65")}>
            <button
              type="button"
              onClick={() => setOpenId((current) => (current === record.id ? null : record.id))}
              className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-white/20"
            >
              <span className={cn("mt-0.5 rounded-xl border px-2.5 py-1 text-xs font-black", subject.accentSurfaceClass, subject.accentTextClass)}>
                {subject.label}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-black text-stone-950">{record.title}</span>
                <span className="mt-1 block line-clamp-2 text-sm font-medium leading-6 text-stone-600">{record.summary}</span>
              </span>
              <span className="hidden rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-xs font-bold text-stone-600 sm:inline-flex">
                {contentTypeLabelMap[record.contentType]}
              </span>
              <ChevronDownIcon className={cn("mt-1 h-4 w-4 shrink-0 text-stone-500 transition", isOpen && "rotate-180")} />
            </button>

            {isOpen ? (
              <div className="border-t border-white/30 bg-white/20 px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  <span className="soft-pill">{contentTypeLabelMap[record.contentType]}</span>
                  {record.chapter ? <span className="soft-pill">章节：{record.chapter}</span> : null}
                  {record.source ? <span className="soft-pill">来源：{record.source}</span> : null}
                  {record.archivedAt ? <span className="soft-pill">已归档</span> : null}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                  <div className="space-y-3">
                    <div className="rounded-[24px] border border-white/60 bg-white/50 p-4">
                      <p className="text-xs font-black text-stone-500">核心内容</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-stone-700">{record.content}</p>
                    </div>
                    <div className="rounded-[24px] border border-sage-100 bg-sage-50/70 p-4">
                      <p className="text-xs font-black text-sage-700">记忆提示</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-7 text-stone-700">{record.reviewTip}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <KnowledgeAttachmentGrid attachments={record.attachments} />
                    {record.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {record.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold text-stone-600">
                            <TagIcon className="h-3.5 w-3.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(record)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/60 px-3 py-2 text-xs font-bold text-stone-700 transition hover:bg-white"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => onArchiveToggle(record.id)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-sage-200 bg-sage-50 px-3 py-2 text-xs font-bold text-sage-800 transition hover:bg-sage-100"
                  >
                    <ArchiveIcon className="h-3.5 w-3.5" />
                    {record.archivedAt ? "取消归档" : "归档"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(record.id)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    删除
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
