import { getProvider } from "@/lib/ai/providers/index";
import { getModelInfo } from "@/lib/ai/types";
import { createSSEStream } from "@/lib/ai/stream";
import {
  createConversationService,
  listMessagesService,
  insertMessageService,
  updateMessageService,
  updateConversationTimeService,
  getLatestSequence,
} from "@/lib/supabase/chat-repository";
import { supabaseRestRequest } from "@/lib/supabase/rest";

export const dynamic = "force-dynamic";

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export async function POST(request: Request) {
  try {
    const {
      messages,
      model: modelId,
      conversationId,
    } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "messages required" }, { status: 400 });
    }

    const modelInfo = getModelInfo(modelId);
    const provider = getProvider(modelInfo.provider);

    // 1. 如果没有 conversationId，新建 conversation
    let convId = conversationId;
    if (!convId) {
      const conv = await createConversationService({
        provider: modelInfo.provider,
        model: modelInfo.id,
      });
      convId = conv.id;
    } else {
      // 确保 conversation 存在，不存在则创建
      const existing = await supabaseRestRequest<any[]>("conversations", {
        searchParams: { id: `eq.${convId}` },
      });
      if (!existing || existing.length === 0) {
        const conv = await createConversationService({
          provider: modelInfo.provider,
          model: modelInfo.id,
        });
        convId = conv.id;
      }
    }

    // 2. 计算下一个 sequence
    const lastSeq = await getLatestSequence(convId);
    let nextSeq = lastSeq + 1;

    // 3. 保存用户消息
    const userMsg = messages[messages.length - 1];
    if (userMsg && userMsg.role === "user") {
      await insertMessageService({
        id: createId("msg"),
        conversation_id: convId,
        role: "user",
        content: userMsg.content,
        provider: modelInfo.provider,
        model: modelInfo.id,
        status: "completed",
        sequence: nextSeq++,
      });
    }

    // 4. 创建 assistant 消息占位
    const assistantMsgId = createId("msg");
    await insertMessageService({
      id: assistantMsgId,
      conversation_id: convId,
      role: "assistant",
      content: "",
      reasoning_content: null,
      provider: modelInfo.provider,
      model: modelInfo.id,
      status: "streaming",
      sequence: nextSeq++,
    });

    // 5. 调用 AI provider 流式
    let apiResponse: Response;
    try {
      apiResponse = await provider.createChatCompletionStream({
        model: modelInfo.id,
        messages,
      });
    } catch (err: any) {
      await updateMessageService(assistantMsgId, {
        status: "failed",
        error_message: err.message || "Unknown error",
      } as any);
      throw err;
    }

    // 6. Accumulator
    let accumulatedContent = "";
    let accumulatedReasoning = "";
    let finishReason: string | null = null;
    let tokenInput = 0;
    let tokenOutput = 0;

    const stream = createSSEStream(apiResponse, {
      onChunk({ content, reasoning_content, finish_reason, usage }) {
        accumulatedContent += content;
        accumulatedReasoning += reasoning_content;
        if (finish_reason) finishReason = finish_reason;
        if (usage) {
          tokenInput = usage.prompt_tokens || 0;
          tokenOutput = usage.completion_tokens || 0;
        }
      },
      async onDone() {
        await updateMessageService(assistantMsgId, {
          content: accumulatedContent,
          reasoning_content: accumulatedReasoning || null,
          status: "completed",
          finish_reason: finishReason,
          token_input: tokenInput,
          token_output: tokenOutput,
        } as any);
        await updateConversationTimeService(convId);
      },
      async onError(error) {
        await updateMessageService(assistantMsgId, {
          content: accumulatedContent || "",
          status: "failed",
          error_message: error.message,
        } as any);
      },
    });

    // 7. 返回 SSE 响应
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": convId,
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
