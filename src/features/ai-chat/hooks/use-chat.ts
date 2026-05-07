import { useState, useRef, useCallback } from "react";
import { AI_MODELS } from "../types";

export interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  reasoning_content?: string | null;
  status: string;
  sequence: number;
  token_input?: number;
  token_output?: number;
  error_message?: string | null;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(AI_MODELS[0].id);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadMessages = useCallback(async (convId: string | null) => {
    setConversationId(convId);
    setMessages([]);
    setError(null);

    if (!convId) return;

    try {
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        status: "completed",
        sequence: messages.length,
      };

      const assistantMsg: ChatMessage = {
        id: `temp-${Date.now() + 1}`,
        role: "assistant",
        content: "",
        reasoning_content: null,
        status: "streaming",
        sequence: messages.length + 1,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      const chatMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content },
      ];

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatMessages,
            model: selectedModel,
            conversationId,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `API error ${res.status}`);
        }

        const newConvId = res.headers.get("X-Conversation-Id");
        if (newConvId && !conversationId) {
          setConversationId(newConvId);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              if (delta) {
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIdx = updated.length - 1;
                  if (
                    lastIdx >= 0 &&
                    updated[lastIdx].role === "assistant"
                  ) {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      content:
                        updated[lastIdx].content + (delta.content || ""),
                      reasoning_content:
                        (updated[lastIdx].reasoning_content || "") +
                        (delta.reasoning_content || ""),
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // skip parse errors
            }
          }
        }

        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = { ...updated[lastIdx], status: "completed" };
          }
          return updated;
        });
      } catch (err: any) {
        if (err.name === "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = { ...updated[lastIdx], status: "aborted" };
            }
            return updated;
          });
        } else {
          setError(err.message);
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
              updated[lastIdx] = {
                ...updated[lastIdx],
                status: "failed",
                error_message: err.message,
              };
            }
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, conversationId, selectedModel, isStreaming]
  );

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    conversationId,
    selectedModel,
    error,
    setSelectedModel,
    loadMessages,
    sendMessage,
    stopGeneration,
    clearMessages,
  };
}
