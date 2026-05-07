export const AI_MODELS = [
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", provider: "deepseek", thinking: false },
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", provider: "deepseek", thinking: true },
] as const;

export const MESSAGE_STATUS = {
  STREAMING: "streaming",
  COMPLETED: "completed",
  FAILED: "failed",
  ABORTED: "aborted",
} as const;
