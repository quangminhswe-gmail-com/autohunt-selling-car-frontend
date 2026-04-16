'use client';

interface MessageBubbleProps {
  text: string;
  time: string;
  isOwn: boolean;
}

export default function MessageBubble({ text, time, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed">{text}</p>
        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
          {time}
        </p>
      </div>
    </div>
  );
}