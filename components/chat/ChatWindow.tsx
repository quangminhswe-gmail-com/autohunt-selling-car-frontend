'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  id: number;
  sender: 'buyer' | 'seller';
  text: string;
  time: string;
}

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
}

export default function ChatWindow({ messages, isTyping = false }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {messages.map((message) => (
        <div key={message.id}>
          <MessageBubble
            text={message.text}
            time={message.time}
            isOwn={message.sender === 'buyer'}
          />
          <div className={`text-xs text-gray-500 mt-1 ${message.sender === 'buyer' ? 'text-right' : 'text-left'}`}>
            {message.time}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-gray-200 rounded-2xl px-4 py-2 max-w-xs">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}