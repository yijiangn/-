"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "../hooks/use-chat";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const [showReasoning, setShowReasoning] = useState(false);
  const isUser = message.role === "user";
  const hasReasoning = Boolean(message.reasoning_content && message.reasoning_content.length > 0);
  const isError = message.status === "failed";
  const isStreaming = message.status === "streaming";
  const isEmpty = !message.content && !message.reasoning_content;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "min-w-0 max-w-[94%] break-words rounded-[22px] border px-3.5 py-3 text-sm shadow-sm sm:max-w-[82%] sm:px-4 md:max-w-[76%]",
          isUser
            ? "border-sage-200 bg-sage-100/90 text-stone-800 dark:border-sage-800 dark:bg-sage-950/45 dark:text-stone-100"
            : isError
              ? "border-rose-200 bg-rose-50 text-stone-800 dark:border-rose-900/80 dark:bg-rose-950/30 dark:text-stone-100"
              : "border-white/70 bg-white/80 text-stone-800 dark:border-white/10 dark:bg-stone-900/70 dark:text-stone-100"
        )}
      >
        <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500">
          {isUser ? "你" : "AI 助手"}
        </div>

        {hasReasoning ? (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => setShowReasoning(!showReasoning)}
              className="rounded-full px-2 py-1 text-xs font-bold text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            >
              {showReasoning ? "收起思考过程" : "展开思考过程"}
            </button>
            {showReasoning ? (
              <div className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded-2xl bg-stone-100/80 p-3 text-xs leading-6 text-stone-500 dark:bg-stone-800/80 dark:text-stone-400">
                {message.reasoning_content}
              </div>
            ) : null}
          </div>
        ) : null}

        {isStreaming && isEmpty && !hasReasoning ? (
          <div className="flex gap-1 py-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-stone-400 [animation-delay:0.4s]" />
          </div>
        ) : message.content ? (
          <div className="prose prose-sm max-w-none overflow-x-auto dark:prose-invert prose-headings:text-stone-800 prose-p:leading-7 prose-p:text-stone-700 prose-pre:rounded-2xl prose-pre:bg-stone-100 prose-code:rounded prose-code:bg-stone-100 prose-code:px-1 dark:prose-headings:text-stone-100 dark:prose-p:text-stone-300 dark:prose-pre:bg-stone-800 dark:prose-code:bg-stone-800">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : null}

        {isStreaming && message.content ? (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-stone-400 align-text-bottom" />
        ) : null}
        {isError ? (
          <div className="mt-2 text-xs font-semibold text-rose-500 dark:text-rose-300">
            {message.error_message || "请求失败"}
          </div>
        ) : null}
        {message.status === "aborted" ? (
          <div className="mt-2 text-xs font-semibold text-stone-400">已停止生成</div>
        ) : null}

        {typeof message.token_input === "number" &&
        message.token_input > 0 &&
        message.status === "completed" &&
        !isUser ? (
          <div className="mt-2 text-[10px] text-stone-300 dark:text-stone-600">
            in: {message.token_input} | out: {message.token_output}
          </div>
        ) : null}
      </div>
    </div>
  );
}
