'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatLayout from '@/components/chat/ChatLayout';
import ConversationList from '@/components/chat/ConversationList';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageInput from '@/components/chat/MessageInput';

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

const mockMessagesData: Record<string, any[]> = {
  "1": [
    {
      id: 1,
      sender: "buyer",
      text: "Hello, is the car still available?",
      time: "10:00 AM"
    },
    {
      id: 2,
      sender: "seller",
      text: "Yes it is still available.",
      time: "10:02 AM"
    },
    {
      id: 3,
      sender: "buyer",
      text: "Great! Can you tell me more about its condition?",
      time: "10:05 AM"
    },
    {
      id: 4,
      sender: "seller",
      text: "The car is in excellent condition. It has only 25,000 km on it and has been well maintained.",
      time: "10:08 AM"
    }
  ],
  "2": [
    {
      id: 1,
      sender: "buyer",
      text: "Hi, I saw your Toyota Camry listing. Can we negotiate the price?",
      time: "Yesterday 2:30 PM"
    },
    {
      id: 2,
      sender: "seller",
      text: "Hello! The price is already quite competitive. What price were you thinking?",
      time: "Yesterday 2:35 PM"
    }
  ],
  "3": [
    {
      id: 1,
      sender: "buyer",
      text: "Hello, when can we meet to see the car?",
      time: "2 days ago 9:00 AM"
    }
  ]
};

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.conversationId as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(conversationId);

  const currentConversation = mockConversations.find(c => c.id === conversationId);

  useEffect(() => {
    if (conversationId && mockMessagesData[conversationId]) {
      setMessages(mockMessagesData[conversationId]);
    }
  }, [conversationId]);

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id);
    router.push(`/messages/${id}`);
  };

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: messages.length + 1,
      sender: "buyer" as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate seller typing and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const sellerResponse = {
        id: messages.length + 2,
        sender: "seller" as const,
        text: "Thanks for your message! I'll get back to you soon.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, sellerResponse]);
    }, 2000);
  };

  if (!currentConversation) {
    return (
      <ChatLayout>
        <ConversationList
          conversations={mockConversations}
          activeConversationId={activeConversationId}
          onConversationSelect={handleConversationSelect}
        />
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Conversation not found</h3>
            <p className="text-gray-500">The conversation you're looking for doesn't exist.</p>
          </div>
        </div>
      </ChatLayout>
    );
  }

  return (
    <ChatLayout>
      <ConversationList
        conversations={mockConversations}
        activeConversationId={activeConversationId}
        onConversationSelect={handleConversationSelect}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          name={currentConversation.name}
          avatar={currentConversation.avatar}
          isOnline={currentConversation.isOnline}
        />

        <ChatWindow
          messages={messages}
          isTyping={isTyping}
        />

        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isTyping}
        />
      </div>
    </ChatLayout>
  );
}