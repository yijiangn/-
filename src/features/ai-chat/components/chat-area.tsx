"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { SparklesIcon } from "@/components/ui/icons";
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
  onOpenSidebar: () => void;
  activeConversation: boolean;
}

export function ChatArea({
  messages,
  isStreaming,
  selectedModel,
  error,
  onSend,
  onStop,
  onModelChange,
  onOpenSidebar,
  activeConversation,
}: Props) {
  const [input, setInput] = useState("");
  const [customModelOpen, setCustomModelOpen] = useState(false);
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

  function submitCurrentMessage() {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitCurrentMessage();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitCurrentMessage();
    }
  }

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-white/40 dark:bg-stone-900/40">
      <header className="shrink-0 border-b border-stone-200/70 bg-white/70 px-3 py-3 backdrop-blur-xl dark:border-stone-800/70 dark:bg-stone-950/70 sm:px-4 lg:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:bg-stone-50 hover:text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 md:hidden"
              aria-label="打开对话列表"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300">
              <SparklesIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-black text-stone-950 dark:text-stone-100 sm:text-lg">
                AI 学习助手
              </h1>
              <p className="truncate text-xs font-medium text-stone-500 dark:text-stone-400">
                {activeConversation ? "当前对话已载入" : "选择模型后开始新对话"}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={AI_MODELS.some((model) => model.id === selectedModel) ? selectedModel : "__custom_selected__"}
              onChange={(e) => {
                if (e.target.value === "__custom__") {
                  setCustomModelOpen(true);
                  return;
                }
                setCustomModelOpen(false);
                onModelChange(e.target.value);
              }}
              className="h-10 min-w-0 rounded-2xl border border-stone-200 bg-white/85 px-3 text-sm font-semibold text-stone-700 outline-none transition focus:border-sage-300 dark:border-stone-700 dark:bg-stone-900/85 dark:text-stone-200 sm:w-[220px] xl:w-[260px]"
            >
              <optgroup label="DeepSeek 直连">
                {AI_MODELS.filter((model) => model.provider === "deepseek").map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="中转站">
                {AI_MODELS.filter((model) => model.provider === "relay").map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.label}
                  </option>
                ))}
                <option value="__custom__">其他中转模型...</option>
              </optgroup>
              {!AI_MODELS.some((model) => model.id === selectedModel) ? (
                <option value="__custom_selected__">{selectedModel}</option>
              ) : null}
            </select>

            {customModelOpen ? (
              <CustomModelInput
                onConfirm={(model) => {
                  onModelChange(model);
                  setCustomModelOpen(false);
                }}
                onCancel={() => setCustomModelOpen(false)}
              />
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-3 py-4 sm:px-5 lg:px-8">
        <div className="mx-auto flex min-h-full max-w-5xl flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="w-full max-w-lg rounded-[28px] border border-white/70 bg-white/70 p-6 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-stone-900/55 sm:p-8">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-sage-100 text-sage-700 dark:bg-sage-900/40 dark:text-sage-300">
                  <SparklesIcon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-lg font-black text-stone-800 dark:text-stone-100">
                  开始一次学习对话
                </p>
                <p className="mt-2 text-sm leading-6 text-stone-500 dark:text-stone-400">
                  手机端优先保留输入和消息空间，平板与桌面会固定显示历史对话。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <MessageBubble key={msg.id || idx} message={msg} />
              ))}
            </div>
          )}

          {error ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-600 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="safe-bottom shrink-0 border-t border-stone-200/70 bg-white/75 px-3 py-3 backdrop-blur-xl dark:border-stone-800/70 dark:bg-stone-950/70 sm:px-5 lg:px-8"
      >
        <div className="mx-auto flex max-w-5xl gap-2 sm:gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            disabled={isStreaming}
            className="max-h-36 min-h-[44px] flex-1 resize-none rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm font-medium leading-5 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-sage-400 focus:ring-4 focus:ring-sage-100 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900/90 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-sage-500 dark:focus:ring-sage-900/40 sm:min-h-[48px]"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="h-11 shrink-0 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-black text-rose-600 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950 sm:h-12 sm:px-5"
            >
              停止
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="h-11 shrink-0 rounded-2xl bg-sage-600 px-4 text-sm font-black text-white shadow-sm transition hover:bg-sage-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none dark:disabled:bg-stone-700 sm:h-12 sm:px-5"
            >
              发送
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function CustomModelInput({
  onConfirm,
  onCancel,
}: {
  onConfirm: (model: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex h-10 min-w-0 items-center gap-1.5 rounded-2xl border border-sage-200 bg-sage-50/90 px-2 dark:border-sage-800 dark:bg-sage-950/40 sm:w-[240px]">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            onConfirm(value.trim());
          }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="模型名"
        autoFocus
        className="min-w-0 flex-1 bg-transparent px-1 text-xs font-semibold text-stone-700 outline-none placeholder:text-stone-400 dark:text-stone-200"
      />
      <button
        type="button"
        onClick={() => onCancel()}
        className="shrink-0 rounded-xl px-2 py-1 text-xs font-bold text-stone-400 hover:bg-white/80 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        取消
      </button>
    </div>
  );
}
