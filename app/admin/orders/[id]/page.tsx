'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/app/utils/api';
import { showErrorNotification } from '@/utils/notifications';
import { ArrowLeft, CalendarDays, CreditCard, MapPin, Phone, Truck, User } from 'lucide-react';

interface OrderDetail {
  _id: string;
  postingId?: {
    _id: string;
    title: string;
    status: string;
  } | null;
  vehicleId?: {
    _id: string;
    make: string;
    model: string;
    yearOfManufacture?: number;
    mileage?: number;
    color?: string;
    transmission?: string;
    type?: string;
    fuelType?: string;
    images?: string[];
    price?: number;
  } | null;
  customerId?: {
    _id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  ownerId?: {
    _id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
  } | null;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  agreedPrice?: number;
  depositAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  deliveryStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

const renderBadge = (status: string | undefined, type: 'order' | 'payment' | 'delivery') => {
  const normalized = status?.toLowerCase() || 'unknown';
  let classes = 'bg-gray-100 text-gray-800';

  if (type === 'order') {
    classes =
      normalized === 'pending'
        ? 'bg-blue-100 text-blue-800'
        : normalized === 'confirmed' || normalized === 'paid'
        ? 'bg-emerald-100 text-emerald-800'
        : normalized === 'completed'
        ? 'bg-green-100 text-green-800'
        : normalized === 'cancelled'
        ? 'bg-red-100 text-red-800'
        : classes;
  }

  if (type === 'payment') {
    classes =
      normalized === 'unpaid'
        ? 'bg-red-100 text-red-800'
        : normalized === 'partially_paid'
        ? 'bg-amber-100 text-amber-800'
        : normalized === 'paid'
        ? 'bg-emerald-100 text-emerald-800'
        : normalized === 'refunded'
        ? 'bg-slate-100 text-slate-800'
        : classes;
  }

  if (type === 'delivery') {
    classes =
      normalized === 'not_delivered'
        ? 'bg-orange-100 text-orange-800'
        : normalized === 'delivering'
        ? 'bg-sky-100 text-sky-800'
        : normalized === 'delivered'
        ? 'bg-emerald-100 text-emerald-800'
        : classes;
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${classes}`}>
      {type === 'order' && <Truck size={14} />}
      {type === 'payment' && <CreditCard size={14} />}
      {type === 'delivery' && <Truck size={14} />}
      {normalized.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params?.id;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient<OrderDetail>(`/admin/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load order details';
        setError(message);
        showErrorNotification('Order Load Failed', message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-5xl mx-auto">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-5xl mx-auto">
          <div className="text-red-600">{error || 'Order not found.'}</div>
          <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-2 text-emerald-600 hover:underline">
            <ArrowLeft size={16} /> Back to order management
          </Link>
        </div>
      </div>
    );
  }

  const customerName =
    order.customerName ||
    [order.customerId?.firstName, order.customerId?.lastName].filter(Boolean).join(' ') ||
    order.customerId?.email ||
    'Unknown Customer';

  const ownerName =
    [order.ownerId?.firstName, order.ownerId?.lastName].filter(Boolean).join(' ') ||
    order.ownerId?.email ||
    'Unknown Owner';

  return (
    <div className="bg-[#F8F9FA] min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/admin/orders" className="inline-flex items-center gap-2 text-emerald-600 hover:underline">
              <ArrowLeft size={16} /> Back to order management
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Order Details</h1>
            <p className="text-gray-600 mt-1">Order ID: {order._id}</p>
          </div>
          <div className="space-y-2 text-right">
            {renderBadge(order.orderStatus, 'order')}
            {renderBadge(order.paymentStatus, 'payment')}
            {renderBadge(order.deliveryStatus, 'delivery')}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl bg-gray-50 overflow-hidden h-72">
                  <img
                    src={order.vehicleId?.images?.[0] || 'https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'}
                    alt={`${order.vehicleId?.make || 'Vehicle'} ${order.vehicleId?.model || ''}`}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Make & Model</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {order.vehicleId?.make || 'Unknown'} {order.vehicleId?.model || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Posting Title</p>
                    <p className="text-base text-gray-700">{order.postingId?.title || 'N/A'}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">Year</p>
                      <p className="font-semibold text-gray-900">{order.vehicleId?.yearOfManufacture || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mileage</p>
                      <p className="font-semibold text-gray-900">{order.vehicleId?.mileage ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Color</p>
                      <p className="font-semibold text-gray-900">{order.vehicleId?.color || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fuel / Transmission</p>
                      <p className="font-semibold text-gray-900">{order.vehicleId?.fuelType || 'N/A'} / {order.vehicleId?.transmission || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Agreed Price</p>
                  <p className="text-lg font-semibold text-gray-900">${order.agreedPrice?.toLocaleString() || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deposit Amount</p>
                  <p className="text-lg font-semibold text-gray-900">${order.depositAmount?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="text-lg font-semibold text-gray-900">{order.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Created</p>
                  <p className="text-lg font-semibold text-gray-900">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Customer</h2>
              <div className="flex items-center gap-3 text-gray-700">
                <User size={18} />
                <div>
                  <p className="font-semibold text-gray-900">{customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerId?.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} />
                <p>{order.customerPhone || 'Phone not provided'}</p>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin size={18} />
                <p>{order.deliveryAddress || 'Address not provided'}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Owner</h2>
              <div className="flex items-center gap-3 text-gray-700">
                <User size={18} />
                <div>
                  <p className="font-semibold text-gray-900">{ownerName}</p>
                  <p className="text-sm text-gray-500">{order.ownerId?.email || 'No email'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <CalendarDays size={18} />
                <p>Updated: {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
