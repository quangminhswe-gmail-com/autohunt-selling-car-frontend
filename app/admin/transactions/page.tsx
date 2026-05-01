'use client'

import React, { useState } from 'react';
import { 
  Plus, MoreHorizontal, Search, Filter, 
  ChevronLeft, ChevronRight, Download, CreditCard, 
  Wallet, AlertCircle, CheckCircle, Clock, Pencil, Trash2 
} from 'lucide-react';

// --- MOCK DATA (Payment Transactions) ---
const transactions = Array(10).fill(null).map((_, i) => ({
  id: i + 1,
  trxId: `#TRX-009${i}`,
  invoiceId: `INV-2026-${i + 100}`,
  user: {
    name: i % 2 === 0 ? 'Alex Johnson' : 'Showroom AutoCity',
    email: i % 2 === 0 ? 'alex.j@example.com' : 'contact@autocity.com',
    avatar: `https://i.pravatar.cc/150?u=${i + 20}`
  },
  description: i % 3 === 0 ? 'Premium Listing Fee' : (i % 3 === 1 ? 'Dealer Subscription (Monthly)' : 'Push to Top Service'),
  amount: i % 3 === 1 ? '₫12,000,000' : '₫600,000',
  method: i % 2 === 0 ? 'Credit Card' : 'Bank Transfer',
  status: i % 4 === 0 ? 'Pending' : (i % 4 === 1 ? 'Failed' : 'Paid'),
  date: 'Feb 03, 2026',
}));

export default function PaymentManagementPage() {
  
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
                        placeholder="Search by Transaction ID, Invoice or User..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-center rounded-xl">
                    <thead className="bg-[#EBF7F1]">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md text-left pl-6">Transaction Info</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-left">Customer</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-left">Description</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Amount</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-r-md">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((trx, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 text-left pl-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-mono font-medium text-slate-700">{trx.trxId}</span>
                                        <span className="text-xs text-gray-400">{trx.invoiceId}</span>
                                    </div>
                                </td>
                                
                                <td className="p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <img src={trx.user.avatar} alt="User" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-700">{trx.user.name}</span>
                                            <span className="text-xs text-gray-400">{trx.user.email}</span>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4 text-left">
                                    <span className="text-sm text-gray-600 font-medium">{trx.description}</span>
                                    <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <CreditCard size={10} /> {trx.method}
                                    </div>
                                </td>

                                <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{trx.date}</td>
                                
                                <td className="p-4 text-sm font-bold text-gray-800">{trx.amount}</td>
                                
                                <td className="p-4">
                                    <div className="flex justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                            trx.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            trx.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            'bg-rose-50 text-rose-700 border-rose-100'
                                        }`}>
                                            {trx.status === 'Paid' && <CheckCircle size={12} />}
                                            {trx.status === 'Pending' && <Clock size={12} />}
                                            {trx.status === 'Failed' && <AlertCircle size={12} />}
                                            {trx.status}
                                        </span>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex justify-center gap-2 text-gray-400">
                                        <button className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors" title="Edit">
                                            <Pencil size={18} />
                                        </button>
                                        <button className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors" title="Delete">
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