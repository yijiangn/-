"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookIcon, LayersIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import type { KnowledgeRecord } from "@/features/knowledge/types";
import { knowledgeContentTypeLabelMap } from "@/features/knowledge/utils";
import type { MistakeRecord } from "@/features/mistakes/types";
import type { StudyTask } from "@/features/tasks/types";
import { subjectMetaMap } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils";

interface QuickSearchDialogProps {
  open: boolean;
  onClose: () => void;
  tasks: StudyTask[];
  mistakes: MistakeRecord[];
  knowledge: KnowledgeRecord[];
}

type QuickSearchItem = {
  id: string;
  route: "/tasks" | "/mistakes" | "/knowledge";
  kind: "task" | "mistake" | "knowledge";
  subjectKey: keyof typeof subjectMetaMap;
  title: string;
  preview: string;
  tags: string[];
  updatedAt: string;
  badgeLabel: string;
  metaLabel?: string;
};

function buildItems(tasks: StudyTask[], mistakes: MistakeRecord[], knowledge: KnowledgeRecord[]): QuickSearchItem[] {
  const taskItems = tasks.map<QuickSearchItem>((task) => ({
    id: task.id,
    route: "/tasks",
    kind: "task",
    subjectKey: task.subjectKey,
    title: task.title,
    preview: task.focus,
    tags: task.steps.slice(0, 2),
    updatedAt: task.createdAt,
    badgeLabel: task.bucket === "today" ? "今日任务" : "长期任务",
    metaLabel: task.status === "completed" ? "已完成" : `${task.progress}%`
  }));

  const mistakeItems = mistakes.map<QuickSearchItem>((record) => ({
    id: record.id,
    route: "/mistakes",
    kind: "mistake",
    subjectKey: record.subjectKey,
    title: record.title,
    preview: record.caution,
    tags: record.tags,
    updatedAt: record.updatedAt,
    badgeLabel: "错题",
    metaLabel: record.source
  }));

  const knowledgeItems = knowledge.map<QuickSearchItem>((record) => ({
    id: record.id,
    route: "/knowledge",
    kind: "knowledge",
    subjectKey: record.subjectKey,
    title: record.title,
    preview: record.summary,
    tags: record.tags,
    updatedAt: record.updatedAt,
    badgeLabel: knowledgeContentTypeLabelMap[record.contentType],
    metaLabel: record.chapter || record.source
  }));

  return [...taskItems, ...mistakeItems, ...knowledgeItems].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  );
}

function matchesQuery(item: QuickSearchItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }

  return [item.title, item.preview, item.badgeLabel, item.metaLabel, ...item.tags]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function QuickSearchDialog({ open, onClose, tasks, mistakes, knowledge }: QuickSearchDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items = useMemo(() => buildItems(tasks, mistakes, knowledge), [knowledge, mistakes, tasks]);
  const filteredItems = useMemo(() => items.filter((item) => matchesQuery(item, query)).slice(0, 10), [items, query]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSelectedIndex(0);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((current) => Math.min(current + 1, Math.max(filteredItems.length - 1, 0)));
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((current) => Math.max(current - 1, 0));
      }

      if (event.key === "Enter" && filteredItems[selectedIndex]) {
        event.preventDefault();
        router.push(filteredItems[selectedIndex].route);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredItems, onClose, open, router, selectedIndex]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-stone-950/35 px-4 py-10 backdrop-blur-sm sm:py-16">
      <div className="w-full max-w-3xl overflow-hidden rounded-[34px] border border-white/60 bg-white/85 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-stone-200/70 px-4 py-4 sm:px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-50 text-sage-700">
            <SearchIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索任务、错题、知识点..."
              className="w-full bg-transparent text-base font-medium text-stone-900 outline-none placeholder:text-stone-400"
            />
            <p className="mt-1 text-xs text-stone-500">Enter 打开对应页面，Esc 关闭，方向键快速选择</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="关闭快速搜索"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white/80 text-stone-500 transition hover:bg-white hover:text-stone-700"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="max-h-[60vh] overflow-y-auto p-3">
            {filteredItems.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-stone-200 bg-stone-50/70 px-5 py-12 text-center">
                <p className="text-base font-medium text-stone-700">没有找到匹配内容</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">试试搜索标题、标签、章节、来源或任务步骤。</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map((item, index) => {
                  const subject = subjectMetaMap[item.subjectKey];
                  const selected = index === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setSelectedIndex(index)}
                      onClick={() => {
                        router.push(item.route);
                        onClose();
                      }}
                      className={cn(
                        "w-full rounded-[26px] border px-4 py-4 text-left transition",
                        selected
                          ? "border-sage-300 bg-sage-50/90 shadow-sm"
                          : "border-white/50 bg-white/65 hover:border-moss-200 hover:bg-white"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn("rounded-full border px-3 py-1 text-[11px] font-semibold", subject.accentSurfaceClass, subject.accentTextClass)}
                        >
                          {subject.label}
                        </span>
                        <span className="rounded-full border border-stone-200 bg-white/85 px-3 py-1 text-[11px] font-semibold text-stone-600">
                          {item.badgeLabel}
                        </span>
                      </div>

                      <p className="mt-3 text-base font-semibold text-stone-900">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">{item.preview}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        {item.metaLabel ? <span>{item.metaLabel}</span> : null}
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full border border-stone-200 bg-white/80 px-2.5 py-1 font-medium text-stone-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-stone-200/70 bg-stone-50/75 p-4 lg:border-l lg:border-t-0">
            <div className="rounded-[26px] border border-white/70 bg-white/80 p-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-stone-900">
                <LayersIcon className="h-4 w-4 text-moss-700" />
                快速搜索说明
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-600">
                <li>支持任务、错题、知识点统一即时检索。</li>
                <li>优先读取当前设备已同步的数据，响应更快。</li>
                <li>需要完整组合筛选时，可进入完整搜索页。</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                router.push("/search");
                onClose();
              }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-moss-200 bg-moss-50 px-4 py-3 text-sm font-medium text-moss-700 transition hover:bg-white"
            >
              <BookIcon className="h-4 w-4" />
              进入完整搜索页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
