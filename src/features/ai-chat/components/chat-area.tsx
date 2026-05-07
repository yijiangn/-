"use client";

import { useRef, useEffect, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { AI_MODELS } from "../types";
import type { ChatMessage } from "../hooks/use-chat";

interface Props {
  messages: ChatMessage[];
  isStreaming: boolean;
  selectedModel: string;
  error: string | null;
  onSend: (content: string) => void;
  onStop: () => void;
  onModelChange: (model: string) => void;
}

export function ChatArea({
  messages,
  isStreaming,
  selectedModel,
  error,
  onSend,
  onStop,
  onModelChange,
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-1 flex-col min-w-0 h-full bg-white/30 dark:bg-stone-900/30">
      {/* 顶部模型选择 */}
      <div className="flex items-center gap-3 border-b border-stone-200/60 px-5 py-3 dark:border-stone-700/60">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white/80 px-3 py-1.5 text-sm text-stone-700 outline-none dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-200"
        >
          {AI_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="text-4xl opacity-20">💬</div>
            <p className="text-lg font-semibold text-stone-600 dark:text-stone-300">
              AI 学习助手
            </p>
            <p className="text-sm text-stone-400 dark:text-stone-500">
              基于 DeepSeek，助你高效备考
            </p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id || idx} message={msg} />
        ))}
        {error && (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-stone-200/60 px-5 py-4 dark:border-stone-700/60"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息，Enter 发送，Shift+Enter 换行"
          rows={2}
          disabled={isStreaming}
          className="w-full resize-none rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-sage-400 focus:ring-2 focus:ring-sage-200 dark:border-stone-600 dark:bg-stone-800/80 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-sage-500 dark:focus:ring-sage-800"
        />
        <div className="mt-2 flex justify-end">
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40"
            >
              停止
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-xl bg-sage-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sage-700 active:scale-[0.98] disabled:opacity-40"
            >
              发送
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
