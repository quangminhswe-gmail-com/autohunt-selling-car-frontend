'use client'

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingBag, Car, Users,
  Calendar, Download, ChevronRight, ArrowUpRight,
  ArrowDownRight, DollarSign, Activity,
  CheckCircle, Clock, XCircle
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

// --- MOCK DATA FOR OTHER SECTIONS ---
const fallbackTopBrands = [
  { name: 'Toyota', count: 145, pct: '35%' },
  { name: 'Mercedes-Benz', count: 98, pct: '24%' },
  { name: 'Ford', count: 65, pct: '16%' },
  { name: 'Hyundai', count: 42, pct: '10%' },
];

interface BrandMetric {
  name: string;
  count: number;
  pct: string;
}

export default function OverviewReportPage() {
  const [recentSales, setRecentSales] = useState<Order[]>([]);
  const [topBrands, setTopBrands] = useState<BrandMetric[]>(fallbackTopBrands);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const computeTopBrands = (orders: Order[]) => {
      const counts = orders.reduce((acc, order) => {
        const brand = order.vehicleId?.make?.trim() || 'Unknown';
        acc[brand] = (acc[brand] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sorted = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4);

      const maxCount = sorted[0]?.[1] ?? 1;
      return sorted.map(([name, count]) => ({
        name,
        count,
        pct: `${Math.round((count / maxCount) * 100)}%`,
      }));
    };

    const fetchRecentSales = async () => {
      try {
        setLoading(true);
        const orders = await apiClient<Order[]>('/admin/orders');

        const transformedSales = orders
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        setRecentSales(transformedSales);
        setTopBrands(computeTopBrands(orders));
      } catch (err) {
        console.error('Error fetching recent sales:', err);
        setError(err instanceof Error ? err.message : 'Failed to load recent sales');
        // Fallback to mock data if API fails
        const fallbackOrders: Order[] = [
          {
            _id: '1',
            customerName: 'Alice M.',
            customerId: { email: 'alice@example.com', firstName: 'Alice', lastName: 'M.' },
            vehicleId: { make: 'Mercedes-Benz', model: 'C300', images: ['https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'], price: 45000 },
            postingId: { title: 'Performance Edition', status: 'active' },
            agreedPrice: 45000,
            paymentStatus: 'paid',
            orderStatus: 'completed',
            deliveryStatus: 'delivered',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            customerName: 'Bob Builder',
            customerId: { email: 'bob@example.com', firstName: 'Bob', lastName: 'Builder' },
            vehicleId: { make: 'Ford', model: 'Ranger XLS', images: ['https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'], price: 28500 },
            postingId: { title: 'Adventure Pack', status: 'active' },
            agreedPrice: 28500,
            paymentStatus: 'partially_paid',
            orderStatus: 'pending',
            deliveryStatus: 'pending',
            createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          },
          {
            _id: '3',
            customerName: 'Charlie P.',
            customerId: { email: 'charlie@example.com', firstName: 'Charlie', lastName: 'P.' },
            vehicleId: { make: 'Hyundai', model: 'Tucson', images: ['https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'], price: 32000 },
            postingId: { title: 'Family Edition', status: 'active' },
            agreedPrice: 32000,
            paymentStatus: 'paid',
            orderStatus: 'completed',
            deliveryStatus: 'delivered',
            createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
          },
          {
            _id: '4',
            customerName: 'David B.',
            customerId: { email: 'david@example.com', firstName: 'David', lastName: 'B.' },
            vehicleId: { make: 'Mazda', model: '3 Sport', images: ['https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'], price: 22000 },
            postingId: { title: 'Sport Edition', status: 'active' },
            agreedPrice: 22000,
            paymentStatus: 'paid',
            orderStatus: 'completed',
            deliveryStatus: 'delivered',
            createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          },
          {
            _id: '5',
            customerName: 'Eve S.',
            customerId: { email: 'eve@example.com', firstName: 'Eve', lastName: 'S.' },
            vehicleId: { make: 'Toyota', model: 'Vios G', images: ['https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100'], price: 18500 },
            postingId: { title: 'City Edition', status: 'active' },
            agreedPrice: 18500,
            paymentStatus: 'unpaid',
            orderStatus: 'cancelled',
            deliveryStatus: 'pending',
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          },
        ];
        setRecentSales(fallbackOrders);
        setTopBrands(computeTopBrands(fallbackOrders));
      } finally {
        setLoading(false);
      }
    };

    fetchRecentSales();
  }, []);

  
  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6">
        {/* --- CHARTS & ANALYTICS AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            
            {/* Main Chart: Sales Performance */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 text-xl mb-1">Sales Analytics</h3>
                        <p className="text-sm text-gray-500">Monthly revenue performance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            Last 12 months
                        </button>
                    </div>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 pt-4 border-b border-gray-100 pb-4">
                    {[65, 59, 80, 81, 56, 95, 70, 75, 60, 85, 90, 100].map((h, i) => (
                        <div key={i} className="w-full flex flex-col justify-end h-full gap-2 group cursor-pointer">
                            <div 
                                className="w-full bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-200 group-hover:bg-emerald-600" 
                                style={{ height: `${h}%` }}
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-3 text-xs text-gray-500 font-medium px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>

            {/* Side Chart: Top Selling Brands */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 text-xl mb-6">Top Selling Brands</h3>
                
                <div className="flex flex-col gap-5">
                    {topBrands.map((brand, idx) => (
                        <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-800 text-sm">{brand.name}</span>
                                <span className="text-sm text-gray-600 font-medium">{brand.count} cars</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                                    style={{ width: brand.pct }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-8 py-3 text-sm font-semibold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                    View Full Report <ChevronRight size={16} />
                </button>
            </div>
        </div>

        {/* --- RECENT ACTIVITY TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-xl">Recent Sales</h3>
                        <p className="text-sm text-gray-500">Latest transactions and order updates</p>
                    </div>
                </div>
                <a href="/admin/orders" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                    View All Orders →
                </a>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                    <span className="text-gray-600 font-medium">Loading recent sales...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <XCircle size={24} />
                    </div>
                    <p className="text-red-600 font-medium mb-2">Failed to load recent sales</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            ) : (
                <div className="overflow-x-auto mt-6">
                    <table className="w-full text-left rounded-xl">
                        <thead className="bg-[#EBF7F1] text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 rounded-l-md text-left pl-6">Product</th>
                                <th className="p-4 text-left">Customer</th>
                                <th className="p-4 text-left">Date</th>
                                <th className="p-4 text-left">Price</th>
                                <th className="p-4 rounded-r-md text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {recentSales.length > 0 ? (
                                recentSales.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-4 text-left pl-6">
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
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="p-4 text-sm font-bold text-slate-800">₫{order.agreedPrice.toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="flex justify-start">
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
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center">
                                        <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-4">
                                            <ShoppingBag size={24} />
                                        </div>
                                        <p className="text-gray-500 font-medium">No recent sales found</p>
                                        <p className="text-gray-400 text-sm mt-1">Sales data will appear here once transactions occur</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
}