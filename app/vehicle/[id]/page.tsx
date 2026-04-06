'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { apiClient } from '@/app/utils/api';
import Footer from '@/components/Footer';
import ReadyToSell from '@/components/ReadyToSell';

/* ================= TYPES ================= */
interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  licensePlate: string;
  vinNumber: string;
  color: string;
  mileage: number;
  transmission: string;
  type: string;
  fuelType: string;
  condition: string;
  features: string[];
  description: string;
  price: number;
  images: string[];
}

interface Posting {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  locationCity?: string;
  locationDistrict?: string;
  locationAddress?: string;
  vehicle: Vehicle;
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    rating: number;
    totalPostings: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerId: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

const RELATED_CARS = [
  {
    id: 2,
    year: 2022,
    make: 'Audi',
    model: 'A4',
    price: 38500,
    mileage: 18000,
    location: 'Ho Chi Minh',
    image: '/audi-a6.png',
  },
  {
    id: 3,
    year: 2021,
    make: 'BMW',
    model: '5 Series',
    price: 42900,
    mileage: 26000,
    location: 'Can Tho',
    image: '/audi-a6.png',
  },
  {
    id: 4,
    year: 2023,
    make: 'Mercedes-Benz',
    model: 'C-Class',
    price: 46900,
    mileage: 12000,
    location: 'Ha Noi',
    image: '/audi-a6.png',
  },
  {
    id: 5,
    year: 2022,
    make: 'Lexus',
    model: 'ES 250',
    price: 41500,
    mileage: 22000,
    location: 'Vinh Long',
    image: '/audi-a6.png',
  },
];

/* ================= ICON ================= */
const StarIcon = ({ opacity = 1 }: { opacity?: number }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity }}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

