export const AI_MODELS = [
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", provider: "deepseek", thinking: false },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", provider: "deepseek", thinking: true },
  { id: "claude-opus-4-6", label: "中转 · Claude Opus 4.6", provider: "relay", thinking: true },
  { id: "claude-sonnet-4-6", label: "中转 · Claude Sonnet 4.6", provider: "relay", thinking: true },
  { id: "gpt-4o", label: "中转 · GPT-4o", provider: "relay", thinking: false },
  { id: "gpt-4o-mini", label: "中转 · GPT-4o Mini", provider: "relay", thinking: false },
  { id: "deepseek-v3", label: "中转 · DeepSeek V3", provider: "relay", thinking: false },
  { id: "deepseek-r1", label: "中转 · DeepSeek R1", provider: "relay", thinking: true },
] as const;

export const MESSAGE_STATUS = {
  STREAMING: "streaming",
  COMPLETED: "completed",
  FAILED: "failed",
  ABORTED: "aborted",
} as const;
