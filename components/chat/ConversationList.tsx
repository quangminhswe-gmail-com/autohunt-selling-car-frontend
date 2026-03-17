'use client';

import { useState } from 'react';
import ConversationItem from './ConversationItem';

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect
}: ConversationListProps) {
  return (
    <div className="w-80 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">Recent conversations</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              {...conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onConversationSelect(conversation.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}