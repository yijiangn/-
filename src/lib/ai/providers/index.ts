import { deepseekProvider } from "./deepseek";
import { createOpenAICompatibleProvider } from "./openai-compatible";
import type { AIProvider } from "@/lib/ai/types";

export function getProvider(id: string): AIProvider {
  // DeepSeek 直连
  if (id === "deepseek") {
    return deepseekProvider;
  }

  // 中转站 relay
  if (id === "relay") {
    return createOpenAICompatibleProvider("relay", {
      baseUrl: process.env.RELAY_BASE_URL || "https://api.opusclaw.me/v1",
      apiKey: process.env.RELAY_API_KEY || "",
    });
  }

  throw new Error(`Unknown AI provider: ${id}`);
}
