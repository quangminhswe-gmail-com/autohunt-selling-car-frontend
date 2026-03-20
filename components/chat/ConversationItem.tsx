'use client';

import { UserIcon } from '@/components/icons/Icons';

interface ConversationItemProps {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  time: string;
  isActive?: boolean;
  unreadCount?: number;
  isOnline?: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  id,
  name,
  avatar,
  lastMessage,
  time,
  isActive = false,
  unreadCount = 0,
  isOnline = false,
  onClick
}: ConversationItemProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-gray-600" />
          </div>
        )}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
          <span className="text-xs text-gray-500 flex-shrink-0">{time}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate">{lastMessage}</p>
          {unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}