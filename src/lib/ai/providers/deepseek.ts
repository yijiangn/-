import type { AIProvider } from "@/lib/ai/types";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

export const deepseekProvider: AIProvider = {
  id: "deepseek",

  async createChatCompletionStream({ model, messages, temperature = 0.7, maxTokens = 4096 }) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const body = {
      model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
      stream: true,
    };

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`);
    }

    return response;
  },
};
