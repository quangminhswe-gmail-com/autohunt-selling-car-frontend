'use client';

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "./icons/Icons";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(Boolean(token));
    };

    updateAuthState();

    window.addEventListener("authChange", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener("authChange", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center gap-0.5">
            <Image
              src="/logoautohunt.png"
              alt="AutoHunt Logo"
              width={120}
              height={80}
              className="object-contain"
              priority
            />
            <span className="text-sm font-bold text-[#006557] leading-none -mt-3">
              AutoHunt
            </span>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-6">
            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-[#006557] font-bold">
              <Link href="/">Home</Link>
              <Link href="/vehicles">Browse Cars</Link>
              <Link href="/sell">Sell Cars</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/support">Support</Link>
            </nav>

            <div className="hidden md:block h-6 w-px bg-gray-300" />

            {/* Notification Bell */}
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors relative">
              <BellIcon className="w-6 h-6 text-black" />
              {/* Notification Badge - placeholder for now */}
              {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span> */}
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              >
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

              {open && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
                  
                  {/* Caret */}
                  <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45" />

                  {!isLoggedIn ? (
                    <>
                      <Link
                        href="/signup"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setOpen(false)}
                      >
                        Sign Up
                      </Link>
                      <Link
                        href="/login"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setOpen(false)}
                      >
                        Login
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setOpen(false)}
                      >
                        View Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/orders/seller"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setOpen(false)}
                      >
                        Seller Orders
                      </Link>
                      <Link
                        href="/support/requests"
                        className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setOpen(false)}
                      >
                        My Support Requests
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem("token");
                          window.dispatchEvent(new Event("authChange"));
                          setIsLoggedIn(false);
                          setOpen(false);
                          router.push("/login");
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
