import { deepseekProvider } from "./deepseek";
import type { AIProvider } from "@/lib/ai/types";

const providers: Record<string, AIProvider> = {
  deepseek: deepseekProvider,
};

export function getProvider(id: string): AIProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown AI provider: ${id}`);
  }
  return provider;
}
