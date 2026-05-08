'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/app/utils/api';
import { buildLoginUrl, getAuthToken } from '@/app/utils/auth';

const bubbleBaseClasses =
  'flex items-center gap-2 rounded-full bg-[#006557] px-3 py-2.5 text-white font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#005046]';

const SEEN_CONVERSATIONS_KEY = 'chat_seen_by_conversation';

interface ConversationResponse {
  _id: string;
  updatedAt?: string;
}

interface MessageResponse {
  _id: string;
  senderId: {
    _id: string;
  };
  createdAt: string;
}

export default function ChatSupportBubble() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasToken, setHasToken] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const currentUserId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const token = getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.id || null;
    } catch {
      return null;
    }
  }, []);

  const getSeenMap = useCallback((): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(SEEN_CONVERSATIONS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!currentUserId) {
      setUnreadCount(0);
      return;
    }

    try {
      const conversations = await apiClient<ConversationResponse[]>('/chat/conversations');
      if (!Array.isArray(conversations) || conversations.length === 0) {
        setUnreadCount(0);
        return;
      }

      const seenMap = getSeenMap();
      let unread = 0;

      for (const conversation of conversations) {
        const messages = await apiClient<MessageResponse[]>(`/chat/${conversation._id}/messages`);
        if (!Array.isArray(messages) || messages.length === 0) continue;

        const lastMessage = messages[messages.length - 1];
        const lastSeenAt = seenMap[conversation._id];
        const isFromOtherUser = String(lastMessage.senderId?._id) !== String(currentUserId);
        const isNewerThanSeen =
          !lastSeenAt || new Date(lastMessage.createdAt).getTime() > new Date(lastSeenAt).getTime();

        if (isFromOtherUser && isNewerThanSeen) {
          unread += 1;
        }
      }

      setUnreadCount(unread);
    } catch {
      // keep previous unread count on transient network errors
    }
  }, [currentUserId, getSeenMap]);

  useEffect(() => {
    // Set hasToken after mounting to avoid hydration mismatch
    setHasToken(Boolean(getAuthToken()));
    setIsMounted(true);
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const timer = window.setInterval(refreshUnreadCount, 15000);
    return () => window.clearInterval(timer);
  }, [refreshUnreadCount]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2">
      <Link
        href={isMounted && hasToken ? '/messages' : buildLoginUrl('/messages')}
        aria-label="Open Messages"
        className={`${bubbleBaseClasses} relative`}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#006557] text-xs relative">
          ✉️
        </span>
        <span className="hidden sm:inline text-sm">Messages</span>
        {hasToken && unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-[#006557]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>

      <Link
        href={isMounted && hasToken ? '/support/requests' : '/support'}
        aria-label="Open Support"
        className={bubbleBaseClasses}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#006557] text-xs">
          🛟
        </span>
        <span className="hidden sm:inline text-sm">Support</span>
      </Link>
    </div>
  );
}
