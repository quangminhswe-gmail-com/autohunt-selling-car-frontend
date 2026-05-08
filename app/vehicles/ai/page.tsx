'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { apiClient, ApiError } from '@/app/utils/api';
import { showErrorNotification } from '@/utils/notifications';

type ChatMode = 'find' | 'sell' | null;

interface Vehicle {
  _id?: string;
  id?: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  images: string[];
}

interface SellerInfo {
  _id: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  rating?: number;
  avatarUrl?: string;
}

interface Posting {
  _id: string;
  title: string;
  price: number;
  locationCity?: string;
  locationDistrict?: string;
  locationAddress?: string;
  createdAt: string;
  status: string;
  vehicle: Vehicle;
  ownerId?: string | SellerInfo;
}

interface AiVehicle {
  _id?: string;
  id?: string;
  make?: string;
  model?: string;
  yearOfManufacture?: number;
  price?: number;
}

interface SearchResult {
  posting: Posting;
  seller: SellerInfo | null;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomStepDelay = () => Math.floor(Math.random() * 1000) + 2000;
const CAR_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%25' height='100%25' fill='%230f172a'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='30' font-family='Arial'>No car image</text></svg>";
const AVATAR_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%25' height='100%25' fill='%231e293b'/><circle cx='100' cy='78' r='34' fill='%2364748b'/><rect x='46' y='126' width='108' height='56' rx='28' fill='%2364748b'/></svg>";

export default function AiVehicleSearchPage() {
  const [mode, setMode] = useState<ChatMode>(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allPostings, setAllPostings] = useState<Posting[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

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
        setAllPostings(data.filter((posting) => posting.status?.toLowerCase() === 'active'));
      } catch (err) {
        setError((err as Error).message || 'Failed to load vehicles.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPostings();
  }, []);

  const appendMessage = (role: ChatMessage['role'], content: string) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, role, content }]);
  };

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

  const readSellerFromPostingDetails = async (postingId: string) => {
    try {
      const details = await apiClient<Posting>(`/postings/details/${postingId}`);
      const owner = details.ownerId;
      if (!owner || typeof owner === 'string') {
        return null;
      }
      return owner;
    } catch (err) {
      // Handle 401 Unauthorized silently and return null
      if (err instanceof ApiError && err.statusCode === 401) {
        return null;
      }
      console.error('Failed to fetch posting details:', err);
      return null;
    }
  };

  const startConversationWithSeller = async (sellerId: string) => {
    try {
      const conversation = await apiClient<{ _id: string }>('/chat/start', {
        method: 'POST',
        body: { targetUserId: sellerId },
      });
      window.location.href = `/messages/${conversation._id}`;
    } catch (err) {
      showErrorNotification('Error', (err as Error).message || 'Unable to start conversation.');
    }
  };

  const runFindCarFlow = async (text: string) => {
    appendMessage('assistant', 'Analyzing your needs...');
    await delay(randomStepDelay());

    appendMessage('assistant', 'Searching for suitable cars...');
    await delay(randomStepDelay());

    appendMessage('assistant', 'Best options...');
    await delay(randomStepDelay());

    const aiResponse = await apiClient<{ vehicles?: AiVehicle[] }>('/public/vehicle/ai-search', {
      method: 'POST',
      body: { query: text },
    });

    const aiVehicles = aiResponse.vehicles || [];
    const matched =
      aiVehicles.length > 0
        ? allPostings.filter((posting) => aiVehicles.some((vehicle) => matchesPosting(posting, vehicle)))
        : [];

    const effectivePostings = matched.length > 0 ? matched : newest10;
    setShowFallback(matched.length === 0);
    const enrichedResults = await Promise.all(
      effectivePostings.map(async (posting) => ({
        posting,
        seller: await readSellerFromPostingDetails(posting._id),
      }))
    );

    setResults(enrichedResults);
    appendMessage(
      'assistant',
      matched.length > 0
        ? `I found ${matched.length} option${matched.length > 1 ? 's' : ''} matching your needs.`
        : 'I could not find exact matches, so I selected the latest available listings for you.'
    );
  };

  const runSellCarFlow = async (text: string) => {
    appendMessage('assistant', 'Analyzing your selling request...');
    await delay(randomStepDelay());
    appendMessage(
      'assistant',
      `Great. To sell your car faster, prepare clear photos, honest condition details, and a fair price. Your request was: "${text}".`
    );
    await delay(randomStepDelay());
    appendMessage('assistant', 'You can continue at the sell page to publish your listing.');
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mode) {
      setError('Please choose Find car or Sell car before chatting.');
      return;
    }

    const trimmed = query.trim();
    if (!trimmed) {
      setError('Please enter a message for AI.');
      return;
    }

    setError(null);
    setSearching(true);
    setResults([]);
    setShowFallback(false);
    appendMessage('user', trimmed);
    setQuery('');

    try {
      if (mode === 'find') {
        await runFindCarFlow(trimmed);
      } else {
        await runSellCarFlow(trimmed);
      }
    } catch (err) {
      const message = (err as Error).message || 'AI flow failed.';
      setError(message);
      showErrorNotification('AI error', message);
    } finally {
      setSearching(false);
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

        <main className="max-w-6xl mx-auto px-4 py-10">
          <section className="mb-8">
            <p className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-300/30 text-cyan-200 text-sm">
              AI car assistant
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-4">Chat with AI to find or sell a car</h1>
            <p className="text-slate-300 mt-3 max-w-3xl">
              Choose your goal first, then send your message. For buyers, AI responds in real-time steps
              and returns matching car options with seller contact.
            </p>
          </section>

          <section className="mb-6 grid md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('find')}
              className={`p-4 rounded-2xl border text-left transition ${
                mode === 'find'
                  ? 'bg-cyan-500/20 border-cyan-300 text-cyan-100'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold text-lg">Find a car</div>
              <div className="text-sm text-slate-300 mt-1">Describe your needs and get matching vehicles.</div>
            </button>

            <button
              type="button"
              onClick={() => setMode('sell')}
              className={`p-4 rounded-2xl border text-left transition ${
                mode === 'sell'
                  ? 'bg-indigo-500/20 border-indigo-300 text-indigo-100'
                  : 'bg-white/5 border-white/20 hover:bg-white/10'
              }`}
            >
              <div className="font-semibold text-lg">Sell a car</div>
              <div className="text-sm text-slate-300 mt-1">Get guidance before creating your listing.</div>
            </button>
          </section>

          <section className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 md:p-5 shadow-2xl">
            <div className="h-[360px] overflow-y-auto rounded-xl bg-slate-900/60 border border-slate-700 p-4 mb-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-slate-400 text-sm">
                  {mode === 'find'
                    ? 'Try: "I want to buy an Audi around 1.2 billion VND."'
                    : mode === 'sell'
                      ? 'Tell AI about the car you want to sell.'
                      : 'Choose Find a car or Sell a car to begin chatting.'}
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] px-4 py-2 rounded-xl text-sm ${
                    message.role === 'user'
                      ? 'ml-auto bg-cyan-500/25 border border-cyan-300/40'
                      : 'bg-white/10 border border-white/15'
                  }`}
                >
                  {message.content}
                </div>
              ))}

              {searching && <div className="text-xs text-cyan-200 animate-pulse">AI is typing...</div>}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={searching || loadingData}
                placeholder={
                  mode === 'find'
                    ? 'Example: I want to buy an Audi'
                    : mode === 'sell'
                      ? 'Example: I want to sell my 2020 Honda Civic'
                      : 'Choose mode first, then type your message...'
                }
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={searching || loadingData}
                className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:opacity-60 transition-all duration-300 shadow-lg shadow-cyan-500/30"
              >
                {searching ? 'Processing...' : 'Send'}
              </button>
            </form>
          </section>

          {error && (
            <div className="mt-4 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-red-100">
              {error}
            </div>
          )}

          {showFallback && (
            <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-amber-100">
              No exact matches found. Showing latest available cars.
            </div>
          )}

          {mode === 'sell' && (
            <div className="mt-4 text-sm text-slate-300">
              Ready to create your listing?{' '}
              <Link href="/sell" className="text-cyan-300 hover:text-cyan-200 underline">
                Go to Sell page
              </Link>
            </div>
          )}

          {mode === 'find' && (
            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Matching results</h2>
              {loadingData && <p className="text-slate-300">Loading available cars...</p>}
              {!loadingData && results.length === 0 && (
                <div className="rounded-xl border border-white/20 bg-white/5 p-6 text-slate-300 text-sm">
                  Send a message to AI and matching cars will appear here.
                </div>
              )}
              {!loadingData && results.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {results.map(({ posting, seller }) => (
                    <article
                      key={posting._id}
                      className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md"
                    >
                      <div className="relative w-full h-52 rounded-xl overflow-hidden border border-white/15 bg-slate-900/60 mb-4">
                        <Image
                          src={posting.vehicle.images?.[0] || CAR_PLACEHOLDER}
                          alt={`${posting.vehicle.make} ${posting.vehicle.model}`}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="text-xl font-semibold mb-1">
                        {posting.vehicle.yearOfManufacture} {posting.vehicle.make} {posting.vehicle.model}
                      </div>
                      <div className="text-cyan-200 font-bold text-lg mb-3">
                        {posting.price.toLocaleString('vi-VN')} VND
                      </div>
                      <div className="text-sm text-slate-300 space-y-1">
                        <p>Mileage: {posting.vehicle.mileage.toLocaleString('vi-VN')} km</p>
                        <p>Transmission: {posting.vehicle.transmission}</p>
                        <p>Fuel: {posting.vehicle.fuelType}</p>
                        <p>
                          Location:{' '}
                          {posting.locationCity || posting.locationDistrict || posting.locationAddress || 'Updating'}
                        </p>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-sm">
                        <div className="font-medium text-slate-100 mb-3">Seller information</div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-slate-800">
                            <Image
                              src={seller?.avatarUrl || AVATAR_PLACEHOLDER}
                              alt="Seller avatar"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <p className="text-slate-200 font-medium">
                            {seller ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'N/A' : 'N/A'}
                          </p>
                        </div>

                        <p className="text-slate-300">Phone: {seller?.phoneNumber || 'N/A'}</p>
                        <p className="text-slate-300">Email: {seller?.email || 'N/A'}</p>
                      </div>

                      <div className="mt-4 flex gap-3">
                        <Link
                          href={`/vehicle/${posting._id}`}
                          className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition"
                        >
                          View details
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            if (!seller?._id) {
                              showErrorNotification('Error', 'Seller contact is unavailable.');
                              return;
                            }
                            startConversationWithSeller(seller._id);
                          }}
                          className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition"
                        >
                          Contact seller
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

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
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(24px);
          }
        }
      `}</style>
    </div>
  );
}
