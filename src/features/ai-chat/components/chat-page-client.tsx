"use client";

import { useChat } from "../hooks/use-chat";
import { useConversations } from "../hooks/use-conversations";
import { ConversationSidebar } from "./conversation-sidebar";
import { ChatArea } from "./chat-area";

export function ChatPageClient() {
  const chat = useChat();
  const convs = useConversations();

  async function handleSelectConversation(id: string) {
    await chat.loadMessages(id);
  }

  async function handleCreateConversation() {
    const conv = await convs.createConversation();
    if (conv) {
      chat.clearMessages();
      await chat.loadMessages(conv.id);
    }
  }

  async function handleDeleteConversation(id: string) {
    await convs.deleteConversation(id);
    if (chat.conversationId === id) {
      chat.clearMessages();
    }
  }

  return (
    <div className="flex h-full w-full">
      <ConversationSidebar
        conversations={convs.conversations}
        loading={convs.loading}
        activeId={chat.conversationId}
        onSelect={handleSelectConversation}
        onCreate={handleCreateConversation}
        onRename={convs.renameConversation}
        onDelete={handleDeleteConversation}
      />
      <ChatArea
        messages={chat.messages}
        isStreaming={chat.isStreaming}
        selectedModel={chat.selectedModel}
        error={chat.error}
        onSend={chat.sendMessage}
        onStop={chat.stopGeneration}
        onModelChange={chat.setSelectedModel}
      />
    </div>
  );
}
