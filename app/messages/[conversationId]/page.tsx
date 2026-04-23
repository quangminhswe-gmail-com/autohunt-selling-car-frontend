'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams, useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import ConversationList from '@/components/chat/ConversationList';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageInput from '@/components/chat/MessageInput';
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

interface MessageResponse {
  _id: string;
  senderId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  content: string;
  createdAt: string;
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

interface UIMessage {
  id: string | number;
  sender: 'buyer' | 'seller';
  text: string;
  time: string;
}

const SEEN_CONVERSATIONS_KEY = 'chat_seen_by_conversation';

const markConversationAsSeen = (conversationId: string) => {
  if (typeof window === 'undefined' || !conversationId) return;
  const raw = localStorage.getItem(SEEN_CONVERSATIONS_KEY);
  let seenMap: Record<string, string> = {};
  if (raw) {
    try {
      seenMap = JSON.parse(raw);
    } catch {
      seenMap = {};
    }
  }
  seenMap[conversationId] = new Date().toISOString();
  localStorage.setItem(SEEN_CONVERSATIONS_KEY, JSON.stringify(seenMap));
};

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
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

const mapMessage = (message: MessageResponse, currentUserId: string | null): UIMessage => ({
  id: message._id,
  sender: message.senderId._id === currentUserId ? 'buyer' : 'seller',
  text: message.content,
  time: formatTime(message.createdAt),
});

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;
  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);

  const userId = getCurrentUserId();
  const displayError = socketError || error;

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token || !userId) {
      router.push('/login');
      return;
    }

    const loadConversations = async () => {
      setLoadingConversations(true);
      setError(null);

      try {
        const data = await apiClient<ConversationResponse[]>('/chat/conversations');
        setConversations(data.map((conversation) => mapConversation(conversation, userId)));
      } catch (err) {
        console.error('Failed to load conversations', err);
        setError((err as Error).message || 'Unable to load conversations');
      } finally {
        setLoadingConversations(false);
      }
    };

    loadConversations();
  }, [router, userId]);

  useEffect(() => {
    if (!conversationId) return;
    if (!userId) {
      router.push('/login');
      return;
    }

    const loadMessages = async () => {
      setLoadingMessages(true);
      setError(null);

      try {
        const data = await apiClient<MessageResponse[]>(`/chat/${conversationId}/messages`);
        setMessages(data.map((message) => mapMessage(message, userId)));
        markConversationAsSeen(conversationId);
      } catch (err) {
        console.error('Failed to load messages', err);
        setError((err as Error).message || 'Unable to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [conversationId, router, userId]);

  useEffect(() => {
    if (!userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const client = io(baseUrl, {
      transports: ['websocket'],
    });

    client.on('connect', () => {
      setSocketError(null);
      if (conversationId) {
        client.emit('joinRoom', conversationId);
      }
    });

    client.on('connect_error', (err) => {
      setSocketError(err?.message || 'Real-time connection failed');
    });

    client.on('receiveMessage', (message: any) => {
      if (String(message.conversationId) !== conversationId) return;

      setMessages((prev) => {
        if (prev.some((msg) => String(msg.id) === String(message._id))) {
          return prev;
        }
        return [...prev, mapMessage(message, userId)];
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, lastMessage: message.content, time: formatTime(message.createdAt) }
            : conversation,
        ),
      );
      markConversationAsSeen(conversationId);
    });

    setSocket(client);

    return () => {
      client.disconnect();
      setSocket(null);
    };
  }, [userId, conversationId]);

  const handleConversationSelect = (id: string) => {
    router.push(`/messages/${id}`);
  };

  const handleSendMessage = async (text: string) => {
    if (!conversationId || !socket || !userId) {
      setError('Unable to send message, real-time connection unavailable.');
      return;
    }

    if (!socket.connected) {
      setError('Real-time connection is not ready yet.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      socket.emit('sendMessage', {
        conversationId,
        senderId: userId,
        content: text,
      });
    } catch (err) {
      console.error('Failed to send message', err);
      setError((err as Error).message || 'Unable to send message');
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((conv) => conv.id === conversationId);

  return (
    <ChatLayout>
      <ConversationList
        conversations={conversations}
        activeConversationId={conversationId}
        onConversationSelect={handleConversationSelect}
      />

      <div className="flex-1 flex flex-col bg-gray-50">
        {activeConversation ? (
          <>
            <ChatHeader
              name={activeConversation.name}
              avatar={activeConversation.avatar}
              isOnline={activeConversation.isOnline}
            />

            {loadingMessages ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">Loading messages...</div>
            ) : displayError ? (
              <div className="flex-1 p-6 text-red-700">{displayError}</div>
            ) : (
              <ChatWindow messages={messages} isTyping={sending} />
            )}

            <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation not found</h3>
              <p className="text-gray-500">Please select a valid conversation from the list.</p>
            </div>
          </div>
        )}
      </div>
    </ChatLayout>
  );
}
