'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { apiClient } from '@/app/utils/api';
import { buildLoginUrl, getAuthToken } from '@/app/utils/auth';
import { showErrorNotification } from '@/utils/notifications';
import CarCard from '@/components/CarCard';

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

interface BuyerSearch {
  _id: string;
  query: string;
  matchedAt?: string | null;
  matchedPostingId?: (Posting & { vehicleId?: Vehicle }) | null;
  notifyEmail?: string | null;
  emailOptIn?: boolean;
}

interface SearchResult {
  posting: Posting;
  seller: SellerInfo | null;
}

const CAR_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%25' height='100%25' fill='%230f172a'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='30' font-family='Arial'>No car image</text></svg>";
const AVATAR_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%25' height='100%25' fill='%231e293b'/><circle cx='100' cy='78' r='34' fill='%2364748b'/><rect x='46' y='126' width='108' height='56' rx='28' fill='%2364748b'/></svg>";

interface BuyerProfileForm {
  preferredBrand: string;
  model: string;
  preferredType: string;
  preferredColor: string;
  minYear: string;
  maxPrice: string;
  preferredFeatures: string;
  usagePurpose: string;
}

export default function AiFinderPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [allPostings, setAllPostings] = useState<Posting[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedSearches, setSavedSearches] = useState<BuyerSearch[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSavedSearches, setLoadingSavedSearches] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showEmailPromptModal, setShowEmailPromptModal] = useState(false);
  const [pendingSearchPayload, setPendingSearchPayload] = useState<any | null>(null);
  const [alertEmail, setAlertEmail] = useState('');
  const [savingAlert, setSavingAlert] = useState(false);
  const [emailPromptError, setEmailPromptError] = useState<string | null>(null);
  const [form, setForm] = useState<BuyerProfileForm>({
    preferredBrand: '',
    model: '',
    preferredType: '',
    preferredColor: '',
    minYear: '',
    maxPrice: '',
    preferredFeatures: '',
    usagePurpose: '',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = getAuthToken();
    if (!token) {
      router.replace(buildLoginUrl('/vehicles/ai-finder'));
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const hasEnoughCriteria = useMemo(() => {
    return Boolean(form.preferredBrand.trim() || form.model.trim() || form.preferredType.trim());
  }, [form.preferredBrand, form.model, form.preferredType]);

  const buildQueryFromProfile = () => {
    const parts: string[] = [];
    if (form.preferredBrand.trim()) parts.push(form.preferredBrand.trim());
    if (form.model.trim()) parts.push(form.model.trim());
    if (form.preferredType.trim()) parts.push(form.preferredType.trim());
    if (form.preferredColor.trim()) parts.push(`color ${form.preferredColor.trim()}`);
    if (form.minYear.trim()) parts.push(`from year ${form.minYear.trim()}`);
    if (form.maxPrice.trim()) parts.push(`under ${form.maxPrice.trim()} VND`);
    if (form.usagePurpose.trim()) parts.push(`for ${form.usagePurpose.trim()}`);
    if (form.preferredFeatures.trim()) parts.push(`features ${form.preferredFeatures.trim()}`);
    return parts.join(', ');
  };

  useEffect(() => {
    if (!authChecked) return;

    const fetchPostings = async () => {
      setLoadingData(true);
      try {
        const data = await apiClient<Posting[]>('/postings');
        // Filter only ACTIVE postings - exclude RESERVED (pending order) and SOLD postings
        setAllPostings(
          data.filter((posting) => {
            const status = posting.status?.toLowerCase();
            return status === 'active'; // Only show active listings that haven't been purchased or reserved
          })
        );
      } catch (err) {
        setError((err as Error).message || 'Failed to load vehicles.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchPostings();
  }, [authChecked]);

  const fetchBuyerSearches = async () => {
    if (!authChecked) {
      setSavedSearches([]);
      return;
    }

    try {
      setLoadingSavedSearches(true);
      const data = await apiClient<BuyerSearch[]>('/buyer-searches/my-searches');
      setSavedSearches(Array.isArray(data) ? data : []);
    } catch {
      setSavedSearches([]);
    } finally {
      setLoadingSavedSearches(false);
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchBuyerSearches();
  }, [authChecked]);

  useEffect(() => {
    const hydrateMatchedResults = async () => {
      const matchedPostings = savedSearches
        .map((search) => search.matchedPostingId)
        .filter((posting): posting is Posting & { vehicleId?: Vehicle } => Boolean(posting));

      if (matchedPostings.length === 0) {
        return;
      }

      try {
        const uniquePostings = Array.from(
          new Map(matchedPostings.map((posting) => [posting._id, posting])).values(),
        );
        const enriched = await Promise.all(
          uniquePostings.map(async (posting) => ({
            posting: {
              ...posting,
              vehicle: posting.vehicle || posting.vehicleId || ({} as Vehicle),
            } as Posting,
            seller: await readSellerFromPostingDetails(posting._id),
          })),
        );
        
        // Filter out RESERVED and SOLD postings - only show ACTIVE matches
        const activeMatches = enriched.filter((result) => {
          const status = result.posting.status?.toLowerCase();
          return status === 'active';
        });
        
        setResults(activeMatches);
      } catch {
        // Keep existing result list if enrichment fails.
      }
    };

    hydrateMatchedResults();
  }, [savedSearches]);

  const fetchUserSettings = async () => {
    if (!authChecked) {
      return;
    }

    try {
      const settings = await apiClient<{
        buyer?: {
          preferredBrand?: string;
          preferredType?: string;
          preferredColor?: string;
          minYear?: number;
          maxPrice?: number;
          preferredFeatures?: string[];
          usagePurpose?: string;
        };
      }>('/users/settings');

      const buyer = settings?.buyer;
      if (!buyer) return;

      setForm((prev) => ({
        ...prev,
        preferredBrand: buyer.preferredBrand || '',
        preferredType: buyer.preferredType || '',
        preferredColor: buyer.preferredColor || '',
        minYear: buyer.minYear ? String(buyer.minYear) : '',
        maxPrice: buyer.maxPrice ? String(buyer.maxPrice) : '',
        preferredFeatures: Array.isArray(buyer.preferredFeatures) ? buyer.preferredFeatures.join(', ') : '',
        usagePurpose: buyer.usagePurpose || '',
      }));
    } catch {
      // Do not block page if settings are unavailable.
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    fetchUserSettings();
  }, [authChecked]);

  const readSellerFromPostingDetails = async (postingId: string) => {
    const details = await apiClient<Posting>(`/postings/details/${postingId}`);
    const owner = details.ownerId;
    if (!owner || typeof owner === 'string') return null;
    return owner;
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

  const createBuyerAlert = async ({
    payload,
    emailOptIn,
    notifyEmail,
  }: {
    payload: any;
    emailOptIn: boolean;
    notifyEmail?: string;
  }) => {
    await apiClient('/buyer-searches', {
      method: 'POST',
      body: {
        ...payload,
        emailOptIn,
        notifyEmail: emailOptIn ? notifyEmail : undefined,
      },
    });
    await fetchBuyerSearches();
    setLastSavedAt(new Date().toLocaleString());
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasEnoughCriteria) {
      setError('Please fill at least brand, model, or body type.');
      return;
    }

    setError(null);
    setEmailPromptError(null);
    setShowEmailPromptModal(false);
    setPendingSearchPayload(null);
    setSearching(true);
    setResults([]);
    setShowWaiting(false);
    setLastSavedAt(null);

    try {
      const payload = {
        role: 'BUYER',
        preferredBrand: form.preferredBrand.trim() || undefined,
        preferredType: form.preferredType.trim() || undefined,
        preferredColor: form.preferredColor.trim() || undefined,
        minYear: form.minYear.trim() ? Number(form.minYear) : undefined,
        maxPrice: form.maxPrice.trim() ? Number(form.maxPrice) : undefined,
        preferredFeatures: form.preferredFeatures
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        usagePurpose: form.usagePurpose.trim() || undefined,
      };

      await apiClient('/users/settings', {
        method: 'PATCH',
        body: payload,
      });

      const profileQuery = buildQueryFromProfile();
      const buyerSearchPayload = {
        query: profileQuery,
        make: form.preferredBrand.trim() || undefined,
        model: form.model.trim() || undefined,
        yearOfManufacture: form.minYear.trim() ? Number(form.minYear) : undefined,
      };
      const aiResponse = await apiClient<{ vehicles?: AiVehicle[] }>('/public/vehicle/ai-search', {
        method: 'POST',
        body: { query: profileQuery },
      });
      const aiVehicles = aiResponse.vehicles || [];
      const matchedCandidates =
        aiVehicles.length > 0
          ? allPostings.filter((posting) =>
              aiVehicles.some((vehicle) => {
                const makeMatch =
                  !form.preferredBrand.trim() ||
                  (posting.vehicle.make || '').toLowerCase() === form.preferredBrand.trim().toLowerCase();
                const modelMatch =
                  !form.model.trim() ||
                  (posting.vehicle.model || '').toLowerCase().includes(form.model.trim().toLowerCase());
                const typeMatch =
                  !form.preferredType.trim() ||
                  (posting.title || '').toLowerCase().includes(form.preferredType.trim().toLowerCase());
                const minYearMatch =
                  !form.minYear.trim() || Number(posting.vehicle.yearOfManufacture || 0) >= Number(form.minYear);
                const maxPriceMatch = !form.maxPrice.trim() || Number(posting.price || 0) <= Number(form.maxPrice);
                const aiMakeMatch =
                  !vehicle.make ||
                  (posting.vehicle.make || '').toLowerCase() === String(vehicle.make).toLowerCase();
                return makeMatch && modelMatch && typeMatch && minYearMatch && maxPriceMatch && aiMakeMatch;
              })
            )
          : [];

      if (matchedCandidates.length > 0) {
        // Save buyer request even when there are immediate matches
        // so backend can notify matched sellers (in-app + email).
        await createBuyerAlert({
          payload: buyerSearchPayload,
          emailOptIn: false,
        });

        const enriched = await Promise.all(
          matchedCandidates.map(async (posting) => ({ posting, seller: await readSellerFromPostingDetails(posting._id) }))
        );
        setResults(enriched);
      } else {
        setResults([]);
        setPendingSearchPayload(buyerSearchPayload);
        setShowEmailPromptModal(true);
      }
    } catch (err) {
      const message = (err as Error).message || 'Failed.';
      setError(message);
      showErrorNotification('Error', message);
    } finally {
      setSearching(false);
    }
  };

  const saveAlertWithoutEmail = async () => {
    if (!pendingSearchPayload) return;

    setSavingAlert(true);
    setEmailPromptError(null);
    try {
      await createBuyerAlert({
        payload: pendingSearchPayload,
        emailOptIn: false,
      });
      setShowEmailPromptModal(false);
      setPendingSearchPayload(null);
      setAlertEmail('');
      setShowWaiting(true);
    } catch (err) {
      setEmailPromptError((err as Error).message || 'Failed to save alert request.');
    } finally {
      setSavingAlert(false);
    }
  };

  const saveAlertWithEmail = async () => {
    if (!pendingSearchPayload) return;

    const normalizedEmail = alertEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setEmailPromptError('Please enter an email address.');
      return;
    }

    setSavingAlert(true);
    setEmailPromptError(null);
    try {
      await createBuyerAlert({
        payload: pendingSearchPayload,
        emailOptIn: true,
        notifyEmail: normalizedEmail,
      });
      setShowEmailPromptModal(false);
      setPendingSearchPayload(null);
      setAlertEmail('');
      setShowWaiting(true);
    } catch (err) {
      setEmailPromptError((err as Error).message || 'Failed to save email alert.');
    } finally {
      setSavingAlert(false);
    }
  };

  const deleteSavedRequest = async (searchId: string) => {
    const shouldDelete = window.confirm('Delete this saved request?');
    if (!shouldDelete) return;

    try {
      await apiClient(`/buyer-searches/${searchId}`, {
        method: 'DELETE',
      });
      await fetchBuyerSearches();
    } catch (err) {
      showErrorNotification('Delete failed', (err as Error).message || 'Unable to delete request.');
    }
  };

  const clearMatchedRequests = async () => {
    const matched = savedSearches.filter((search) => Boolean(search.matchedPostingId));
    if (matched.length === 0) return;

    const shouldDelete = window.confirm(`Delete ${matched.length} matched request(s)?`);
    if (!shouldDelete) return;

    try {
      await Promise.all(
        matched.map((search) =>
          apiClient(`/buyer-searches/${search._id}`, {
            method: 'DELETE',
          }),
        ),
      );
      await fetchBuyerSearches();
    } catch (err) {
      showErrorNotification('Bulk delete failed', (err as Error).message || 'Unable to clear matched requests.');
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-lg">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold"> Smart Car Finder</h1>
        <p className="text-slate-300 mt-3 max-w-3xl">
          Fill your preferred buyer criteria. The system saves them to your Buyer Profile, searches matching cars, and
          if unavailable now, sends a header notification as soon as a suitable listing appears.
        </p>

        <section className="mt-6 rounded-2xl border border-white/20 bg-white/10 p-5">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={form.preferredBrand}
              onChange={(e) => setForm((prev) => ({ ...prev, preferredBrand: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Brand (e.g. BMW)"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700"
            />
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Model (e.g. X3)"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700"
            />
            <input
              type="text"
              value={form.preferredType}
              onChange={(e) => setForm((prev) => ({ ...prev, preferredType: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Body type (SUV, Sedan...)"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700"
            />
            <input
              type="text"
              value={form.preferredColor}
              onChange={(e) => setForm((prev) => ({ ...prev, preferredColor: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Preferred color"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700"
            />
            <input
              type="number"
              value={form.minYear}
              onChange={(e) => setForm((prev) => ({ ...prev, minYear: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Min year"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700"
            />
            <input
              type="number"
              value={form.maxPrice}
              onChange={(e) => setForm((prev) => ({ ...prev, maxPrice: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Max price (VND)"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700"
            />
            <input
              type="text"
              value={form.preferredFeatures}
              onChange={(e) => setForm((prev) => ({ ...prev, preferredFeatures: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Preferred features (comma separated)"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 md:col-span-2"
            />
            <input
              type="text"
              value={form.usagePurpose}
              onChange={(e) => setForm((prev) => ({ ...prev, usagePurpose: e.target.value }))}
              disabled={searching || loadingData}
              placeholder="Usage purpose"
              className="px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 md:col-span-2"
            />
            <button
              type="submit"
              disabled={searching || loadingData}
              className="px-6 py-3 rounded-xl font-semibold bg-cyan-500 text-slate-950 md:col-span-2"
            >
              {searching ? 'Searching...' : 'Save Criteria & Find Cars'}
            </button>
          </form>
        </section>

        {error && <div className="mt-4 text-red-300">{error}</div>}
        {showWaiting && (
          <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-amber-100">
            Sorry, we do not have a car that matches your criteria right now. Your criteria were saved and monitoring started.
            <div className="mt-2 text-amber-50/95">
              While waiting, you can browse other available cars here:{' '}
              <Link href="/vehicles" className="underline font-semibold hover:text-white">
                Browse Cars
              </Link>
              .
            </div>
          </div>
        )}
        {lastSavedAt && (
          <div className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-emerald-100">
            Criteria saved successfully at {lastSavedAt}. You will receive a header notification when a suitable car is posted.
          </div>
        )}

        {showEmailPromptModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl border border-cyan-300/30 bg-slate-950 p-6 shadow-2xl">
              <h3 className="text-xl font-semibold text-white">No matching car right now</h3>
              <p className="mt-2 text-slate-300">
                Do you want to receive an email alert when a matching car is posted?
              </p>

              <div className="mt-4">
                <label className="block text-sm text-slate-200 mb-2">Email for alerts (optional)</label>
                <input
                  type="email"
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  disabled={savingAlert}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/70 border border-slate-700 text-white"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Leave blank and click "Save Without Email" if you only want in-app alert.
                </p>
              </div>

              {emailPromptError && (
                <div className="mt-3 rounded-lg border border-red-300/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                  {emailPromptError}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (savingAlert) return;
                    setShowEmailPromptModal(false);
                    setPendingSearchPayload(null);
                    setAlertEmail('');
                    setEmailPromptError(null);
                  }}
                  className="rounded-xl border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAlertWithoutEmail}
                  disabled={savingAlert}
                  className="rounded-xl border border-cyan-400/40 px-4 py-2 text-cyan-200 hover:bg-cyan-500/10 disabled:opacity-60"
                >
                  Save Without Email
                </button>
                <button
                  type="button"
                  onClick={saveAlertWithEmail}
                  disabled={savingAlert}
                  className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-60"
                >
                  {savingAlert ? 'Saving...' : 'Save & Notify by Email'}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Current matches</h2>
          {results.length === 0 ? (
            <div className="rounded-xl border border-white/20 bg-white/5 p-5 text-slate-300">
              Matching cars will appear here when System finds results.
              {showWaiting && (
                <div className="mt-2 text-slate-200">
                  Sorry for the inconvenience. You can check other available listings at{' '}
                  <Link href="/vehicles" className="underline font-semibold hover:text-cyan-300">
                    Browse Cars
                  </Link>{' '}
                  while waiting for a suitable match.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map(({ posting, seller }) => (
                <article
                  key={posting._id}
                  className="group rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-slate-900/85 via-slate-900/75 to-indigo-950/60 p-4 shadow-xl shadow-cyan-900/20 backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/40 hover:shadow-cyan-500/20"
                >
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60">
                    <CarCard
                      id={posting._id}
                      year={posting.vehicle.yearOfManufacture}
                      make={posting.vehicle.make}
                      model={posting.vehicle.model}
                      price={posting.price}
                      mileage={posting.vehicle.mileage}
                      location={posting.locationCity || posting.locationDistrict || posting.locationAddress || ''}
                      transmission={posting.vehicle.transmission}
                      image={posting.vehicle.images?.[0] || CAR_PLACEHOLDER}
                      href={`/vehicle/${posting._id}`}
                      onContact={async () => {
                        if (seller?._id) {
                          await startConversationWithSeller(seller._id);
                          return;
                        }
                        const fetchedSeller = await readSellerFromPostingDetails(posting._id);
                        if (!fetchedSeller?._id) {
                          showErrorNotification('Error', 'Seller information is unavailable.');
                          return;
                        }
                        await startConversationWithSeller(fetchedSeller._id);
                      }}
                      onBuy={(id) => {
                        window.location.href = `/vehicle/${id}/buy`;
                      }}
                      variant="grid"
                      currency="VND"
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-xs tracking-widest uppercase text-cyan-300/80">Seller information</div>
                      <div className="h-px flex-1 ml-3 bg-gradient-to-r from-cyan-400/40 to-transparent" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-cyan-200/30 bg-slate-800">
                        <Image
                          src={seller?.avatarUrl || AVATAR_PLACEHOLDER}
                          alt="Seller avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-sm">
                        <div className="text-slate-100 font-semibold">
                          {seller ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'N/A' : 'N/A'}
                        </div>
                        <div className="text-slate-300/90">Phone: {seller?.phoneNumber || 'N/A'}</div>
                        <div className="text-slate-300/90">Email: {seller?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your saved requests</h2>
            <button
              type="button"
              onClick={clearMatchedRequests}
              className="px-3 py-2 text-sm rounded-lg border border-white/20 hover:bg-white/10 transition"
            >
              Clear matched
            </button>
          </div>
          {loadingSavedSearches ? (
            <p className="text-slate-300">Loading...</p>
          ) : savedSearches.length === 0 ? (
            <div className="rounded-xl border border-white/20 bg-white/5 p-5 text-slate-300">No saved requests yet.</div>
          ) : (
            <div className="space-y-3">
              {savedSearches.map((search) => (
                <article key={search._id} className="rounded-xl border border-white/20 bg-white/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-slate-100">{search.query || '(empty request)'}</div>
                    <button
                      type="button"
                      onClick={() => deleteSavedRequest(search._id)}
                      className="px-3 py-1 text-xs rounded-md border border-red-300/40 text-red-200 hover:bg-red-400/10 transition"
                    >
                      Delete
                    </button>
                  </div>
                  {search.matchedPostingId ? (
                    <div className="text-emerald-300 text-sm mt-2">
                      Matched {search.matchedAt ? `on ${new Date(search.matchedAt).toLocaleString()}` : ''}.
                    </div>
                  ) : (
                    <div className="text-amber-200 text-sm mt-2">Waiting for matching seller post.</div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
