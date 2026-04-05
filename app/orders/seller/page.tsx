'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';

interface Order {
  _id: string;
  postingId?: { title: string; status: string } | null;
  vehicleId: { make: string; model: string; images: string[]; price: number };
  ownerId: { _id: string; email: string };
  agreedPrice: number;
  depositAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  createdAt: string;
}

export default function SellerOrdersPage() {
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

    const loadSellerOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient<Order[]>('/orders/owner-orders');
        setOrders(data || []);
      } catch (err) {
        console.error('Error loading owner orders', err);
        setError((err as Error).message || 'Failed to load seller orders');
      } finally {
        setLoading(false);
      }
    };

    loadSellerOrders();
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-center">
          <p className="text-gray-500">Loading your seller orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Order Management</h1>
          <p className="text-gray-600">Monitor and update delivery status for your buyers.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <h3 className="mt-2 text-lg font-semibold text-gray-900">No owner orders yet</h3>
            <p className="mt-1 text-gray-600">New purchase requests will appear here once your listings are bought.</p>
            <Link
              href="/vehicles"
              className="mt-4 inline-block px-6 py-2 bg-[#006557] text-white rounded-lg font-semibold hover:bg-[#005447] transition"
            >
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.vehicleId.make} {order.vehicleId.model}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.postingId?.title || `${order.vehicleId.make} ${order.vehicleId.model}`}
                      </p>
                      <p className="text-sm mt-2 text-gray-700">
                        Buyer order: ${order.agreedPrice.toLocaleString()} | Deposit: ${order.depositAmount.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getOrderStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                        {order.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Created: {new Date(order.createdAt).toLocaleString()}</p>
                    <Link
                      href={`/orders/${order._id}`}
                      className="px-4 py-2 bg-[#006557] text-white rounded-lg text-sm font-semibold hover:bg-[#005447] transition"
                    >
                      View / Update
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
