import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <Link href="/" className="flex flex-col items-center gap-0.1">
            {/* Logo Image */}
            <Image
              src="/logoautohunt.png"
              alt="AutoHunt Logo"
              width={120}
              height={80}
              className="object-contain"
              priority
            />
            {/* Brand name */}
            <span className="text-sm font-bold text-[#006557] leading-none -mt-3">
              AutoHunt
            </span>
          </Link>

          {/* Right side: Menu + Divider + User Icon */}
          <div className="flex items-center gap-6">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-[#006557] font-bold">
              <Link href="/">Home</Link>
              <Link href="/browse">Browse Cars</Link>
              <Link href="/sell">Sell Cars</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </nav>

            {/* Vertical Divider */}
            <div className="hidden md:block h-6 w-px bg-gray-300" />

            {/* User Account Icon */}
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
