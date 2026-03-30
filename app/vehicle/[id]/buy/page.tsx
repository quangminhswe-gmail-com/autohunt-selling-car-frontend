'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  mileage: number;
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
  status: string;
}

export default function VehicleBuyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [posting, setPosting] = useState<Posting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [agreedPrice, setAgreedPrice] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    const loadPosting = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient<Posting>(`/postings/details/${id}`);
        setPosting(data);
        setAgreedPrice(`${data.price}`);
      } catch (err) {
        console.error('Error fetching posting', err);
        setError((err as Error).message || 'Cannot load posting details.');
      } finally {
        setLoading(false);
      }
    };

    loadPosting();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!posting || !id) {
      setError('Invalid posting.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setError('Please log in to complete the purchase.');
      router.push('/login');
      return;
    }

    const vehicleId = posting.vehicle?.id || (posting.vehicle as unknown as { _id?: string })._id;
    if (!vehicleId) {
      setError('Vehicle details are missing.');
      return;
    }

    const agreedPriceValue = Number(agreedPrice);
    const depositValue = Number(depositAmount || 0);

    if (Number.isNaN(agreedPriceValue) || agreedPriceValue <= 0) {
      setError('Please enter a valid agreed price.');
      return;
    }

    if (depositValue < 0 || depositValue > agreedPriceValue) {
      setError('Deposit must be 0 or a positive number not greater than agreed price.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await apiClient('/orders', {
        method: 'POST',
        body: {
          postingId: id,
          vehicleId,
          agreedPrice: agreedPriceValue,
          depositAmount: depositValue,
          paymentMethod,
        },
      });

      setSuccess('Order created successfully. Redirecting to profile...');
      setTimeout(() => {
        router.push('/profile');
      }, 1300);

      console.log('Order created', order);
    } catch (err) {
      console.error('Order creation failed', err);
      setError((err as Error).message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!posting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-red-500">Posting not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#006557]">
            Home
          </Link>
          {' / '}
          <Link href={`/vehicle/${id}`} className="hover:text-[#006557]">
            {posting.title || `${posting.vehicle.make} ${posting.vehicle.model}`}
          </Link>
          {' / Buy'}
        </div>

        <h1 className="text-3xl font-bold mb-4 text-gray-900">Buy this vehicle</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl text-black font-semibold mb-3">Vehicle details</h2>
              <p className="text-gray-700">{posting.title}</p>
              <div className="mt-3 text-sm text-gray-500">
                <div>Make/model: {posting.vehicle.make} {posting.vehicle.model}</div>
                <div>Year: {posting.vehicle.yearOfManufacture}</div>
                <div>Mileage: {posting.vehicle.mileage.toLocaleString()} km</div>
                <div>Listing price: ${posting.price.toLocaleString()}</div>
                <div>Location: {posting.locationCity || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h2 className="text-xl text-black font-semibold mb-3">Order summary</h2>
              <p className="text-gray-800">Enter your purchase terms below and confirm order.</p>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agreed Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={agreedPrice}
                    onChange={(e) => setAgreedPrice(e.target.value)}
                    className="text-black mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Deposit amount</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="text-black mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-black mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006557]"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank transfer</option>
                    <option value="escrow">Escrow</option>
                  </select>
                </div>

                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>}
                {success && <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm">{success}</div>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {submitting ? 'Placing order...' : `Place Order (${posting.currency || '$'}${posting.price.toLocaleString()})`}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-3 text-black">Note</h3>
            <p className="text-sm text-gray-600">
              This will create an order and mark the posting as reserved. The seller must complete the sale via owner order management.
            </p>
            <p className="text-sm text-gray-500 mt-3">
              If you are not logged in, you will be redirected to login first.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
