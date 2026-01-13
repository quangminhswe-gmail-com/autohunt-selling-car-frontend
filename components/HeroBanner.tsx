'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function HeroBanner() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {/* Background Image */}
      <Image
        src="/herobanner.jpg"
        alt="Find Your Perfect Car"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-8">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8 text-center drop-shadow-lg">
          Find Your Perfect Car
        </h1>

        {/* Search Bar */}
        <div className="w-full max-w-3xl">
            <div className="flex items-center bg-white shadow-xl overflow-hidden">
                {/* Icon */}
                <div className="pl-5 text-black">
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Input */}
                <input
                type="text"
                placeholder="Search for your dream car"
                value={searchValue}
                onChange={handleSearch}
                className="flex-1 px-4 py-4 text-base md:text-lg text-gray-700 focus:outline-none"
                />

                {/* Button
                <button className="h-full px-6 md:px-8 bg-blue-600 text-white text-sm md:text-base font-semibold hover:bg-blue-700 transition">
                Search
                </button> */}
            </div>
        </div>

      </div>
    </div>
  );
}
