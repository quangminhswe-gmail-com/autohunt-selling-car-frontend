'use client';

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CarCard from '@/components/CarCard';
import { apiClient } from '@/app/utils/api';
import { showErrorNotification } from '@/utils/notifications';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearOfManufacture: number;
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
  price: number;
  locationCity?: string;
  locationDistrict?: string;
  locationAddress?: string;
  vehicle: Vehicle & { _id?: string };
  status: string;
  createdAt: string;
}

interface AiVehicle {
  _id?: string;
  id?: string;
  make?: string;
  model?: string;
  yearOfManufacture?: number;
  price?: number;
}

function AiVehicleSearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [allPostings, setAllPostings] = useState<Posting[]>([]);
  const [results, setResults] = useState<Posting[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newest10 = useMemo(
    () =>
      [...allPostings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    [allPostings]
  );

  useEffect(() => {
    const fetchPostings = async () => {
      setLoadingData(true);
      setError(null);
      try {
        const data = await apiClient<Posting[]>('/postings');
        const active = data.filter((posting) => posting.status?.toLowerCase() === 'active');
        setAllPostings(active);
      } catch (err) {
        const message = (err as Error).message || 'Failed to load vehicles.';
        setError(message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPostings();
  }, []);

  const matchesPosting = (posting: Posting, aiVehicle: AiVehicle) => {
    const postingVehicleId = String(posting.vehicle?._id || posting.vehicle?.id || '');
    const aiVehicleId = String(aiVehicle._id || aiVehicle.id || '');

    if (postingVehicleId && aiVehicleId && postingVehicleId === aiVehicleId) {
      return true;
    }

    return (
      (posting.vehicle.make || '').toLowerCase() === (aiVehicle.make || '').toLowerCase() &&
      (posting.vehicle.model || '').toLowerCase() === (aiVehicle.model || '').toLowerCase() &&
      Number(posting.vehicle.yearOfManufacture || 0) === Number(aiVehicle.yearOfManufacture || 0) &&
      Number(posting.price || 0) === Number(aiVehicle.price || 0)
    );
  };

  const runAiSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setHasSearched(false);
      setShowFallback(false);
      setResults([]);
      setError('Please enter a search query.');
      return;
    }

    setHasSearched(true);
    setSearching(true);
    setShowFallback(false);
    setError(null);

    try {
      const aiResponse = await apiClient<{ vehicles?: AiVehicle[] }>('/public/vehicle/ai-search', {
        method: 'POST',
        body: { query: trimmed },
      });

      const aiVehicles = aiResponse.vehicles || [];
      const matched = allPostings.filter((posting) =>
        aiVehicles.some((vehicle) => matchesPosting(posting, vehicle))
      );

      if (matched.length === 0) {
        setShowFallback(true);
        setResults(newest10);
      } else {
        setResults(matched);
      }
    } catch (err) {
      const message = (err as Error).message || 'AI search failed.';
      setError(message);
      showErrorNotification('Search error', message);
      setShowFallback(false);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runAiSearch();
  };

  const startConversationWithPosting = async (postingId: string) => {
    const shouldStart = window.confirm('Do you want to start a conversation with the seller?');
    if (!shouldStart) return;

    try {
      const postingDetails = await apiClient<Partial<Posting> & { ownerId?: { _id: string } }>(
        `/postings/details/${postingId}`
      );

      const sellerId =
        typeof postingDetails.ownerId === 'string'
          ? postingDetails.ownerId
          : postingDetails.ownerId?._id;

      if (!sellerId) throw new Error('Seller information is unavailable.');

      const conversation = await apiClient<{ _id: string }>('/chat/start', {
        method: 'POST',
        body: { targetUserId: sellerId },
      });

      window.location.href = `/messages/${conversation._id}`;
    } catch (err) {
      showErrorNotification('Error', (err as Error).message || 'Unable to start conversation.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="ai-orb ai-orb-1" />
        <div className="ai-orb ai-orb-2" />
        <div className="ai-grid" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto px-4 py-10">
          <section className="mb-10">
            <p className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-300/30 text-cyan-200 text-sm">
              AI-powered semantic search
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
              Find your next car using natural language
            </h1>
            <p className="text-slate-300 mt-3 max-w-3xl">
              Describe what you need, and AI will analyze your text automatically. Frontend only sends
              one parameter: <span className="font-semibold text-cyan-300">query</span>.
            </p>
          </section>

          <section className="mb-8">
            <form
              onSubmit={onSubmit}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 md:p-5 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Example: I need a Toyota SUV around 800 million, year 2020+"
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  disabled={searching || loadingData}
                  className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 transition-all duration-300 shadow-lg shadow-cyan-500/30"
                >
                  {searching ? 'Analyzing...' : 'Search with AI'}
                </button>
              </div>
            </form>
          </section>

          {showFallback && (
            <div className="mb-6 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-amber-100">
              Sorry, we could not find exact matches for your request. Showing the 10 newest cars instead.
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-red-100">
              {error}
            </div>
          )}

          <section>
            <div className="mb-4 text-slate-200">
              {loadingData
                ? 'Loading vehicles...'
                : hasSearched
                  ? `Showing ${results.length} vehicle${results.length !== 1 ? 's' : ''}`
                  : 'Enter a query and click "Search with AI" to see results.'}
            </div>

            {loadingData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-72 rounded-xl bg-white/10 border border-white/10 animate-pulse" />
                ))}
              </div>
            )}

            {!loadingData && hasSearched && results.length === 0 && (
              <div className="rounded-2xl border border-white/20 bg-white/5 p-10 text-center text-slate-200">
                No vehicles available right now.
              </div>
            )}

            {!loadingData && hasSearched && results.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((posting) => (
                  <div key={posting._id} className="result-enter">
                    <CarCard
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
                      onBuy={(id) => (window.location.href = `/vehicle/${id}/buy`)}
                      variant="grid"
                      currency="VND"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>

      <style jsx>{`
        .ai-orb {
          position: absolute;
          width: 30rem;
          height: 30rem;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.25;
          animation: float 10s ease-in-out infinite;
        }
        .ai-orb-1 {
          background: #22d3ee;
          top: -8rem;
          left: -8rem;
        }
        .ai-orb-2 {
          background: #6366f1;
          right: -8rem;
          top: 20%;
          animation-delay: 2s;
        }
        .ai-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(circle at center, black 40%, transparent 85%);
        }
        .result-enter {
          animation: rise 450ms ease-out both;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(24px);
          }
        }
        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export default function AiVehicleSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="ai-orb ai-orb-1" />
            <div className="ai-orb ai-orb-2" />
            <div className="ai-grid" />
          </div>
          <div className="relative z-10">
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-10">
              <div className="rounded-2xl border border-white/20 bg-white/5 p-10 text-center text-slate-200">
                Loading AI search...
              </div>
            </main>
            <Footer />
          </div>
        </div>
      }
    >
      <AiVehicleSearchContent />
    </Suspense>
  );
}
