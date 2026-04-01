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

interface Review {
  rating: number;
  comment: string;
}

interface ExistingReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
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
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [review, setReview] = useState<Review>({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);


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
        setNewPaymentStatus(orderData.paymentStatus);
      } catch (err) {
        console.error('Error loading order', err);
        setError((err as Error).message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, router]);

  const getEntityId = (entity: any) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id?.toString?.() || entity.id?.toString?.();
  };

  const isSeller = getEntityId(order?.ownerId) === currentUserId;
  const isBuyer = getEntityId(order?.customerId) === currentUserId;

  const capitalize = (str: string) => {
    if (!str) return '';
    const formatted = str.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
  };

  const handleUpdateOrderStatus = async () => {
    if (!order || !isSeller || newOrderStatus === order.orderStatus) return;

    setUpdating(true);
    try {
      await apiClient<Order>(`/orders/${order._id}/status`, {
        method: 'PATCH',
        body: { orderStatus: newOrderStatus },
      });
      // Re-fetch the order to get updated populated data
      const updatedOrder = await apiClient<Order>(`/orders/${order._id}`);
      setOrder(updatedOrder);
      setNewOrderStatus(updatedOrder.orderStatus || '');
      setNewDeliveryStatus(updatedOrder.deliveryStatus || '');
      setNewPaymentStatus(updatedOrder.paymentStatus || '');
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
      await apiClient<Order>(`/orders/${order._id}/delivery-status`, {
        method: 'PATCH',
        body: { deliveryStatus: newDeliveryStatus },
      });
      // Re-fetch the order to get updated populated data
      const updatedOrder = await apiClient<Order>(`/orders/${order._id}`);
      setOrder(updatedOrder);
      setNewOrderStatus(updatedOrder.orderStatus || '');
      setNewDeliveryStatus(updatedOrder.deliveryStatus || '');
      setNewPaymentStatus(updatedOrder.paymentStatus || '');
      setError(null);
    } catch (err) {
      console.error('Error updating delivery status', err);
      setError((err as Error).message || 'Failed to update delivery status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!order || !isSeller || newPaymentStatus === order.paymentStatus) return;

    setUpdating(true);
    try {
      await apiClient<Order>(`/orders/${order._id}/payment-status`, {
        method: 'PATCH',
        body: { paymentStatus: newPaymentStatus },
      });
      // Re-fetch the order to get updated populated data
      const updatedOrder = await apiClient<Order>(`/orders/${order._id}`);
      setOrder(updatedOrder);
      setNewOrderStatus(updatedOrder.orderStatus || '');
      setNewDeliveryStatus(updatedOrder.deliveryStatus || '');
      setNewPaymentStatus(updatedOrder.paymentStatus || '');
      setError(null);
    } catch (err) {
      console.error('Error updating payment status', err);
      setError((err as Error).message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!order || !review.rating || !review.comment.trim()) {
      setReviewError('Please provide both a rating and a comment');
      return;
    }

    setSubmittingReview(true);
    setReviewError(null);
    try {
      await apiClient('/reviews', {
        method: 'POST',
        body: {
          orderId: order._id,
          rating: review.rating,
          comment: review.comment,
        },
      });
      setReviewSubmitted(true);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      const errorMsg = (err as Error).message || 'Failed to submit review';
      // If user already reviewed this order, show success state
      if (errorMsg.includes('Already reviewed')) {
        setReviewSubmitted(true);
      } else {
        console.error('Error submitting review', err);
        setReviewError(errorMsg);
      }
    } finally {
      setSubmittingReview(false);
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
                    <p className="font-semibold text-gray-900">{capitalize(order.vehicleId?.color || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold text-gray-900">{capitalize(order.vehicleId?.transmission || '')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel Type</p>
                    <p className="font-semibold text-gray-900">{capitalize(order.vehicleId?.fuelType || '')}</p>
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
                    ${order.agreedPrice?.toLocaleString('en-US')}
                  </p>
                </div>
                {order.depositAmount > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Deposit</p>
                    <p className="font-semibold text-gray-900">
                      ${order.depositAmount?.toLocaleString('en-US')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900">{capitalize(order.paymentMethod || '')}</p>
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

            {/* Review Section - Only show for buyers when order is completed */}
            {isBuyer && !isSeller && order.orderStatus === 'completed' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                {reviewSubmitted ? (
                  <div className="text-center">
                    <div className="text-3xl mb-2">✓</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Review Submitted</h3>
                    <p className="text-gray-600 text-sm">
                      Thank you for reviewing the seller. Your review has been submitted successfully.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Review the Seller</h2>
                    
                    {reviewError && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 text-sm">{reviewError}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Rating */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Rating *
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setReview({ ...review, rating: star })}
                              className={`text-3xl transition ${
                                review.rating >= star
                                  ? 'text-yellow-400 hover:text-yellow-500'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                              disabled={submittingReview}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {review.rating} out of 5 stars
                        </p>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Comments *
                        </label>
                        <textarea
                          value={review.comment}
                          onChange={(e) =>
                            setReview({ ...review, comment: e.target.value })
                          }
                          placeholder="Share your experience with this seller..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          rows={4}
                          disabled={submittingReview}
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview || !review.rating || !review.comment.trim()}
                        className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

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

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={newPaymentStatus}
                      onChange={(e) => setNewPaymentStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={updating}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="partially_paid">Partially Paid</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <button
                      onClick={handleUpdatePaymentStatus}
                      disabled={updating || newPaymentStatus === order.paymentStatus}
                      className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition"
                    >
                      {updating ? 'Updating...' : 'Update Payment'}
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
