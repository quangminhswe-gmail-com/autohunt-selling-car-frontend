'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';
import { showErrorNotification } from '@/utils/notifications';
import CarCard from '@/components/CarCard';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  color: string;
  mileage: number;
  transmission: string;
  type: string;
  fuelType: string;
  price: number;
  images: string[];
}

interface Posting {
  _id: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  locationCity?: string;
  locationDistrict?: string;
  locationAddress?: string;
  vehicle: Vehicle;
  status: string;
  createdAt: string;
  viewCount?: number;
}

export default function VehiclesPage() {
  const [postings, setPostings] = useState<Posting[]>([]);
  const [filteredPostings, setFilteredPostings] = useState<Posting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Collapsed states
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    year: true,
    brand: true,
    type: false,
    transmission: false,
    fuelType: false,
  });

  // Show more states for each filter
  const [showMoreItems, setShowMoreItems] = useState<Record<string, boolean>>({
    year: false,
    brand: false,
    type: false,
    transmission: false,
    fuelType: false,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const startConversationWithPosting = async (postingId: string) => {
    const shouldStart = window.confirm('Do you want to start a conversation with the seller?');
    if (!shouldStart) return;

    try {
      const postingDetails = await apiClient<Partial<Posting> & { ownerId?: { _id: string } }>(
        `/postings/details/${postingId}`,
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
    const fetchPostings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient<Posting[]>('/postings');
        setPostings(data.filter((posting) => posting.status?.toLowerCase() === 'active'));
      } catch (err) {
        const errorMessage = (err as Error).message;
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
          // If unauthorized, try fetching without authentication
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/postings`);
            if (response.ok) {
              const data = await response.json();
              setPostings(data.filter((posting: Posting) => posting.status?.toLowerCase() === 'active'));
              return;
            }
          } catch (fallbackErr) {
            console.error('Failed to fetch postings even without auth:', fallbackErr);
          }
          setError('Please log in to view available vehicles.');
        } else {
          console.error('Failed to fetch postings', err);
          setError((err as Error).message || 'Failed to load vehicles');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostings();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);

    setSearchQuery(params.get('search') || '');
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setSelectedMakes(params.get('make') ? params.get('make')!.split(',').filter(Boolean) : []);
    setSortBy(params.get('sortBy') || 'newest');
  }, []);

  useEffect(() => {
    let filtered = postings.filter((posting) => posting.status?.toLowerCase() === 'active');

    // Search by title, make, model
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (posting) =>
          posting.title.toLowerCase().includes(query) ||
          posting.vehicle.make.toLowerCase().includes(query) ||
          posting.vehicle.model.toLowerCase().includes(query)
      );
    }

    // Price range
    if (minPrice) {
      filtered = filtered.filter((posting) => posting.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter((posting) => posting.price <= Number(maxPrice));
    }

    // Make
    if (selectedMakes.length > 0) {
      filtered = filtered.filter((posting) =>
        selectedMakes.some(
          (make) => posting.vehicle.make.toLowerCase() === make.toLowerCase()
        )
      );
    }

    // Year
    if (selectedYear) {
      filtered = filtered.filter(
        (posting) => posting.vehicle.yearOfManufacture === Number(selectedYear)
      );
    }

    // Type/Body Type
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((posting) =>
        selectedTypes.some(
          (type) => posting.vehicle.type.toLowerCase() === type.toLowerCase()
        )
      );
    }

    // Transmission
    if (selectedTransmissions.length > 0) {
      filtered = filtered.filter((posting) =>
        selectedTransmissions.some(
          (trans) => posting.vehicle.transmission.toLowerCase() === trans.toLowerCase()
        )
      );
    }

    // Fuel Type
    if (selectedFuelTypes.length > 0) {
      filtered = filtered.filter((posting) =>
        selectedFuelTypes.some(
          (fuel) => posting.vehicle.fuelType.toLowerCase() === fuel.toLowerCase()
        )
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'mileage-low') {
      filtered.sort((a, b) => a.vehicle.mileage - b.vehicle.mileage);
    }

    setFilteredPostings(filtered);
    setCurrentPage(1);
  }, [postings, searchQuery, minPrice, maxPrice, selectedMakes, selectedYear, selectedTypes, selectedTransmissions, selectedFuelTypes, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPostings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedPostings = filteredPostings.slice(startIdx, startIdx + itemsPerPage);

  // Extract unique values for filters
  const makes = Array.from(new Set(postings.map((p) => p.vehicle.make))).sort();

  // Predefined popular car brands (always available)
  const popularBrands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Acura', 'Infiniti',
    'Tesla', 'Porsche', 'Ferrari', 'Lamborghini', 'Jaguar', 'Land Rover', 'Volvo',
    'Chrysler', 'Dodge', 'Jeep', 'Ram', 'GMC', 'Cadillac', 'Lincoln', 'Buick',
    'Mitsubishi', 'Suzuki', 'Isuzu', 'Peugeot', 'Renault', 'Citroën', 'Fiat',
    'Alfa Romeo', 'Maserati', 'Bentley', 'Rolls-Royce', 'Aston Martin', 'McLaren',
    'Genesis', 'Polestar', 'Rivian', 'Lucid', 'NIO', 'BYD', 'Geely', 'Great Wall'
  ];

  // Predefined body types (always available)
  const popularBodyTypes = [
    'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Convertible', 'Wagon', 'Pickup Truck',
    'Minivan', 'Crossover', 'Roadster', 'Van', 'Luxury Sedan', 'Sports Car',
    'Compact Car', 'Midsize Car', 'Full-size Car', 'Subcompact Car'
  ];

  // Predefined transmissions (always available)
  const popularTransmissions = [
    'Automatic', 'Manual', 'CVT', 'Dual-Clutch', 'Semi-Automatic', 'AMT'
  ];

  // Predefined fuel types (always available)
  const popularFuelTypes = [
    'Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Plug-in Hybrid', 'CNG', 'LPG', 'Hydrogen'
  ];

  // Combine database brands with popular brands, remove duplicates
  const allMakes = Array.from(new Set([...popularBrands, ...makes])).sort();

  const allYears = Array.from(new Set(postings.map((p) => p.vehicle.yearOfManufacture))).sort(
    (a, b) => b - a
  );
  const types = Array.from(new Set(postings.map((p) => p.vehicle.type))).sort();
  const transmissions = Array.from(new Set(postings.map((p) => p.vehicle.transmission))).sort();
  const fuelTypes = Array.from(new Set(postings.map((p) => p.vehicle.fuelType))).sort();

  // Combine database values with popular options, remove duplicates
  const allTypes = Array.from(new Set([...popularBodyTypes, ...types])).sort();
  const allTransmissions = Array.from(new Set([...popularTransmissions, ...transmissions])).sort();
  const allFuelTypes = Array.from(new Set([...popularFuelTypes, ...fuelTypes])).sort();

  // Filter makes based on search
  const filteredMakes = allMakes.filter((make) =>
    make.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const clearFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedMakes([]);
    setSelectedYear('');
    setSelectedTypes([]);
    setSelectedTransmissions([]);
    setSelectedFuelTypes([]);
    setBrandSearch('');
    setSortBy('newest');
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper function to capitalize first letter and lowercase the rest
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleMakeChange = (make: string) => {
    setSelectedMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleTransmissionChange = (transmission: string) => {
    setSelectedTransmissions((prev) =>
      prev.includes(transmission)
        ? prev.filter((t) => t !== transmission)
        : [...prev, transmission]
    );
  };

  const handleFuelTypeChange = (fuelType: string) => {
    setSelectedFuelTypes((prev) =>
      prev.includes(fuelType)
        ? prev.filter((f) => f !== fuelType)
        : [...prev, fuelType]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-500">Loading vehicles...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Vehicles</h1>
          <p className="text-gray-600">
            {filteredPostings.length} vehicle{filteredPostings.length !== 1 ? 's' : ''} available
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-24">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {(searchQuery ||
                  minPrice ||
                  maxPrice ||
                  selectedMakes.length > 0 ||
                  selectedYear ||
                  selectedTypes.length > 0 ||
                  selectedTransmissions.length > 0 ||
                  selectedFuelTypes.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Make, model, title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* Price Range Slider */}
                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Price Range
                    </label>
                    
                    <div className="space-y-4">
                        {/* Container cho 2 hàng nhập liệu */}
                        <div className="flex flex-col gap-3">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 ml-1">Min Price</label>
                            <input
                            type="number"
                            placeholder="e.g. 1,000"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 ml-1">Max Price</label>
                            <input
                            type="number"
                            placeholder="e.g. 100,000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                            />
                        </div>
                        </div>

                        {(minPrice || maxPrice) && (
                        <div className="text-xs font-semibold py-2 px-3 bg-gray-50 rounded-md text-blue-600">
                            {minPrice ? `₫${Number(minPrice).toLocaleString()}` : '₫0'} 
                            <span className="text-gray-400 mx-2">to</span>
                            {maxPrice ? `₫${Number(maxPrice).toLocaleString()}` : 'Any'}
                        </div>
                        )}
                    </div>
                    </div>
                {/* Year Filter */}
                {allYears.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => toggleSection('year')}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                      <span>Year</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedSections.year ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {expandedSections.year && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          placeholder="Enter year, e.g. 2018"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                        />
                        {/* <p className="text-xs text-gray-500">
                          {allYears.length} available years in inventory. Use exact year to filter.
                        </p> */}
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Filter */}
                {filteredMakes.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => toggleSection('brand')}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                      <span>Brand</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {expandedSections.brand && (
                      <div className="mt-3 space-y-2">
                        <input
                          type="text"
                          placeholder="Search brand..."
                          value={brandSearch}
                          onChange={(e) => setBrandSearch(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                        />
                        <div className="space-y-2 mt-2">
                          {filteredMakes.slice(0, showMoreItems.brand ? filteredMakes.length : 8).map((make) => {
                            const isAvailable = makes.includes(make);
                            return (
                              <label key={make} className="flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedMakes.includes(make)}
                                  onChange={() => handleMakeChange(make)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="ml-2 text-sm text-gray-700 flex items-center">
                                  {capitalizeFirst(make)}
                                  {isAvailable && (
                                    <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Available in inventory"></span>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        {!brandSearch && filteredMakes.length > 8 && (
                          <button
                            onClick={() => setShowMoreItems((prev) => ({ ...prev, brand: !prev.brand }))}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            {showMoreItems.brand ? 'See Less' : `See More (${filteredMakes.length - 8}+)`}
                          </button>
                        )}
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Available in inventory
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Body Type Filter */}
                {allTypes.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => toggleSection('type')}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                      <span>Body Type</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {expandedSections.type && (
                      <div className="mt-3 space-y-2">
                        {allTypes.slice(0, showMoreItems.type ? allTypes.length : 6).map((type) => {
                          const isAvailable = types.includes(type);
                          return (
                            <label key={type} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedTypes.includes(type)}
                                onChange={() => handleTypeChange(type)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                {capitalizeFirst(type)}
                                {isAvailable && (
                                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Available in inventory"></span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                        {allTypes.length > 6 && (
                          <button
                            onClick={() => setShowMoreItems((prev) => ({ ...prev, type: !prev.type }))}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            {showMoreItems.type ? 'See Less' : `See More (${allTypes.length - 6}+)`}
                          </button>
                        )}
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Available in inventory
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Transmission Filter */}
                {allTransmissions.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => toggleSection('transmission')}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                      <span>Transmission</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedSections.transmission ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {expandedSections.transmission && (
                      <div className="mt-3 space-y-2">
                        {allTransmissions.slice(0, showMoreItems.transmission ? allTransmissions.length : 4).map((transmission) => {
                          const isAvailable = transmissions.includes(transmission);
                          return (
                            <label key={transmission} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedTransmissions.includes(transmission)}
                                onChange={() => handleTransmissionChange(transmission)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                {capitalizeFirst(transmission)}
                                {isAvailable && (
                                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Available in inventory"></span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                        {allTransmissions.length > 4 && (
                          <button
                            onClick={() => setShowMoreItems((prev) => ({ ...prev, transmission: !prev.transmission }))}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            {showMoreItems.transmission ? 'See Less' : `See More (${allTransmissions.length - 4}+)`}
                          </button>
                        )}
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Available in inventory
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Fuel Type Filter */}
                {allFuelTypes.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={() => toggleSection('fuelType')}
                      className="w-full flex items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-700"
                    >
                      <span>Fuel Type</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${expandedSections.fuelType ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </button>
                    {expandedSections.fuelType && (
                      <div className="mt-3 space-y-2">
                        {allFuelTypes.slice(0, showMoreItems.fuelType ? allFuelTypes.length : 4).map((fuelType) => {
                          const isAvailable = fuelTypes.includes(fuelType);
                          return (
                            <label key={fuelType} className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFuelTypes.includes(fuelType)}
                                onChange={() => handleFuelTypeChange(fuelType)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                {capitalizeFirst(fuelType)}
                                {isAvailable && (
                                  <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="Available in inventory"></span>
                                )}
                              </span>
                            </label>
                          );
                        })}
                        {allFuelTypes.length > 4 && (
                          <button
                            onClick={() => setShowMoreItems((prev) => ({ ...prev, fuelType: !prev.fuelType }))}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            {showMoreItems.fuelType ? 'See Less' : `See More (${allFuelTypes.length - 4}+)`}
                          </button>
                        )}
                        <div className="mt-2 text-xs text-gray-500 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Available in inventory
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && <div className="text-red-600 text-sm mt-4">{error}</div>}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIdx + 1} - {Math.min(startIdx + itemsPerPage, filteredPostings.length)} of{' '}
                {filteredPostings.length}
              </div>

              <div className="flex gap-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="mileage-low">Mileage: Low to High</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm border-l ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {/* No Results */}
            {paginatedPostings.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No vehicles found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters and try again
                </button>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && paginatedPostings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {paginatedPostings.map((posting) => (
                  <CarCard
                    key={posting._id}
                    id={posting._id}
                    year={posting.vehicle.yearOfManufacture}
                    make={posting.vehicle.make}
                    model={posting.vehicle.model}
                    price={posting.price}
                    mileage={posting.vehicle.mileage}
                    location={posting.locationCity || posting.locationDistrict || posting.locationAddress || ''}
                    transmission={posting.vehicle.transmission}
                    image={posting.vehicle.images?.[0] || '/default-car.png'}
                    href={`/vehicle/${posting._id}`}
                    onContact={() => startConversationWithPosting(posting._id)}
                    onBuy={(id) => (window.location.href = `/vehicle/${id}/buy`) }
                    variant="grid"
                    currency="VND"
                  >
                  </CarCard>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && paginatedPostings.length > 0 && (
              <div className="space-y-3 mb-8">
                {paginatedPostings.map((posting) => (
                  <Link
                    key={posting._id}
                    href={`/vehicle/${posting._id}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex block"
                  >
                    {/* Image */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-gray-200 overflow-hidden">
                      {posting.vehicle.images && posting.vehicle.images.length > 0 ? (
                        <Image
                          fill
                          src={posting.vehicle.images[0]}
                          alt={`${posting.vehicle.make} ${posting.vehicle.model}`}
                          className="object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <h3 className="text-md font-bold text-gray-900 mb-1">
                          {posting.vehicle.yearOfManufacture} {posting.vehicle.make}{' '}
                          {posting.vehicle.model}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{posting.title}</p>
                        <div className="flex gap-3 text-xs text-gray-600">
                          <span>Mileage: {posting.vehicle.mileage.toLocaleString()} km</span>
                          <span>Transmission: {posting.vehicle.transmission}</span>
                          <span>Fuel: {posting.vehicle.fuelType}</span>
                          {posting.locationCity && <span>Location: {posting.locationCity}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Price and Buttons */}
                    <div className="p-4 flex flex-col items-end justify-between">
                      <p className="text-xl font-bold text-[#006557]">
                        ₫{posting.price.toLocaleString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            await startConversationWithPosting(posting._id);
                          }}
                          className="px-3 py-1 bg-[#006557] text-white rounded-lg font-medium hover:bg-teal-700 transition text-xs"
                        >
                          Contact
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/vehicle/${posting._id}/buy`;
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-xs"
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
