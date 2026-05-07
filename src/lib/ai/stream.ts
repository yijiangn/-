interface SSEChunk {
  content: string;
  reasoning_content: string;
  finish_reason: string | null;
  usage: { prompt_tokens?: number; completion_tokens?: number } | null;
}

interface StreamCallbacks {
  onChunk?: (chunk: SSEChunk) => void;
  onDone?: () => void | Promise<void>;
  onError?: (error: Error) => void | Promise<void>;
}

export function createSSEStream(
  apiResponse: Response,
  { onChunk, onDone, onError }: StreamCallbacks = {}
): ReadableStream {
  const reader = apiResponse.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  return new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;

            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;

              if (delta && onChunk) {
                onChunk({
                  content: delta.content || "",
                  reasoning_content: delta.reasoning_content || "",
                  finish_reason: parsed.choices?.[0]?.finish_reason || null,
                  usage: parsed.usage || null,
                });
              }

              controller.enqueue(
                new TextEncoder().encode(`data: ${data}\n\n`)
              );
            } catch {
              // skip parse errors
            }
          }
        }

        if (onDone) {
          const result = onDone();
          if (result instanceof Promise) await result;
        }
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        if (onError) {
          const result = onError(error instanceof Error ? error : new Error(String(error)));
          if (result instanceof Promise) await result;
        }
        controller.error(error);
      }
    },
  });
}
