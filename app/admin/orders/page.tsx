'use client'

import React, { useState } from 'react';
import { 
  Plus, MoreHorizontal, Search, Filter, 
  ChevronLeft, ChevronRight, ShoppingBag, 
  Clock, CheckCircle, XCircle, Eye, Printer, DollarSign , Pencil, Trash2
} from 'lucide-react';

// --- MOCK DATA ---
const orders = Array(10).fill(null).map((_, i) => ({
  id: i + 1,
  orderId: `#ORD-782${i}`,
  customer: {
    name: i % 2 === 0 ? 'Michael Scott' : 'Dwight Schrute',
    email: i % 2 === 0 ? 'michael@dunder.com' : 'dwight@farms.com',
    avatar: `https://i.pravatar.cc/150?u=${i + 50}`
  },
  product: {
    name: 'BMW i10 Sport Edition',
    image: 'https://img.freepik.com/free-photo/silver-sedan-car_114579-2706.jpg?w=100',
    variant: 'Silver / Automatic'
  },
  date: 'Jan 01, 2026',
  price: '$9,999.00',
  paymentStatus: i % 3 === 0 ? 'Paid' : (i % 3 === 1 ? 'Pending' : 'Cancelled'),
  fulfillment: i % 3 === 0 ? 'Delivered' : 'Processing'
}));

export default function OrderManagementPage() {
  
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
                        {orders.map((order, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 text-left pl-6">
                                    <span className="text-sm font-mono font-medium text-gray-500">{order.orderId}</span>
                                </td>
                                
                                <td className="p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                            <img src={order.product.image} alt="Car" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-700">{order.product.name}</span>
                                            <span className="text-xs text-gray-400">{order.product.variant}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 text-left">
                                    <div className="flex items-center gap-2">
                                         <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                            <img src={order.customer.avatar} className="w-full h-full object-cover" />
                                         </div>
                                         <div className="flex flex-col">
                                            <span className="text-sm text-gray-700">{order.customer.name}</span>
                                         </div>
                                    </div>
                                </td>

                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{order.date}</td>
                                
                                <td className="p-4 text-sm font-bold text-slate-800">{order.price}</td>
                                
                                <td className="p-4">
                                    <div className="flex justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                            order.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            order.paymentStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {order.paymentStatus === 'Paid' && <CheckCircle size={12} />}
                                            {order.paymentStatus === 'Pending' && <Clock size={12} />}
                                            {order.paymentStatus === 'Cancelled' && <XCircle size={12} />}
                                            {order.paymentStatus}
                                        </span>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex justify-center gap-2 text-gray-400">
                                        <button className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors" title="View Detail">
                                            <Pencil size={18} />
                                        </button>
                                        <button className="p-1.5 hover:bg-gray-100 hover:text-gray-600 rounded-md transition-colors">
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