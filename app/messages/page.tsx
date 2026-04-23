'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import ConversationList from '@/components/chat/ConversationList';
import { apiClient } from '@/app/utils/api';

interface Participant {
  _id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
}

interface ConversationResponse {
  _id: string;
  participants: Participant[];
  lastMessage?: string;
  updatedAt?: string;
}

interface UIConversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
}

const SEEN_CONVERSATIONS_KEY = 'chat_seen_by_conversation';

const getCurrentUserId = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.id || null;
  } catch {
    return null;
  }
};

const formatTime = (iso?: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
};

const getParticipantName = (participant?: Participant) => {
  if (!participant) return 'Unknown';

  const fullName = [participant.firstName, participant.lastName].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;
  if (participant.fullName) return participant.fullName;
  if (participant.email) return participant.email;
  return participant._id || 'Unknown';
};

const mapConversation = (conversation: ConversationResponse, userId: string | null): UIConversation => {
  const otherParticipant =
    conversation.participants.find((participant) => participant._id?.toString() !== userId) ||
    conversation.participants[0];
  const name = getParticipantName(otherParticipant);

  return {
    id: conversation._id,
    name,
    avatar: undefined,
    lastMessage: conversation.lastMessage || 'No messages yet',
    time: formatTime(conversation.updatedAt),
    unreadCount: 0,
    isOnline: false,
  };
};

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userId = getCurrentUserId();

    if (!token || !userId) {
      router.push('/login');
      return;
    }

    const loadConversations = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient<ConversationResponse[]>('/chat/conversations');
        setConversations(data.map((conversation) => mapConversation(conversation, userId)));

        const seenMap = data.reduce<Record<string, string>>((acc, conversation) => {
          if (conversation._id && conversation.updatedAt) {
            acc[conversation._id] = conversation.updatedAt;
          }
          return acc;
        }, {});
        localStorage.setItem(SEEN_CONVERSATIONS_KEY, JSON.stringify(seenMap));
      } catch (err) {
        console.error('Failed to load conversations', err);
        setError((err as Error).message || 'Unable to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [router]);

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  return (
    <ChatLayout>
      <ConversationList
        conversations={conversations}
        activeConversationId={undefined}
        onConversationSelect={handleConversationSelect}
      />

      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
        {loading ? (
          <p className="text-gray-500">Loading conversations...</p>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500">Once a buyer or seller messages you, the conversation will appear here.</p>
          </div>
        ) : (
          <div className="text-center px-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500">Choose a conversation from the list to continue messaging.</p>
          </div>
        )}
      </div>
    </ChatLayout>
  );
}
