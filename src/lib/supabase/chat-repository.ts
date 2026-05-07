import "server-only";
import { supabaseRestRequest } from "@/lib/supabase/rest";

// ── 数据库行类型 ──

export interface DbConversation {
  id: string;
  title: string;
  provider: string;
  model: string;
  system_prompt: string | null;
  summary: string | null;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  reasoning_content: string | null;
  provider: string | null;
  model: string | null;
  status: "streaming" | "completed" | "failed" | "aborted";
  finish_reason: string | null;
  error_message: string | null;
  token_input: number;
  token_output: number;
  sequence: number;
  created_at: string;
}

// ── Conversations ──

export async function listConversationsService() {
  return supabaseRestRequest<DbConversation[]>("conversations", {
    searchParams: { order: "updated_at.desc" },
  });
}

export async function createConversationService(
  data: { title?: string; provider?: string; model?: string } = {}
) {
  const id = `conv-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const row = {
    id,
    title: data.title || "新对话",
    provider: data.provider || "deepseek",
    model: data.model || "deepseek-v4-flash",
    created_at: now,
    updated_at: now,
  };
  const result = await supabaseRestRequest<DbConversation[]>("conversations", {
    method: "POST",
    body: row,
    preferRepresentation: true,
  });
  return result[0];
}

export async function renameConversationService(id: string, title: string) {
  await supabaseRestRequest("conversations", {
    method: "PATCH",
    searchParams: { id: `eq.${id}` },
    body: { title, updated_at: new Date().toISOString() },
  });
}

export async function deleteConversationService(id: string) {
  await supabaseRestRequest("conversations", {
    method: "DELETE",
    searchParams: { id: `eq.${id}` },
  });
}

export async function updateConversationTimeService(id: string) {
  await supabaseRestRequest("conversations", {
    method: "PATCH",
    searchParams: { id: `eq.${id}` },
    body: { updated_at: new Date().toISOString() },
  });
}

export async function getConversationService(id: string) {
  const result = await supabaseRestRequest<DbConversation[]>("conversations", {
    searchParams: { id: `eq.${id}` },
  });
  return result[0] || null;
}

// ── Messages ──

export async function listMessagesService(conversationId: string) {
  return supabaseRestRequest<DbMessage[]>("messages", {
    searchParams: {
      conversation_id: `eq.${conversationId}`,
      order: "sequence.asc",
    },
  });
}

export async function insertMessageService(message: {
  id?: string;
  conversation_id: string;
  role: string;
  content: string;
  reasoning_content?: string | null;
  provider?: string;
  model?: string;
  status: string;
  sequence: number;
}) {
  const id = message.id || `msg-${crypto.randomUUID()}`;
  const row = { ...message, id };
  const result = await supabaseRestRequest<DbMessage[]>("messages", {
    method: "POST",
    body: row,
    preferRepresentation: true,
  });
  return result[0];
}

export async function updateMessageService(
  id: string,
  fields: Partial<DbMessage>
) {
  await supabaseRestRequest("messages", {
    method: "PATCH",
    searchParams: { id: `eq.${id}` },
    body: fields,
  });
}

export async function getLatestSequence(conversationId: string): Promise<number> {
  const result = await supabaseRestRequest<DbMessage[]>("messages", {
    searchParams: {
      conversation_id: `eq.${conversationId}`,
      order: "sequence.desc",
      limit: "1",
    },
  });
  return result.length ? result[0].sequence : -1;
}
