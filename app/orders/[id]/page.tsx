'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';

interface Order {
  _id: string;
  postingId: {
    _id: string;
    title: string;
    status: string;
  };
  vehicleId: {
    _id: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    mileage: number;
    color: string;
    transmission: string;
    type: string;
    fuelType: string;
    images: string[];
    price: number;
  };
  customerId: {
    _id: string;
    email: string;
  };
  ownerId: {
    _id: string;
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
  completedAt?: string;
  cancelledAt?: string;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [newDeliveryStatus, setNewDeliveryStatus] = useState('');


  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      if (!id || typeof id !== 'string') return;
      setLoading(true);
      setError(null);

      try {
        const orderData = await apiClient<Order>(`/orders/${id}`);
        setOrder(orderData);
        
        // Decode JWT token to get current user ID
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(tokenData.sub);
        
        setNewOrderStatus(orderData.orderStatus);
        setNewDeliveryStatus(orderData.deliveryStatus);
      } catch (err) {
        console.error('Error loading order', err);
        setError((err as Error).message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  const isSeller = order?.ownerId?._id === currentUserId;
  const isBuyer = order?.customerId?._id === currentUserId;

  const handleUpdateOrderStatus = async () => {
    if (!order || !isSeller || newOrderStatus === order.orderStatus) return;

    setUpdating(true);
    try {
      const updatedOrder = await apiClient<Order>(`/orders/${order._id}/status`, {
        method: 'PATCH',
        body: { orderStatus: newOrderStatus },
      });
      setOrder(updatedOrder);
      setError(null);
    } catch (err) {
      console.error('Error updating order status', err);
      setError((err as Error).message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateDeliveryStatus = async () => {
    if (!order || !isSeller || newDeliveryStatus === order.deliveryStatus) return;

    setUpdating(true);
    try {
      const updatedOrder = await apiClient<Order>(`/orders/${order._id}/delivery-status`, {
        method: 'PATCH',
        body: { deliveryStatus: newDeliveryStatus },
      });
      setOrder(updatedOrder);
      setError(null);
    } catch (err) {
      console.error('Error updating delivery status', err);
      setError((err as Error).message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string, type: 'order' | 'payment' | 'delivery') => {
    let colors: { [key: string]: string } = {};
    
    if (type === 'order') {
      colors = {
        pending: 'bg-blue-100 text-blue-800',
        confirmed: 'bg-blue-100 text-blue-800',
        paid: 'bg-green-100 text-green-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
      };
    } else if (type === 'payment') {
      colors = {
        unpaid: 'bg-red-100 text-red-800',
        partially_paid: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        refunded: 'bg-gray-100 text-gray-800',
      };
    } else {
      colors = {
        not_delivered: 'bg-orange-100 text-orange-800',
        delivering: 'bg-blue-100 text-blue-800',
        delivered: 'bg-green-100 text-green-800',
      };
    }
    
    const color = colors[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center">
          <p className="text-gray-500">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <Link
              href={isSeller ? '/orders/seller' : '/orders'}
              className="text-red-600 hover:text-red-800 mt-4 inline-block font-semibold"
            >
              Back to orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-10">
          <p className="text-gray-500">Order not found</p>
          <Link
            href={isSeller ? '/orders/seller' : '/orders'}
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block font-semibold"
          >
            Back to orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Back Button */}
        <Link
          href={isSeller ? '/orders/seller' : '/orders'}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6 font-semibold"
        >
          ← Back to orders
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
        <p className="text-gray-600 mb-8">Order ID: {order._id}</p>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Vehicle & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vehicle Information</h2>
              <div className="space-y-4">
                {order.vehicleId?.images?.[0] && (
                  <img
                    src={order.vehicleId.images[0]}
                    alt={`${order.vehicleId.make} ${order.vehicleId.model}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Make & Model</p>
                    <p className="font-semibold text-gray-900">
                      {order.vehicleId?.make} {order.vehicleId?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Year</p>
                    <p className="font-semibold text-gray-900">{order.vehicleId?.yearOfManufacture}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mileage</p>
                    <p className="font-semibold text-gray-900">
                      {order.vehicleId?.mileage?.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-semibold text-gray-900">{order.vehicleId?.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold text-gray-900">{order.vehicleId?.transmission}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                    <p className="font-semibold text-gray-900">{order.vehicleId?.fuelType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Listing Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-semibold text-gray-900">{order.postingId?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {getStatusBadge(order.postingId?.status || 'active', 'order')}
                </div>
              </div>
            </div>

            {/* Transaction Parties */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Transaction Parties</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Seller</p>
                  <p className="font-semibold text-gray-900">{order.ownerId?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Buyer</p>
                  <p className="font-semibold text-gray-900">{order.customerId?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Agreed Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₫{order.agreedPrice?.toLocaleString('vi-VN')}
                  </p>
                </div>
                {order.depositAmount > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Deposit</p>
                    <p className="font-semibold text-gray-900">
                      ₫{order.depositAmount?.toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  {getStatusBadge(order.paymentStatus, 'payment')}
                </div>
              </div>
            </div>

            {/* Current Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Current Status</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Order Status</p>
                  {getStatusBadge(order.orderStatus, 'order')}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Delivery Status</p>
                  {getStatusBadge(order.deliveryStatus, 'delivery')}
                </div>
              </div>
            </div>

            {/* Seller Update Controls */}
            {isSeller && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updating}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="paid">Paid</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={handleUpdateOrderStatus}
                      disabled={updating || newOrderStatus === order.orderStatus}
                      className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                    >
                      {updating ? 'Updating...' : 'Update Order'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Status
                    </label>
                    <select
                      value={newDeliveryStatus}
                      onChange={(e) => setNewDeliveryStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updating}
                    >
                      <option value="not_delivered">Not Delivered</option>
                      <option value="delivering">Delivering</option>
                      <option value="delivered">Delivered</option>
                    </select>
                    <button
                      onClick={handleUpdateDeliveryStatus}
                      disabled={updating || newDeliveryStatus === order.deliveryStatus}
                      className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                    >
                      {updating ? 'Updating...' : 'Update Delivery'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Notice */}
            {isBuyer && !isSeller && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm font-semibold">
                  You can view and track your order status here. The seller will update delivery information as it progresses.
                </p>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Created</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {order.completedAt && (
                  <div>
                    <p className="text-gray-600">Completed</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.completedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                {order.cancelledAt && (
                  <div>
                    <p className="text-gray-600">Cancelled</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-600">Last Updated</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(order.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
