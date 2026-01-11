'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Brand {
  id: number;
  name: string;
  logo: string;
}

const brands: Brand[] = [
  {
    id: 1,
    name: 'Audi',
    logo: '/audilogo.png',
  },
  {
    id: 2,
    name: 'BMW',
    logo: '/bmwlogo.png',
  },
  {
    id: 3,
    name: 'Ford',
    logo: '/fordlogo.png',
  },
  {
    id: 4,
    name: 'Mercedes Benz',
    logo: '/merclogo.png',
  },
  {
    id: 5,
    name: 'Volkswagen',
    logo: '/volkswagenlogo.png',
  },
];

export default function ExploreBrands() {
  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#006557] mb-2">
                Explore Our Premium Brands
            </h2>

            <div className="flex justify-end">
                <Link
                href="/brands"
                className="inline-flex items-center gap-1 text-[#006557] text-xs md:text-sm font-bold hover:text-[#004d44] transition-colors"
                >
                See more
                <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                    />
                </svg>
                </Link>
            </div>
        </div>


        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.name.toLowerCase().replace(' ', '-')}`}
            >
              <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center justify-center min-h-[140px] cursor-pointer">
                <div className="relative w-16 h-16 md:w-24 md:h-24 mb-3">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-center font-semibold text-gray-800 text-xs md:text-sm">
                  {brand.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
