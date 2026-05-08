import type { AIProvider, ChatMessage } from "@/lib/ai/types";

interface OpenAIConfig {
  baseUrl: string;
  apiKey: string;
}

export function createOpenAICompatibleProvider(
  id: string,
  config: OpenAIConfig
): AIProvider {
  return {
    id,

    async createChatCompletionStream({ model, messages, temperature = 0.7, maxTokens = 4096 }) {
      if (!config.apiKey) {
        throw new Error(`${id} API key not configured`);
      }

      const body = {
        model,
        messages: messages.map((m: ChatMessage) => ({
          role: m.role,
          content: m.content,
        })),
        temperature,
        max_tokens: maxTokens,
        stream: true,
      };

      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`${id} API error ${response.status}: ${errorText}`);
      }

      return response;
    },
  };
}
