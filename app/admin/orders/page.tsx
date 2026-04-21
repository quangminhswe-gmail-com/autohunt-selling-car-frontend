'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, 
  ChevronLeft, ChevronRight, ShoppingCart, 
  Clock, CheckCircle, XCircle, Eye, Trash2
} from 'lucide-react';
import { apiClient } from '@/app/utils/api';

// --- TYPES ---
interface Order {
  _id: string;
  customerName: string;
  customerId?: {
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  vehicleId?: {
    make: string;
    model: string;
    images: string[];
    price: number;
  } | null;
  postingId?: {
    title: string;
    status: string;
  } | null;
  agreedPrice: number;
  paymentStatus: string;
  orderStatus: string;
  deliveryStatus: string;
  createdAt: string;
}

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiClient<Order[]>('/admin/orders');
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const orderId = `#${order._id.slice(-6).toUpperCase()}`.toLowerCase();
    const customerName = (order.customerName ||
      [order.customerId?.firstName, order.customerId?.lastName]
        .filter(Boolean)
        .join(' ') ||
      order.customerId?.email ||
      '').toLowerCase();
    const vehicleName = `${order.vehicleId?.make || ''} ${order.vehicleId?.model || ''}`.toLowerCase();
    const postingTitle = (order.postingId?.title || '').toLowerCase();

    return orderId.includes(term) ||
           customerName.includes(term) ||
           vehicleName.includes(term) ||
           postingTitle.includes(term);
  });

  if (loading) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-center py-8">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="text-center py-8 text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6">
        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {/* Filter Toolbar */}
            <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 bg-white shadow-sm">
                    <Filter size={18} />
                </button>                
                <div className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        placeholder="Search order ID, customer name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all shadow-emerald-200">
                        <Plus size={18} /> Add Order
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
                {searchTerm && ` for "${searchTerm}"`}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-center rounded-xl">
                    <thead className="bg-[#EBF7F1]">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md text-left pl-6">Order ID</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-left">Product</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-left">Customer</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Price</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-r-md">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 text-left pl-6">
                                    <span className="text-sm font-mono font-medium text-gray-500">{`#${order._id.slice(-6).toUpperCase()}`}</span>
                                </td>
                                
                                <td className="p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                            <img 
                                                src={order.vehicleId?.images?.[0] || 'https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'} 
                                                alt="Car" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">{`${order.vehicleId?.make || 'Unknown'} ${order.vehicleId?.model || 'Vehicle'}`}</span>
                                            <span className="text-xs text-gray-400">{order.postingId?.title || 'No title'}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 text-left">
                                    <div className="flex items-center gap-2">
                                         <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                            <img src={`https://i.pravatar.cc/150?u=${order.customerId?.email || 'unknown'}`} className="w-full h-full object-cover" />
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">
                                              {order.customerName ||
                                                [order.customerId?.firstName, order.customerId?.lastName]
                                                  .filter(Boolean)
                                                  .join(' ') ||
                                                order.customerId?.email ||
                                                'Unknown Customer'}
                                            </span>
                                         </div>
                                    </div>
                                </td>

                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: '2-digit', 
                                        year: 'numeric' 
                                    })}
                                </td>
                                
                                <td className="p-4 text-sm font-bold text-slate-800">
                                    ₫{order.agreedPrice.toLocaleString()}
                                </td>
                                
                                <td className="p-4">
                                    <div className="flex justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                            order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            order.paymentStatus === 'partially_paid' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {order.paymentStatus === 'paid' && <CheckCircle size={12} />}
                                            {order.paymentStatus === 'partially_paid' && <Clock size={12} />}
                                            {order.paymentStatus === 'unpaid' && <XCircle size={12} />}
                                            {order.paymentStatus.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex justify-center gap-2 text-gray-400">
                                        <Link
                                          href={`/admin/orders/${order._id}`}
                                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors text-gray-500 cursor-pointer"
                                          title="View Order Details"
                                        >
                                          <Eye size={18} />
                                          <span className="text-sm font-medium">View</span>
                                        </Link>
                                        <button className="inline-flex items-center justify-center p-1.5 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-t border-gray-100 gap-4 mt-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} /> Previous
                </button>
                
                <div className="flex gap-2">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-200">1</button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition-colors">2</button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition-colors">3</button>
                    <span className="w-9 h-9 flex items-center justify-center text-gray-400">...</span>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Next <ChevronRight size={16} />
                </button>
            </div>

        </div>
    </div>
  );
} 