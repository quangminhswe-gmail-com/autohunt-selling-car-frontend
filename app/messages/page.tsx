'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import ConversationList from '@/components/chat/ConversationList';

// Mock data
const mockConversations = [
  {
    id: "1",
    name: "Nguyen Van A",
    avatar: "/avatar1.jpg",
    lastMessage: "Is the car still available?",
    time: "10:20 AM",
    unreadCount: 2,
    isOnline: true
  },
  {
    id: "2",
    name: "Tran Minh B",
    avatar: "/avatar2.jpg",
    lastMessage: "Can we negotiate the price?",
    time: "Yesterday",
    unreadCount: 0,
    isOnline: false
  },
  {
    id: "3",
    name: "Le Thi C",
    avatar: "/avatar3.jpg",
    lastMessage: "When can we meet to see the car?",
    time: "2 days ago",
    unreadCount: 1,
    isOnline: true
  }
];

export default function MessagesPage() {
  const router = useRouter();
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
    router.push(`/messages/${conversationId}`);
  };

  return (
    <ChatLayout>
      <ConversationList
        conversations={mockConversations}
        activeConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
      />

      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
        </div>
      </div>
    </ChatLayout>
  );
}