'use client';

import Link from 'next/link';

export default function ReadyToSell() {
  return (
    <section className="py-16 md:py-20 bg-[#006557]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Sell Your Car?
        </h2>

        {/* Description */}
        <p className="text-white text-base md:text-lg mb-10 max-w-2xl mx-auto opacity-95">
          Join thousands of sellers who have successfully sold their cars on AutoHunt
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/sell">
            <button className="bg-white text-[#006557] font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Post Your Car
            </button>
          </Link>
          <Link href="/learn-more">
            <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
