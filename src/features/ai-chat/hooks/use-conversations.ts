import { useState, useEffect, useCallback } from "react";

export interface ConvSummary {
  id: string;
  title: string;
  provider: string;
  model: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
}

export function useConversations() {
  const [conversations, setConversations] = useState<ConvSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ai/conversations");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setConversations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  async function createConversation() {
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "新对话" }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const conv = await res.json();
      setConversations((prev) => [conv, ...prev]);
      return conv;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }

  async function renameConversation(id: string, title: string) {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title } : c))
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function deleteConversation(id: string) {
    try {
      const res = await fetch(`/api/ai/conversations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  return {
    conversations,
    loading,
    error,
    createConversation,
    renameConversation,
    deleteConversation,
    refresh: fetchConversations,
  };
}
