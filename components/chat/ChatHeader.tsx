'use client';

import { UserIcon, MoreHorizontalIcon } from '@/components/icons/Icons';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export default function ChatHeader({ name, avatar, isOnline = false }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-gray-600" />
            </div>
          )}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">
            {isOnline ? 'Active now' : 'Offline'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontalIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}