"use client";

import { useCallback, useState } from "react";
import { ChatArea } from "./chat-area";
import { ConversationSidebar } from "./conversation-sidebar";
import { useChat } from "../hooks/use-chat";
import { useConversations } from "../hooks/use-conversations";

export function ChatPageClient() {
  const chat = useChat();
  const convs = useConversations();
  const [showSidebar, setShowSidebar] = useState(false);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      await chat.loadMessages(id);
      setShowSidebar(false);
    },
    [chat]
  );

  const handleCreateConversation = useCallback(async () => {
    const conv = await convs.createConversation();
    if (conv) {
      chat.clearMessages();
      await chat.loadMessages(conv.id);
      setShowSidebar(false);
    }
  }, [convs, chat]);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await convs.deleteConversation(id);
      if (chat.conversationId === id) {
        chat.clearMessages();
      }
    },
    [convs, chat]
  );

  return (
    <div className="flex h-full w-full overflow-hidden rounded-[28px] border border-white/55 bg-white/55 shadow-float backdrop-blur-xl dark:border-white/10 dark:bg-stone-950/50">
      <div className="hidden md:block">
        <ConversationSidebar
          conversations={convs.conversations}
          loading={convs.loading}
          activeId={chat.conversationId}
          onSelect={handleSelectConversation}
          onCreate={handleCreateConversation}
          onRename={convs.renameConversation}
          onDelete={handleDeleteConversation}
        />
      </div>

      {showSidebar ? (
        <div className="fixed inset-0 z-[160] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-950/35 backdrop-blur-sm"
            aria-label="关闭对话列表"
            onClick={() => setShowSidebar(false)}
          />
          <div className="absolute bottom-0 left-0 top-0 w-[min(86vw,320px)] animate-slide-in">
            <ConversationSidebar
              conversations={convs.conversations}
              loading={convs.loading}
              activeId={chat.conversationId}
              onSelect={handleSelectConversation}
              onCreate={handleCreateConversation}
              onRename={convs.renameConversation}
              onDelete={handleDeleteConversation}
            />
          </div>
        </div>
      ) : null}

      <ChatArea
        messages={chat.messages}
        isStreaming={chat.isStreaming}
        selectedModel={chat.selectedModel}
        error={chat.error}
        onSend={chat.sendMessage}
        onStop={chat.stopGeneration}
        onModelChange={chat.setSelectedModel}
        onOpenSidebar={() => setShowSidebar(true)}
        activeConversation={!!chat.conversationId}
      />
    </div>
  );
}
