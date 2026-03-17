'use client';

import { useState } from 'react';
import { SendIcon, PaperclipIcon, SmileIcon } from '@/components/icons/Icons';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-3 bg-white">
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <PaperclipIcon className="w-5 h-5 text-gray-600" />
        </button>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 border text-black border-gray-300 rounded-full px-4 py-2 outline-none hover:border-gray-400 focus:border-blue-500 transition-colors"
          disabled={disabled}
        />

        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <SmileIcon className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className={`p-2 rounded-full transition-colors ${
            message.trim() && !disabled
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}