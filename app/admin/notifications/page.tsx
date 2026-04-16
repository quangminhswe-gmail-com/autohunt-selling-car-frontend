'use client'

import React, { useState } from 'react';
import { 
  Bell, Send, Users, FileText, CheckCircle, Clock, Search, 
  Filter, ChevronLeft, ChevronRight, AlertTriangle, Info, Tag 
} from 'lucide-react';

export default function NotificationPage() {
  // Mock data (Translated to English)
  const history = [
    { id: 1, title: 'System Maintenance 02/02', recipient: 'All Users', type: 'System', date: '2024-02-01 10:00', status: 'Sent', readCount: 1540 },
    { id: 2, title: 'Listing Violation Warning', recipient: 'User: nguyenvanb', type: 'Warning', date: '2024-02-02 08:30', status: 'Read', readCount: 1 },
    { id: 3, title: 'Lunar New Year Promo Pack', recipient: 'Group: Sellers', type: 'Promotion', date: '2024-01-20 09:00', status: 'Sent', readCount: 450 },
    { id: 4, title: 'Privacy Policy Update', recipient: 'All Users', type: 'System', date: '2024-01-15 14:00', status: 'Sent', readCount: 1200 },
    { id: 5, title: 'Account Verification Request', recipient: 'User: levanC', type: 'Warning', date: '2024-01-10 09:15', status: 'Unread', readCount: 0 },
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 flex flex-col xl:flex-row gap-6">
      {/* --- LEFT COLUMN: HISTORY LIST (65-70%) --- */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 flex flex-col">
          {/* Filter Toolbar */}
          <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 bg-white shadow-sm">
              <Filter size={18} />
            </button>                
            <div className="relative flex-1 w-full">
              <input 
                type="text" 
                placeholder="Search notification ..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-2 w-full xl:w-auto">
              <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer flex-1">
                <option>Status: All</option>
                <option>Status: Paid</option>
                <option>Status: Pending</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left rounded-xl">
                <thead className="bg-[#EBF7F1]">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md">Detail</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Target</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Stats</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center rounded-r-md">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="p-4">
                        <p className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                           <Users className="w-4 h-4 text-gray-400" />
                           {item.recipient}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                          item.type === 'System' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          item.type === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          {item.type === 'System' && <Info size={12} />}
                          {item.type === 'Warning' && <AlertTriangle size={12} />}
                          {item.type === 'Promotion' && <Tag size={12} />}
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.readCount > 1 ? `${item.readCount} viewed` : 'No views yet'}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          {item.status === 'Sent' || item.status === 'Read' ? 
                            <CheckCircle className="w-5 h-5 text-emerald-500" /> : 
                            <Clock className="w-5 h-5 text-amber-500" />
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>

           {/* Pagination */}
           <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-100">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <ChevronLeft size={16} /> Prev
              </button>
              <div className="text-sm text-gray-500">Page 1 of 5</div>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Next <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>

      {/* --- RIGHT COLUMN: COMPOSE NEW (30-35%) --- */}
      <div className="w-full xl:w-96 flex flex-col gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Send className="w-5 h-5 text-emerald-500" /> 
            Compose Notification
          </h2>

          <form className="flex flex-col gap-5">
            
            {/* Target Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Audience</label>
              <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none">
                  <option>All Users (Broadcast)</option>
                  <option>All Sellers</option>
                  <option>All Buyers</option>
                  <option>Specific User ID...</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            {/* Notification Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {['Info', 'Promo', 'Alert'].map(t => (
                  <button type="button" key={t} className="border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-lg py-2 text-xs font-medium transition-all text-gray-600">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Inputs */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
              <input type="text" placeholder="e.g., Special Holiday Offer!" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message Body</label>
              <textarea rows={4} placeholder="Type your message here..." className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" />
            </div>

            {/* Reference/Action Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link Action (Optional)</label>
              <div className="flex gap-2">
                <select className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm w-1/3 outline-none text-gray-700">
                  <option>None</option>
                  <option>Vehicle</option>
                  <option>Posting</option>
                </select>
                <input type="text" placeholder="Object ID" className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
              </div>
            </div>

            {/* Preview Box */}
            <div className="mt-1 bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <p className="text-[10px] uppercase text-gray-400 mb-3 font-bold tracking-wider">Mobile Preview</p>
              <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Special Holiday Offer!</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">Get 50% off on all listing fees during the holiday season...</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button type="button" className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 font-medium transition-colors">Save Draft</button>
              <button type="button" className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200 transition-colors">Send Now</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};