'use client'

import React from 'react';
import { 
  TrendingUp, ShoppingBag, Car, Users, 
  Calendar, Download, ChevronRight, ArrowUpRight, 
  ArrowDownRight, DollarSign, Activity 
} from 'lucide-react';

// --- MOCK DATA ---
const recentSales = [
  { id: 1, car: 'Mercedes-Benz C300', price: 45000, date: '2 mins ago', status: 'Completed', buyer: 'Alice M.' },
  { id: 2, car: 'Ford Ranger XLS', price: 28500, date: '1 hour ago', status: 'Pending', buyer: 'Bob Builder' },
  { id: 3, car: 'Hyundai Tucson', price: 32000, date: '3 hours ago', status: 'Completed', buyer: 'Charlie P.' },
  { id: 4, car: 'Mazda 3 Sport', price: 22000, date: '5 hours ago', status: 'Completed', buyer: 'David B.' },
  { id: 5, car: 'Toyota Vios G', price: 18500, date: '1 day ago', status: 'Cancelled', buyer: 'Eve S.' },
];

const topBrands = [
  { name: 'Toyota', count: 145, pct: '35%' },
  { name: 'Mercedes-Benz', count: 98, pct: '24%' },
  { name: 'Ford', count: 65, pct: '16%' },
  { name: 'Hyundai', count: 42, pct: '10%' },
];

export default function OverviewReportPage() {
  
  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6">

        {/* --- KPI GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign size={20} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <ArrowUpRight size={12} className="mr-1" /> +12.5%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">$1,280,500</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Total Revenue</p>
            </div>

            {/* Cars Sold */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Car size={20} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <ArrowUpRight size={12} className="mr-1" /> +8.2%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">342 Cars</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Total Vehicles Sold</p>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <ShoppingBag size={20} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">
                        <ArrowDownRight size={12} className="mr-1" /> -2.1%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">1,024</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">Total Orders</p>
            </div>

            {/* New Customers */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users size={20} />
                    </div>
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        <ArrowUpRight size={12} className="mr-1" /> +18.0%
                    </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">215 Users</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-1">New Registrations</p>
            </div>
        </div>

        {/* --- CHARTS & ANALYTICS AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Main Chart: Sales Performance */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg">Sales Analytics</h3>
                        <p className="text-xs text-gray-400">Monthly revenue performance</p>
                    </div>
                </div>
                
                {/* CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-3 pt-4 border-b border-gray-100 pb-2">
                    {[65, 59, 80, 81, 56, 95, 70, 75, 60, 85, 90, 100].map((h, i) => (
                        <div key={i} className="w-full flex flex-col justify-end h-full gap-2 group cursor-pointer">
                            <div 
                                className="w-full bg-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-all group-hover:bg-emerald-600" 
                                style={{ height: `${h}%` }}
                            ></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium px-1">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
            </div>

            {/* Side Chart: Top Selling Brands */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-slate-800 text-lg mb-6">Top Selling Brands</h3>
                
                <div className="flex flex-col gap-6">
                    {topBrands.map((brand, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">{brand.name}</span>
                                <span className="text-gray-500">{brand.count} cars</span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: brand.pct }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-8 py-2.5 text-sm font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                    View Full Report <ChevronRight size={16} />
                </button>
            </div>
        </div>

        {/* --- RECENT ACTIVITY TABLE --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Activity size={20} className="text-emerald-600" /> Recent Sales
                </h3>
                <a href="#" className="text-sm text-emerald-600 font-medium hover:underline">View All Orders</a>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#EBF7F1] text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 rounded-l-md">Vehicle</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 rounded-r-md text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {recentSales.map((sale) => (
                            <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-bold text-slate-700">{sale.car}</td>
                                <td className="p-4 text-gray-600">{sale.buyer}</td>
                                <td className="p-4 font-bold text-slate-800">₫{sale.price.toLocaleString()}</td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        sale.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                                        sale.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                        'bg-gray-100 text-gray-500'
                                    }`}>
                                        {sale.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right text-gray-400 text-xs">{sale.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}