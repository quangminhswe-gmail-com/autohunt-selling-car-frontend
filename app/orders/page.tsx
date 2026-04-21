'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';

interface Order {
  _id: string;
  postingId?: {
    title: string;
    status: string;
  } | null;
  vehicleId: {
    make: string;
    model: string;
    images: string[];
    price: number;
  };
  ownerId: {
    email: string;
  };
  agreedPrice: number;
  depositAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient<Order[]>('/orders/my-orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Error loading orders', err);
        setError((err as Error).message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return 'bg-red-100 text-red-800';
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'NOT_DELIVERED':
        return 'bg-orange-100 text-orange-800';
      case 'DELIVERING':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-gray-500">Loading your orders...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage all your vehicle purchase orders</p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">No orders yet</h3>
              <p className="mt-1 text-gray-600">
                Start shopping by browsing our vehicles and place your first order.
              </p>
              <Link
                href="/vehicle"
                className="mt-4 inline-block px-6 py-2 bg-[#006557] text-white rounded-lg font-semibold hover:bg-[#005447] transition"
              >
                Browse Vehicles
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                        {order.vehicleId.images && order.vehicleId.images.length > 0 ? (
                          <img
                            src={order.vehicleId.images[0]}
                            alt={`${order.vehicleId.make} ${order.vehicleId.model}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {order.vehicleId.make} {order.vehicleId.model}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-1">
                          {order.postingId?.title || `${order.vehicleId.make} ${order.vehicleId.model}`}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                          <p className="text-gray-700">
                            Agreed Price:{' '}
                            <span className="font-semibold text-[#006557]">
                              ₫{order.agreedPrice.toLocaleString()}
                            </span>
                          </p>
                          {order.depositAmount > 0 && (
                            <p className="text-gray-700">
                              Deposit:{' '}
                              <span className="font-semibold">
                                ₫{order.depositAmount.toLocaleString()}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end md:ml-4">
                      <div className="flex gap-2 flex-wrap md:justify-end">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(
                            order.orderStatus
                          )}`}
                        >
                          {order.orderStatus}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDeliveryStatusColor(
                            order.deliveryStatus
                          )}`}
                        >
                          {order.deliveryStatus}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 md:text-right">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>

                      <Link
                        href={`/orders/${order._id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#006557] text-white rounded-lg text-sm font-semibold hover:bg-[#005447] transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
