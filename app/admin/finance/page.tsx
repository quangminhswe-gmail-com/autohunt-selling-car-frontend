'use client'

import React from 'react';
import { 
  Plus, Search, Filter, Download, 
  ArrowUpCircle, ArrowDownCircle, Wallet, 
  MoreHorizontal, Trash2, Pencil, TrendingUp 
} from 'lucide-react';

// --- MOCK DATA FOR CHART ---
// Dữ liệu giả lập thực tế hơn để vẽ biểu đồ đẹp hơn
const chartData = [
  { month: 'Jan', rev: 65, exp: 40, revVal: '$65k', expVal: '$40k' },
  { month: 'Feb', rev: 55, exp: 35, revVal: '$55k', expVal: '$35k' },
  { month: 'Mar', rev: 75, exp: 50, revVal: '$75k', expVal: '$50k' },
  { month: 'Apr', rev: 80, exp: 45, revVal: '$80k', expVal: '$45k' },
  { month: 'May', rev: 95, exp: 60, revVal: '$95k', expVal: '$60k' },
  { month: 'Jun', rev: 85, exp: 55, revVal: '$85k', expVal: '$55k' },
  { month: 'Jul', rev: 70, exp: 45, revVal: '$70k', expVal: '$45k' },
  { month: 'Aug', rev: 60, exp: 40, revVal: '$60k', expVal: '$40k' },
  { month: 'Sep', rev: 75, exp: 50, revVal: '$75k', expVal: '$50k' },
  { month: 'Oct', rev: 90, exp: 65, revVal: '$90k', expVal: '$65k' },
  { month: 'Nov', rev: 85, exp: 55, revVal: '$85k', expVal: '$55k' },
  { month: 'Dec', rev: 100, exp: 70, revVal: '$100k', expVal: '$70k' },
];

// --- MOCK DATA FOR TABLE ---
const financeRecords = [
  { id: 1, title: 'Sold BMW i8 - Order #ORD001', type: 'Revenue', date: 'Feb 02, 2026', amount: 45000 },
  { id: 2, title: 'Office Rent - February', type: 'Expense', date: 'Feb 01, 2026', amount: 2000 },
  { id: 3, title: 'Listing Fee - User #992', type: 'Revenue', date: 'Jan 28, 2026', amount: 500 },
  { id: 4, title: 'Server Hosting (AWS)', type: 'Expense', date: 'Jan 25, 2026', amount: 150 },
  { id: 5, title: 'Sold Ford Ranger - Order #ORD002', type: 'Revenue', date: 'Jan 20, 2026', amount: 22000 },
  { id: 6, title: 'Facebook Ads Campaign', type: 'Expense', date: 'Jan 15, 2026', amount: 1200 },
  { id: 7, title: 'Staff Salary - Jan', type: 'Expense', date: 'Jan 10, 2026', amount: 5000 },
];

export default function FinancialPage() {
  
  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Financial Management</h1>
                <p className="text-sm text-gray-500 mt-1">Revenue & Expense tracking for graduation project.</p>
            </div>
            
            <div className="flex">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all shadow-emerald-200">
                    <Plus size={18} /> Add Record
                </button>
            </div>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-emerald-600">$67,500</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ArrowUpCircle size={28} />
                </div>
            </div>

            {/* Total Expenses */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group hover:border-rose-300 transition-all">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Expenses</p>
                    <h3 className="text-3xl font-bold text-rose-600">$8,350</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                    <ArrowDownCircle size={28} />
                </div>
            </div>

            {/* Current Balance */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 rounded-xl shadow-md shadow-emerald-200 flex items-center justify-between text-white relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Profit Balance</p>
                    <h3 className="text-3xl font-bold">$59,150</h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm z-10">
                    <Wallet size={28} />
                </div>
                 {/* Decorative Icon BG */}
                <TrendingUp size={100} className="absolute -bottom-4 -right-4 text-white/10 z-0" />
            </div>
        </div>

        {/* --- IMPROVED CHART SECTION (CSS Only) --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <h3 className="font-bold text-lg text-slate-800">Financial Performance</h3>
                    <p className="text-sm text-gray-500">Revenue vs Expense Comparison (2025)</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-emerald-500 to-emerald-400"></span> Revenue
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                        <span className="w-3 h-3 rounded-sm bg-gradient-to-tr from-rose-500 to-rose-400"></span> Expense
                    </div>
                </div>
            </div>

            {/* Background Grid Lines (Fake y-axis) */}
            <div className="absolute inset-0 top-20 px-6 pointer-events-none z-0 flex flex-col justify-between text-xs text-gray-300 font-medium pb-12">
                <div className="border-b border-gray-100 h-0 w-full"><span>100%</span></div>
                <div className="border-b border-gray-100 h-0 w-full"><span>75%</span></div>
                <div className="border-b border-gray-100 h-0 w-full"><span>50%</span></div>
                <div className="border-b border-gray-100 h-0 w-full"><span>25%</span></div>
                <div className="border-b border-gray-100 h-0 w-full"><span>0%</span></div>
            </div>

            {/* The Chart Bars */}
            <div className="flex items-end justify-between h-64 gap-3 relative z-10 pt-4">
                {chartData.map((data, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full group">
                        
                        <div className="flex gap-1 items-end justify-center h-full relative">
                            
                            {/* Revenue Bar (Green) */}
                            <div className="relative flex flex-col justify-end h-full w-3 sm:w-5 group/bar">
                                {/* Tooltip Value */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-sm">
                                    {data.revVal}
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-600"></div>
                                </div>
                                {/* The Bar itself */}
                                <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 transition-all duration-300 shadow-sm" style={{ height: `${data.rev}%` }}></div>
                            </div>

                             {/* Expense Bar (Red) */}
                             <div className="relative flex flex-col justify-end h-full w-3 sm:w-5 group/bar">
                                 {/* Tooltip Value */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20 shadow-sm">
                                    {data.expVal}
                                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-rose-500"></div>
                                </div>
                                {/* The Bar itself */}
                                <div className="w-full rounded-t-md bg-gradient-to-t from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 transition-all duration-300 shadow-sm" style={{ height: `${data.exp}%` }}></div>
                            </div>

                        </div>
                        
                        {/* Month Label */}
                        <p className="text-[11px] text-center text-gray-500 font-medium mt-3 uppercase tracking-wider">
                            {data.month}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* --- TRANSACTION TABLE (Simplified) --- */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-center rounded-xl">
                    <thead className="bg-[#EBF7F1]">
                        <tr>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md text-left pl-6">Description</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Type</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Date</th>
                            <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {financeRecords.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-left pl-6">
                                    <span className="text-sm font-bold text-slate-700">{item.title}</span>
                                </td>
                                
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                        item.type === 'Revenue' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-rose-100 text-rose-700'
                                    }`}>
                                        {item.type === 'Revenue' ? <ArrowUpCircle size={14} className="mr-1" /> : <ArrowDownCircle size={14} className="mr-1" />}
                                        {item.type}
                                    </span>
                                </td>

                                <td className="p-4 text-sm text-gray-500">{item.date}</td>
                                
                                <td className={`p-4 text-sm font-bold text-right ${item.type === 'Revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {item.type === 'Revenue' ? '+' : '-'}${item.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}