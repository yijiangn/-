export const AI_MODELS = [
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", provider: "deepseek", thinking: false },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", provider: "deepseek", thinking: true },
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
  return AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
}
