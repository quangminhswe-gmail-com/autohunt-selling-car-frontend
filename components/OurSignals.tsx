'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function OurSignals() {
  const features = [
    'List it. Sell it. Drive it.',
    'Connecting Wheels, Empowering Deals.',
    'Your Ultimate Marketplace for Every Mile.',
  ];

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 md:mb-16 text-black">
          Our Signals
        </h2>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-end">
          {/* Images Section - Left */}
          <div className="relative w-full" style={{ height: '400px' }}>
            {/* Image 2 - Large image in background */}
            <div className="absolute top-0 right-0 w-72 h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="/oursignals2.png"
                alt="Car 2"
                width={320}
                height={320}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image 1 - Square and positioned lower left */}
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-2xl overflow-hidden shadow-lg z-10">
              <Image
                src="/oursignals1.png"
                alt="Car 1"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content Section - Right */}
          <div className="flex flex-col justify-center">
            {/* Main Heading */}
            <h3 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Turn Your Car Into Cash.
            </h3>

            {/* Subheading */}
            <p className="text-xl md:text-2xl font-bold text-black mb-6">
              Connect With Buyers Instantly
            </p>

            {/* Description */}
            <p className="text-black text-base md:text-lg mb-8">
              We are committed to providing our customers with exceptional service,
              competitive pricing, and a wide range of quality vehicles.
            </p>

            {/* Features List */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F2F4FE] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  <span className="text-black text-base">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link href="/sell">
              <button className="bg-[#006557] hover:bg-[#004d44] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 w-fit">
                Get Started
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.6111 0H5.05557C4.84061 0 4.66667 0.173943 4.66667 0.388901C4.66667 0.603859 4.84061 0.777802 5.05557 0.777802H12.6723L0.113941 13.3362C-0.0379804 13.4881 -0.0379804 13.7342 0.113941 13.8861C0.189884 13.962 0.289415 14 0.38891 14C0.488405 14 0.5879 13.962 0.663879 13.8861L13.2222 1.3277V8.94447C13.2222 9.15943 13.3961 9.33337 13.6111 9.33337C13.8261 9.33337 14 9.15943 14 8.94447V0.388901C14 0.173943 13.826 0 13.6111 0Z" fill="white"/>
                </svg>

              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