/* ================= STAR RATING COMPONENT ================= */
const StarRating = ({ rating, size = 'sm', showValue = true }: { rating: number; size?: 'sm' | 'md' | 'lg'; showValue?: boolean }) => {
  const starSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            className={`${starSize} ${
              i <= Math.floor(rating)
                ? 'text-yellow-400'
                : i - rating < 1
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
            style={{
              opacity:
                i <= Math.floor(rating) ? 1 : i - rating < 1 ? rating % 1 : 0.3,
            }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
      {showValue && (
        <span className={`font-semibold text-gray-700 ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

/* ================= PAGE ================= */
export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [posting, setPosting] = useState<Posting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedCars] = useState(RELATED_CARS);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const router = useRouter();

  const handleContactSeller = async (carId: number | string) => {
    if (!posting?.ownerId?._id) {
      alert('Seller information is unavailable.');
      return;
    }

    const shouldStart = window.confirm(
      'Do you want to start a conversation with the seller?'
    );

    if (!shouldStart) {
      return;
    }

    try {
      const conversation = await apiClient<{ _id: string }>('/chat/start', {
        method: 'POST',
        body: {
          targetUserId: posting.ownerId._id,
        },
      });

      window.location.href = `/messages/${conversation._id}`;
    } catch (err) {
      console.error('Unable to start conversation', err);
      alert('Unable to start the conversation. Please try again later.');
    }
  };

  const handleBuy = () => {
    if (id) {
      router.push(`/vehicle/${id}/buy`);
    }
  };

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
  };

  const nextImage = () => {
    if (posting?.vehicle?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % posting.vehicle.images.length);
    }
  };

  const prevImage = () => {
    if (posting?.vehicle?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + posting.vehicle.images.length) % posting.vehicle.images.length);
    }
  };

  useEffect(() => {
    const fetchPosting = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient<Posting>(`/postings/details/${id}`);
        setPosting(data);
        
        // Use seller's rating from their profile
        setAverageRating(data.ownerId?.rating || 0);
        
        // Fetch reviews for this vehicle to display comments
        setReviewsLoading(true);
        try {
          // Use vehicle _id from the response, fallback to id field, then fallback to posting id
          const vehicleId = (data.vehicle as any)._id || data.vehicle.id || id;
          const reviewsData = await apiClient<Review[]>(`/reviews/vehicle/${vehicleId}`);
          setReviews(reviewsData);
        } catch (err) {
          console.error('Failed to load reviews', err);
        } finally {
          setReviewsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load posting details', err);
        setError((err as Error).message || 'Failed to load posting details');
      } finally {
        setLoading(false);
      }
    };

    fetchPosting();
  }, [id]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!imageViewerOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          closeImageViewer();
          break;
      }
    };

    if (imageViewerOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [imageViewerOpen, currentImageIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading car details...</p>
      </div>
    );
  }

  if (error || !posting?.vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-500">{error || 'Vehicle details not found.'}</p>
      </div>
    );
  }

  const vehicle = posting.vehicle;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ================= LEFT ================= */}
          <div className="lg:col-span-2 space-y-6">

            {/* IMAGE GALLERY */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 cursor-pointer border border-gray-200" onClick={() => openImageViewer(0)}>
                {vehicle.images && vehicle.images.length > 0 ? (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.yearOfManufacture} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No Image Available</p>
                    </div>
                  </div>
                )}
              </div>

              {vehicle.images && vehicle.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {vehicle.images.slice(1, 5).map((img, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => openImageViewer(i + 1)}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FEATURES */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Vehicle Features
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(showAllFeatures
                  ? vehicle.features
                  : vehicle.features.slice(0, 6)
                ).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-[#006557] flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 20C12.6522 20 15.1957 18.9464 17.0711 17.0711C18.9464 15.1957 20 12.6522 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0C7.34784 0 4.8043 1.05357 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C4.8043 18.9464 7.34784 20 10 20Z"
                          fill="white"
                        />
                        <path
                          d="M14.4 8.16L9.41 13.16C9.05 13.53 8.45 13.53 8.09 13.16L5.59 10.66"
                          stroke="#006557"
                          strokeWidth="1.5"
                        />
                      </svg>
                    </div>
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>

              {vehicle.features.length > 6 && (
                <button
                  onClick={() => setShowAllFeatures(!showAllFeatures)}
                  className="text-[#006557] text-sm mt-4 font-medium hover:text-[#005548] transition-colors"
                >
                  {showAllFeatures ? 'Show less' : `Show all ${vehicle.features.length} features`}
                </button>
              )}
            </div>

            {/* DESCRIPTION */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                Description
              </h3>

              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {showFullDescription
                  ? posting.description || vehicle.description
                  : (posting.description || vehicle.description).slice(0, 200) + '...'}
              </p>

              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-[#006557] text-sm mt-3 font-medium hover:text-[#005548] transition-colors"
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="space-y-6">

            {/* PRICE CARD */}
            <div className="bg-gradient-to-br from-[#006557] to-[#005548] rounded-xl p-6 shadow-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 text-xs bg-white/20 text-white rounded-full font-bold uppercase tracking-wide">
                  {vehicle.condition}
                </span>
                <div className="text-right">
                  <span className="text-3xl font-bold">
                    ${vehicle.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4">
                {vehicle.yearOfManufacture} {vehicle.make} {vehicle.model}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="font-bold text-lg">
                    {vehicle.mileage.toLocaleString()}
                  </p>
                  <p className="text-white/80 text-sm">Miles</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center">
                  <p className="font-bold text-lg">
                    {vehicle.yearOfManufacture}
                  </p>
                  <p className="text-white/80 text-sm">Year</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleContactSeller(posting.id)}
                  className="flex-1 bg-white text-[#006557] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Contact Seller
                </button>
                <button
                  onClick={handleBuy}
                  className="px-6 py-3 border-2 border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* SPECIFICATIONS */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Specifications
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Make</span>
                  <span className="text-gray-900">{vehicle.make}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Model</span>
                  <span className="text-gray-900">{vehicle.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Year</span>
                  <span className="text-gray-900">{vehicle.yearOfManufacture}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">License Plate</span>
                  <span className="text-gray-900">{vehicle.licensePlate}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">VIN</span>
                  <span className="text-gray-900 font-mono text-sm">{vehicle.vinNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Color</span>
                  <span className="text-gray-900">{toTitleCase(vehicle.color)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Mileage</span>
                  <span className="text-gray-900">{vehicle.mileage.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Transmission</span>
                  <span className="text-gray-900">{toTitleCase(vehicle.transmission)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Body Type</span>
                  <span className="text-gray-900">{toTitleCase(vehicle.type)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 font-medium">Fuel Type</span>
                  <span className="text-gray-900">{toTitleCase(vehicle.fuelType)}</span>
                </div>
              </div>
            </div>

            {/* SELLER */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Seller Information
              </h3>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white shadow-sm">
                  {posting.ownerId?.avatarUrl ? (
                    <img
                      src={posting.ownerId.avatarUrl}
                      alt={`${posting.ownerId.firstName} ${posting.ownerId.lastName}`}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-blue-600 font-semibold text-lg">
                      {posting.ownerId?.firstName?.[0]}{posting.ownerId?.lastName?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-base mb-1">
                    {posting.ownerId?.firstName} {posting.ownerId?.lastName}
                  </h4>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={averageRating} size="sm" />
                    <span className="text-xs text-gray-500">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Verified Seller
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-[#006557] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#005548] transition-colors text-sm">
                  Contact Seller
                </button>
                <button className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
                  View Profile
                </button>
              </div>
            </div>

            {/* REVIEWS SECTION */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Customer Reviews
                  </h3>
                  <div className="flex items-center gap-2">
                    <StarRating rating={averageRating} size="sm" />
                    <span className="text-sm text-gray-600">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.slice(0, 2).map((review) => (
                    <div key={review._id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-gray-600">
                            {review.customerId?.firstName?.[0]}{review.customerId?.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-gray-900 text-sm">
                              {review.customerId?.firstName} {review.customerId?.lastName}
                            </p>
                            <StarRating rating={review.rating} size="sm" showValue={false} />
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>

                {reviews.length > 2 && (
                  <button className="mt-4 w-full text-[#006557] font-medium text-sm hover:text-[#005548] transition-colors">
                    View all {reviews.length} reviews →
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
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

      {/* Image Viewer Modal */}
      {imageViewerOpen && vehicle.images && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          {/* Close Button - Outside the image frame */}
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <div className="relative max-w-4xl max-h-full">
            {/* Previous Button - Close to the image */}
            {vehicle.images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-[34px] z-20 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}

            {/* Next Button - Close to the image */}
            {vehicle.images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-[34px] z-20 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-75 transition"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}

            {/* Image with padding */}
            <div className="p-4 max-w-full max-h-[80vh] overflow-hidden rounded-lg">
              <img
                src={vehicle.images[currentImageIndex]}
                alt={`${vehicle.yearOfManufacture} ${vehicle.make} ${vehicle.model} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Image Counter */}
            <div className="text-center mt-4 text-white">
              <span className="bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {vehicle.images.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <ReadyToSell />
      <Footer />
    </div>
  );
}

function toTitleCase(value: string | undefined | null) {
  if (!value || typeof value !== 'string') return value ?? '';
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ================= HELPER ================= */
function Spec({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
