export const AI_MODELS = [
  // DeepSeek 直连
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", provider: "deepseek", thinking: false },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", provider: "deepseek", thinking: true },
  // 中转站 (OpenAI 兼容) — 模型取决于中转站支持，在这里增减
  { id: "claude-opus-4-6", label: "中转 · Claude Opus 4.6", provider: "relay", thinking: true },
  { id: "claude-sonnet-4-6", label: "中转 · Claude Sonnet 4.6", provider: "relay", thinking: true },
  { id: "gpt-4o", label: "中转 · GPT-4o", provider: "relay", thinking: false },
  { id: "gpt-4o-mini", label: "中转 · GPT-4o Mini", provider: "relay", thinking: false },
  { id: "deepseek-v3", label: "中转 · DeepSeek V3", provider: "relay", thinking: false },
  { id: "deepseek-r1", label: "中转 · DeepSeek R1", provider: "relay", thinking: true },
] as const;

export type AIModel = (typeof AI_MODELS)[number];

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  reasoning_content?: string;
}

export interface AIProvider {
  id: string;
  createChatCompletionStream(params: {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
  }): Promise<Response>;
}

export function getModelInfo(modelId?: string): AIModel {
  const found = AI_MODELS.find((m) => m.id === modelId);
  if (found) return found;
  // 自定义模型名 → 默认用 relay 中转站
  if (modelId) {
    return {
      id: modelId,
      label: modelId,
      provider: "relay",
      thinking: false,
    } as AIModel;
  }
  return AI_MODELS[0];
}
