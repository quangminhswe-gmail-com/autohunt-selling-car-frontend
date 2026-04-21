"use client";

import { redirect } from "next/navigation";

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import HeroBanner from '@/components/HeroBanner';
import ExploreBrands from '@/components/ExploreBrands';
import OurSignals from '@/components/OurSignals';
import WhyChooseAutoHunt from '@/components/WhyChooseAutoHunt';
import HowItWorks from '@/components/HowItWorks';
import ReadyToSell from '@/components/ReadyToSell';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';
import { showErrorNotification } from '@/utils/notifications';
import CarCard from '@/components/CarCard';


interface ApiVehicle {
  _id?: string;
  id?: string;
  make?: string;
  model?: string;
  yearOfManufacture?: number;
  price?: number;
  mileage?: number;
  transmission?: string;
  images?: string[];
  location?: string;
}

interface Posting {
  _id: string;
  status?: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  locationCity?: string;
  locationDistrict?: string;
  locationAddress?: string;
  vehicle: {
    _id?: string;
    make?: string;
    model?: string;
    yearOfManufacture?: number;
    mileage?: number;
    transmission?: string;
    images?: string[];
  };
}

interface FeaturedCar {
  id: string;
  year: number;
  make: string;
  model: string;
  price: number;
  mileage: number;
  location: string;
  image: string;
  transmission: string;
  targetHref: string;
  currency?: string;
}

const FEATURED_CAR_LIMIT = 8;

export default function HomePage() {
  const [selectedCars, setSelectedCars] = useState<FeaturedCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleContactSeller = async (carId: string) => {
    const shouldStart = window.confirm('Do you want to start a conversation with the seller?');
    if (!shouldStart) return;

    try {
      const postingDetails = await apiClient<Partial<Posting> & { ownerId?: { _id: string } }>(
        `/postings/details/${carId}`,
      );

      const sellerId =
        typeof postingDetails.ownerId === 'string'
          ? postingDetails.ownerId
          : postingDetails.ownerId?._id;

      if (!sellerId) {
        throw new Error('Seller information is unavailable.');
      }

      const conversation = await apiClient<{ _id: string }>('/chat/start', {
        method: 'POST',
        body: { targetUserId: sellerId },
      });

      window.location.href = `/messages/${conversation._id}`;
    } catch (err) {
      console.error('Failed to start conversation', err);
      showErrorNotification('Error', (err as Error).message || 'Unable to start conversation. Please try again.');
    }
  };

  useEffect(() => {
    const fetchFeaturedCars = async () => {
      setLoading(true);
      setError(null);

      try {
        // Prefer posting records so we can link to /vehicle/[postingId] and show location
        const postings = await apiClient<Posting[]>('/postings');

        const featured = (postings || [])
          .filter((posting) => posting.status?.toLowerCase() === 'active')
          .slice(0, FEATURED_CAR_LIMIT)
          .map((posting) => ({
            id: posting._id,
            year: posting.vehicle?.yearOfManufacture || 0,
            make: posting.vehicle?.make || 'Unknown',
            model: posting.vehicle?.model || 'Unknown',
            price: posting.price || 0,
            mileage: posting.vehicle?.mileage || 0,
            location:
              posting.locationCity || posting.locationDistrict || posting.locationAddress || 'Unknown',
            image: posting.vehicle?.images?.[0] || '/default-car.png',
            transmission: posting.vehicle?.transmission || 'Unknown',
            targetHref: `/vehicle/${posting._id}`,
            currency: 'VND',
          }));

        setSelectedCars(featured);
      } catch (err) {
        console.warn('Falling back to public vehicle API for featured cars', err);

        try {
          const vehicles = await apiClient<ApiVehicle[]>('/public/vehicle');
          const featured = (vehicles || [])
            .slice(0, 8)
            .map((vehicle) => ({
              id: vehicle._id || vehicle.id || 'unknown',
              year: vehicle.yearOfManufacture || 0,
              make: vehicle.make || 'Unknown',
              model: vehicle.model || 'Unknown',
              price: vehicle.price || 0,
              mileage: vehicle.mileage || 0,
              location: vehicle.location || 'Unknown',
              image: vehicle.images?.[0] || '/default-car.png',
              transmission: vehicle.transmission || 'Unknown',
              targetHref: '/vehicles',
              currency: 'VND',
            }));
          setSelectedCars(featured);
        } catch (fallbackErr) {
          console.error('Failed to load featured cars from public API', fallbackErr);
          setError('Unable to load featured cars. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCars();
  }, []);

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

          {/* Conditional Rendering Logic */}
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading featured cars...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : selectedCars.length === 0 ? (
            <div className="text-center text-gray-500 py-10">No featured cars available right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedCars.map((car) => (
                <CarCard
                  key={car.id}
                  id={car.id}
                  year={car.year}
                  make={car.make}
                  model={car.model}
                  price={car.price}
                  mileage={car.mileage}
                  location={car.location}
                  transmission={car.transmission}
                  image={car.image}
                  href={car.targetHref}
                  onContact={handleContactSeller}
                  onBuy={(id) => (window.location.href = `/vehicle/${id}/buy`)}
                  variant="grid"
                  currency={car.currency}
                />
              ))}
            </div>
          )}
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
