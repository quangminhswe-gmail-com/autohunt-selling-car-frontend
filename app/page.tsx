'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import ExploreBrands from '@/components/ExploreBrands';
import OurSignals from '@/components/OurSignals';
import WhyChooseAutoHunt from '@/components/WhyChooseAutoHunt';
import HowItWorks from '@/components/HowItWorks';
import ReadyToSell from '@/components/ReadyToSell';
import Footer from '@/components/Footer';

// Sample car data
const FEATURED_CARS = [
  {
    id: 1,
    year: 2020,
    make: 'Toyota',
    model: 'Camry',
    price: 24500,
    mileage: 48000,
    location: 'Ho Chi Minh',
    image: '/2020camry.png',
    transmission: 'Automatic',
  },
  {
    id: 2,
    year: 2019,
    make: 'Honda',
    model: 'Accord',
    price: 22800,
    mileage: 58000,
    location: 'Can Tho',
    image: '/2019hondaaccord.png',
    transmission: 'Automatic',
  },
  {
    id: 3,
    year: 2021,
    make: 'BMW',
    model: '3 Series',
    price: 35900,
    mileage: 32000,
    location: 'Ho Chi Minh',
    image: '/2021bmw3seri.png',
    transmission: 'Automatic',
  },
  {
    id: 4,
    year: 2018,
    make: 'Ford',
    model: 'F-150',
    price: 28500,
    mileage: 62000,
    location: 'Vinh Long',
    image: '/2018fordf150.png',
    transmission: 'Automatic',
  },
  {
    id: 5,
    year: 2020,
    make: 'Honda',
    model: 'City',
    price: 20500,
    mileage: 45000,
    location: 'Ha Noi',
    image: '/2020hondacity.png',
    transmission: 'Manual',
  },
  {
    id: 6,
    year: 2022,
    make: 'Mazda',
    model: 'CX5',
    price: 15800,
    mileage: 18000,
    location: 'Can Tho',
    image: '/2022mazdacx5.png',
    transmission: 'Automatic',
  },
  {
    id: 7,
    year: 2025,
    make: 'Bentley',
    model: 'Continental GT',
    price: 125900,
    mileage: 1200,
    location: 'Ho Chi Minh',
    image: '/bentley-continentalgtspeed-2025.png',
    transmission: 'Automatic',
  },
  {
    id: 8,
    year: 2025,
    make: 'Audi',
    model: 'A6',
    price: 48500,
    mileage: 2000,
    location: 'Vinh Long',
    image: '/audi-a6.png',
    transmission: 'Automatic',
  },
];

export default function HomePage() {
  const [selectedCars] = useState(FEATURED_CARS);

  const handleContactSeller = (carId: number) => {
    alert(`Contacting seller for car ${carId}`);
  };

  return (
    <main>
      <Header />
      <HeroBanner />
      <ExploreBrands />
      
      {/* Featured Cars Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured Cars</h2>
            <p className="text-gray-600 text-lg">Discover the best deals from verified sellers</p>
            <div className="flex justify-end mt-4">
              <a href="/vehicles" className="text-[#006557] font-semibold flex items-center gap-2">
                Explore All Vehicles <span>›</span>
              </a>
            </div>
          </div>

          {/* Cars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedCars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                {/* Car Image */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <img 
                    src={car.image} 
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                {/* Car Details */}
                <div className="p-4">
                  {/* Car Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {car.year} {car.make} {car.model}
                  </h3>

                  {/* Specs */}
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.625 0.875V1.75H1.3125C0.587891 1.75 0 2.33789 0 3.0625V4.375H12.25V3.0625C12.25 2.33789 11.6621 1.75 10.9375 1.75H9.625V0.875C9.625 0.391016 9.23398 0 8.75 0C8.26602 0 7.875 0.391016 7.875 0.875V1.75H4.375V0.875C4.375 0.391016 3.98398 0 3.5 0C3.01602 0 2.625 0.391016 2.625 0.875ZM12.25 5.25H0V12.6875C0 13.4121 0.587891 14 1.3125 14H10.9375C11.6621 14 12.25 13.4121 12.25 12.6875V5.25Z" fill="#4B5563"/>
                      </svg>
                      <span>{car.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 0H4.95469C4.21367 0 3.55195 0.467578 3.30586 1.16484L0.0847656 10.2594C0.0300781 10.418 0 10.5875 0 10.757C0 11.5801 0.669922 12.25 1.49297 12.25H7V10.5C7 10.016 7.39102 9.625 7.875 9.625C8.35898 9.625 8.75 10.016 8.75 10.5V12.25H14.257C15.0828 12.25 15.75 11.5801 15.75 10.757C15.75 10.5875 15.7199 10.418 15.6652 10.2594L12.4441 1.16484C12.1953 0.467578 11.5363 0 10.7953 0H8.75V1.75C8.75 2.23398 8.35898 2.625 7.875 2.625C7.39102 2.625 7 2.23398 7 1.75V0ZM8.75 5.25V7C8.75 7.48398 8.35898 7.875 7.875 7.875C7.39102 7.875 7 7.48398 7 7V5.25C7 4.76602 7.39102 4.375 7.875 4.375C8.35898 4.375 8.75 4.76602 8.75 5.25Z" fill="#4B5563"/>
                      </svg>
                      <span>{car.mileage.toLocaleString()} km</span>
                    </div>
                  </div>

                  {/* Price + Location */}
                  <div className="flex items-center justify-between mb-4">
                    {/* Price */}
                    <p className="text-2xl font-bold text-[#006557]">
                      ${car.price.toLocaleString()}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        width="11"
                        height="14"
                        viewBox="0 0 11 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.89805 13.65C7.30078 11.8945 10.5 7.63984 10.5 5.25C10.5 2.35156 8.14844 0 5.25 0C2.35156 0 0 2.35156 0 5.25C0 7.63984 3.19922 11.8945 4.60195 13.65C4.93828 14.0684 5.56172 14.0684 5.89805 13.65ZM5.25 3.5C5.71413 3.5 6.15925 3.68437 6.48744 4.01256C6.81563 4.34075 7 4.78587 7 5.25C7 5.71413 6.81563 6.15925 6.48744 6.48744C6.15925 6.81563 5.71413 7 5.25 7C4.78587 7 4.34075 6.81563 4.01256 6.48744C3.68437 6.15925 3.5 5.71413 3.5 5.25C3.5 4.78587 3.68437 4.34075 4.01256 4.01256C4.34075 3.68437 4.78587 3.5 5.25 3.5Z"
                          fill="#6B7280"
                        />
                      </svg>
                      <span>{car.location}</span>
                    </div>
                  </div>


                  {/* Contact Button */}
                  <button
                    onClick={() => handleContactSeller(car.id)}
                    className="w-full bg-[#006557] text-white py-2 px-4 rounded transition-colors"
                  >
                    Contact Seller
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <OurSignals />
      <WhyChooseAutoHunt />
      <HowItWorks />
      <ReadyToSell />
      <Footer />
    </main>
  );
}