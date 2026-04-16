import Link from 'next/link';

const bubbleBaseClasses =
  'flex items-center gap-2 rounded-full bg-[#006557] px-3 py-2.5 text-white font-semibold shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#005046]';

export default function ChatSupportBubble() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end gap-2">
      <Link href="/messages" aria-label="Go to Messages" className={bubbleBaseClasses}>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#006557] text-xs">
          ✉️
        </span>
        <span className="hidden sm:inline text-sm">Messages</span>
      </Link>

      <Link
        href="/support/requests"
        aria-label="Go to Support Request Center"
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
