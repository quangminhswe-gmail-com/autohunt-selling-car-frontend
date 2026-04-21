'use client'

import React, { useState } from 'react';
import { 
  Plus, MoreHorizontal, Search, Filter, 
  ChevronLeft, ChevronRight, Tag, Calendar, 
  Percent, Trash2, Pencil, Copy, BarChart3 
} from 'lucide-react';

// --- MOCK DATA (Promotion Campaigns) ---
const promotions = [
  { 
    id: 1, 
    name: 'Lunar New Year Sale', 
    code: 'TET2026', 
    discount: '50%', 
    type: 'Percentage',
    used: 450, 
    limit: 500, 
    startDate: 'Jan 20, 2026', 
    endDate: 'Feb 10, 2026', 
    status: 'Active' 
  },
  { 
    id: 2, 
    name: 'New Dealer Welcome', 
    code: 'DEALER_NEW', 
    discount: '₫500,000', 
    type: 'Fixed Amount',
    used: 120, 
    limit: 1000, 
    startDate: 'Jan 01, 2026', 
    endDate: 'Dec 31, 2026', 
    status: 'Active' 
  },
  { 
    id: 3, 
    name: 'Free Listing Weekend', 
    code: 'FREELIST', 
    discount: '100%', 
    type: 'Percentage',
    used: 200, 
    limit: 200, 
    startDate: 'Feb 01, 2026', 
    endDate: 'Feb 03, 2026', 
    status: 'Expired' 
  },
  { 
    id: 4, 
    name: 'Summer Boost Pack', 
    code: 'SUMMER26', 
    discount: '30%', 
    type: 'Percentage',
    used: 0, 
    limit: 300, 
    startDate: 'Jun 01, 2026', 
    endDate: 'Jun 30, 2026', 
    status: 'Scheduled' 
  },
  { 
    id: 5, 
    name: 'VIP Member Discount', 
    code: 'VIP_ONLY', 
    discount: '15%', 
    type: 'Percentage',
    used: 85, 
    limit: 100, 
    startDate: 'Jan 15, 2026', 
    endDate: 'Feb 15, 2026', 
    status: 'Active' 
  },
];

export default function PromotionManagementPage() {
  
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
                        placeholder="Search by Code or Campaign Name..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <div className="flex gap-3">
                    <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all shadow-emerald-200">
                        <Plus size={18} /> Create Promotion
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-center rounded-xl">
                    <thead className="bg-[#EBF7F1]">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md text-left pl-6">Campaign Info</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Code</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Discount</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Usage</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Duration</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-r-md">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {promotions.map((promo, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                <td className="p-4 text-left pl-6">
                                    <span className="text-sm font-bold text-gray-700 block">{promo.name}</span>
                                    <span className="text-xs text-gray-400">{promo.type}</span>
                                </td>
                                
                                <td className="p-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-dashed border-slate-300 rounded text-xs font-mono font-bold text-slate-700">
                                        {promo.code}
                                        <Copy size={12} className="text-slate-400 cursor-pointer hover:text-slate-600" />
                                    </div>
                                </td>

                                <td className="p-4">
                                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                        -{promo.discount}
                                    </span>
                                </td>

                                <td className="p-4 w-48">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{promo.used} used</span>
                                            <span>Limit: {promo.limit}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${promo.used === promo.limit ? 'bg-red-400' : 'bg-emerald-500'}`} 
                                                style={{ width: `${(promo.used / promo.limit) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex flex-col text-xs text-gray-500">
                                        <span className="flex items-center justify-center gap-1">
                                            <Calendar size={12} /> {promo.startDate}
                                        </span>
                                        <span className="text-center mx-auto text-[10px] text-gray-400">to</span>
                                        <span className="flex items-center justify-center gap-1">
                                             {promo.endDate}
                                        </span>
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                            promo.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            promo.status === 'Expired' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                            {promo.status}
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
                </div>

                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Next <ChevronRight size={16} />
                </button>
            </div>

        </div>
    </div>
  );
}