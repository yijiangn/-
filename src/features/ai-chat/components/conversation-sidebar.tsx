"use client";

import { useState } from "react";
import { EditIcon, PlusIcon, SparklesIcon, TrashIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { ConvSummary } from "../hooks/use-conversations";

interface Props {
  conversations: ConvSummary[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

export function ConversationSidebar({
  conversations,
  loading,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  className,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function startRename(conv: ConvSummary) {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  }

  async function submitRename(id: string) {
    if (editTitle.trim()) {
      await onRename(id, editTitle.trim());
    }
    setEditingId(null);
  }

  return (
    <aside
      className={cn(
        "flex h-full w-full shrink-0 flex-col border-r border-white/70 bg-stone-50/90 dark:border-white/10 dark:bg-stone-950/80 md:w-60 xl:w-72",
        className
      )}
    >
      <div className="border-b border-stone-200/70 p-3 dark:border-stone-800/70 sm:p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300">
            <SparklesIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-stone-900 dark:text-stone-100">AI 助手</p>
            <p className="text-xs text-stone-500 dark:text-stone-500">历史对话</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-sage-600 px-3 text-sm font-black text-white shadow-sm transition hover:bg-sage-700 active:scale-[0.99]"
        >
          <PlusIcon className="h-4 w-4" />
          新对话
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2 sm:p-3">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/65 px-4 py-8 text-center text-sm font-semibold text-stone-400 dark:border-stone-800 dark:bg-stone-900/50">
            加载中...
          </div>
        ) : null}

        {!loading && conversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 bg-white/65 px-4 py-8 text-center text-sm font-semibold text-stone-400 dark:border-stone-800 dark:bg-stone-900/50">
            暂无对话
          </div>
        ) : null}

        <div className="space-y-1.5">
          {conversations.map((conv) => {
            const active = conv.id === activeId;

            return (
              <div
                key={conv.id}
                className={cn(
                  "group rounded-2xl border px-2.5 py-2 transition",
                  active
                    ? "border-sage-200 bg-sage-50/90 shadow-sm dark:border-sage-900/80 dark:bg-sage-950/35"
                    : "border-transparent hover:border-stone-200 hover:bg-white/75 dark:hover:border-stone-800 dark:hover:bg-stone-900/70"
                )}
              >
                {editingId === conv.id ? (
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => submitRename(conv.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void submitRename(conv.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    className="h-9 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-800 outline-none focus:border-sage-300 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(conv.id)}
                      className="min-w-0 flex-1 text-left"
                      title={conv.title}
                    >
                      <span className="block truncate text-sm font-bold text-stone-800 dark:text-stone-200">
                        {conv.title}
                      </span>
                      <span className="mt-1 block text-xs text-stone-400">
                        {formatUpdatedAt(conv.updated_at)} · {conv.model}
                      </span>
                    </button>

                    <div className="flex shrink-0 gap-0.5 opacity-100 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => startRename(conv)}
                        className="grid h-8 w-8 place-items-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
                        aria-label="重命名对话"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(conv.id)}
                        className="grid h-8 w-8 place-items-center rounded-xl text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        aria-label="删除对话"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
