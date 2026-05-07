"use client";

import { useState } from "react";
import type { ConvSummary } from "../hooks/use-conversations";

interface Props {
  conversations: ConvSummary[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  loading,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
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
    <div className="flex w-56 shrink-0 flex-col border-r border-stone-200 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-900/50">
      <div className="p-3">
        <button
          onClick={onCreate}
          className="w-full rounded-xl bg-sage-600 py-2.5 text-sm font-semibold text-white transition hover:bg-sage-700 active:scale-[0.98]"
        >
          + 新对话
        </button>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-2">
        {loading && (
          <p className="py-8 text-center text-sm text-stone-400">加载中...</p>
        )}

        {!loading && conversations.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-400">暂无对话</p>
        )}

        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 mb-0.5 transition-colors ${
              conv.id === activeId
                ? "bg-sage-100/80 dark:bg-sage-900/30"
                : "hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            {editingId === conv.id ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => submitRename(conv.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename(conv.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                autoFocus
                className="min-w-0 flex-1 rounded-md border border-stone-200 bg-white px-2 py-1 text-sm text-stone-800 outline-none dark:border-stone-600 dark:bg-stone-700 dark:text-stone-100"
              />
            ) : (
              <button
                onClick={() => onSelect(conv.id)}
                className="min-w-0 flex-1 truncate text-left text-sm text-stone-700 dark:text-stone-300 py-1 rounded"
                title={conv.title}
              >
                {conv.title}
              </button>
            )}

            <div className="hidden gap-0.5 group-hover:flex shrink-0">
              <button
                onClick={() => startRename(conv)}
                className="rounded p-0.5 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                title="重命名"
              >
                ✎
              </button>
              <button
                onClick={() => onDelete(conv.id)}
                className="rounded p-0.5 text-xs text-stone-400 hover:text-rose-500"
                title="删除"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
