"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { ChatMessage } from "../hooks/use-chat";

interface Props {
  message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
  const [showReasoning, setShowReasoning] = useState(false);
  const isUser = message.role === "user";
  const hasReasoning =
    message.reasoning_content && message.reasoning_content.length > 0;
  const isError = message.status === "failed";
  const isStreaming = message.status === "streaming";
  const isEmpty = !message.content && !message.reasoning_content;

  return (
    <div
      className={`flex mb-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 border ${
          isUser
            ? "bg-sage-100/80 border-sage-200 dark:bg-sage-900/30 dark:border-sage-800"
            : isError
              ? "bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800"
              : "bg-white/60 border-stone-200 dark:bg-stone-800/60 dark:border-stone-700"
        }`}
      >
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
          {isUser ? "你" : "AI 助手"}
        </div>

        {/* 思考内容折叠区 */}
        {hasReasoning && (
          <div className="mb-2">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors"
            >
              {showReasoning ? "▾" : "▸"} 思考过程
            </button>
            {showReasoning && (
              <div className="mt-1 rounded-xl bg-stone-100/80 dark:bg-stone-700/50 p-3 text-xs text-stone-500 dark:text-stone-400 whitespace-pre-wrap max-h-48 overflow-auto">
                {message.reasoning_content}
              </div>
            )}
          </div>
        )}

        {/* 消息内容 */}
        {isStreaming && isEmpty && !hasReasoning ? (
          <div className="flex gap-1 py-1">
            <span className="h-2 w-2 rounded-full bg-stone-400 animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.2s]" />
            <span className="h-2 w-2 rounded-full bg-stone-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        ) : message.content ? (
          <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-stone-800 dark:prose-headings:text-stone-100 prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-code:bg-stone-100 dark:prose-code:bg-stone-700 prose-code:px-1 prose-code:rounded prose-pre:bg-stone-100 dark:prose-pre:bg-stone-800 prose-pre:rounded-xl prose-a:text-sage-600 dark:prose-a:text-sage-400">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : null}

        {/* 状态指示 */}
        {isStreaming && message.content && (
          <span className="ml-0.5 inline-block h-4 w-0.5 bg-stone-400 animate-pulse align-text-bottom" />
        )}
        {isError && (
          <div className="mt-2 text-xs text-rose-500 dark:text-rose-400">
            {message.error_message || "请求失败"}
          </div>
        )}
        {message.status === "aborted" && (
          <div className="mt-2 text-xs text-stone-400">已停止生成</div>
        )}

        {/* Token 用量 */}
        {typeof message.token_input === "number" &&
          message.token_input > 0 &&
          message.status === "completed" &&
          !isUser && (
            <div className="mt-2 text-[10px] text-stone-300 dark:text-stone-600">
              in: {message.token_input} | out: {message.token_output}
            </div>
          )}
      </div>
    </div>
  );
}
