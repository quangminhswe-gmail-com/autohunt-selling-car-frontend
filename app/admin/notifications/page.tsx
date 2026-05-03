'use client'

import React, { useState, useEffect } from 'react';
import { 
  Bell, Send, Users, CheckCircle, Clock, Search, 
  Filter, ChevronRight, Trash2, Loader
} from 'lucide-react';
import { apiClient } from '@/app/utils/api';
import AdminPagination from '@/components/admin/AdminPagination';

interface Notification {
  _id: string;
  title: string;
  message: string;
  targetRole: 'all' | 'customer';
  targetUserId?: {
    _id: string;
    email: string;
  } | null;
  createdBy: string;
  isSent: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationFormData {
  targetRole: 'all' | 'customer';
  targetEmail: string;
  title: string;
  message: string;
}

export default function NotificationPage() {
  const [history, setHistory] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState<NotificationFormData>({
    targetRole: 'all',
    targetEmail: '',
    title: '',
    message: '',
  });

  // Fetch notification logs
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient<Notification[]>('/admin/notifications/logs', {
          method: 'GET',
        });
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch notifications';
        setError(message);
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Handle form submission
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      setError('Title and message are required');
      return;
    }

    if (formData.targetRole === 'customer' && !formData.targetEmail.trim()) {
      setError('Target Email is required for customer notifications');
      return;
    }

    try {
      setSending(true);
      setError(null);

      const payload: {
        targetRole: Notification['targetRole'];
        title: string;
        message: string;
        targetEmail?: string;
      } = {
        targetRole: formData.targetRole,
        title: formData.title,
        message: formData.message,
      };

      if (formData.targetRole === 'customer' && formData.targetEmail.trim()) {
        payload.targetEmail = formData.targetEmail.trim();
      }

      const response = await apiClient<Notification>('/admin/notifications', {
        method: 'POST',
        body: payload,
      });

      // Add new notification to history.
      // If the backend did not populate targetUserId, use the entered email immediately.
      if (response) {
        const newNotification = {
          ...response,
          targetUserId:
            response.targetRole === 'customer' && !response.targetUserId
              ? { _id: '', email: formData.targetEmail.trim() }
              : response.targetUserId,
        } as Notification;

        setHistory((prev) => [newNotification, ...prev]);
      }

      // Reset form
      setFormData({
        targetRole: 'all',
        targetEmail: '',
        title: '',
        message: '',
      });

      // Show success message (optional toast)
      console.log('Notification sent successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send notification';
      setError(message);
      console.error('Error sending notification:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await apiClient(`/admin/notifications/${id}`, {
        method: 'DELETE',
      });

      // Remove from history
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(message);
      console.error('Error deleting notification:', err);
    }
  };

  // Filter history
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.message.toLowerCase().includes(searchTerm.toLowerCase());
    const itemStatus = item.isSent ? 'Sent' : 'Pending';
    const matchesStatus = statusFilter === 'All' || itemStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 flex flex-col xl:flex-row gap-6">
      {/* --- LEFT COLUMN: HISTORY LIST (65-70%) --- */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex gap-2 w-full xl:w-auto">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer flex-1"
              >
                <option>All</option>
                <option>Sent</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-emerald-500 animate-spin" />
              <span className="ml-2 text-gray-600">Loading notifications...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left rounded-xl">
                <thead className="bg-[#EBF7F1]">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md">Detail</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Target</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Email</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Stats</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center">Status</th>
                    <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center rounded-r-md">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No notifications found
                      </td>
                    </tr>
                  ) : (
                    paginatedHistory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                        <td className="p-4">
                          <p className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">{item.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4 text-gray-400" />
                            {item.targetRole === 'all' ? 'All Users' : 'Customers'}
                          </div>
                        </td>
                        <td className="p-4">
                          {item.targetRole === 'customer' && item.targetUserId ? (
                            <span className="text-sm text-gray-600">{item.targetUserId.email}</span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">{item.message.substring(0, 40)}...</span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            {item.isSent ? 
                              <CheckCircle className="w-5 h-5 text-emerald-500" /> : 
                              <Clock className="w-5 h-5 text-amber-500" />
                            }
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleDeleteNotification(item._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

           {/* Pagination */}
           <AdminPagination 
             currentPage={currentPage} 
             totalItems={filteredHistory.length} 
             itemsPerPage={itemsPerPage} 
             onPageChange={setCurrentPage} 
           />
        </div>
      </div>

      {/* --- RIGHT COLUMN: COMPOSE NEW (30-35%) --- */}
      <div className="w-full xl:w-96 flex flex-col gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Send className="w-5 h-5 text-emerald-500" /> 
            Compose Notification
          </h2>

          <form onSubmit={handleSendNotification} className="flex flex-col gap-5">
            
            {/* Target Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Role</label>
              <div className="relative">
                <select 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({...formData, targetRole: e.target.value as NotificationFormData['targetRole']})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="all">All Users</option>
                  <option value="customer">Customers</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            {formData.targetRole === 'customer' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Email</label>
                <input
                  type="email"
                  value={formData.targetEmail}
                  onChange={(e) => setFormData({...formData, targetEmail: e.target.value})}
                  placeholder="Example: user@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            )}

            {/* Content Inputs */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Special Holiday Offer!" 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50" 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Message Body</label>
              <textarea 
                rows={4} 
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Type your message here..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none" 
              />
            </div>

            {/* Preview Box */}
            <div className="mt-1 bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <p className="text-[10px] uppercase text-gray-400 mb-3 font-bold tracking-wider">Mobile Preview</p>
              <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{formData.title || 'Special Holiday Offer!'}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{formData.message || 'Get 50% off on all listing fees during the holiday season...'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button 
                type="button" 
                onClick={() => setFormData({
                  targetRole: 'all',
                  targetEmail: '',
                  title: '',
                  message: '',
                })}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 font-medium transition-colors"
              >
                Clear Draft
              </button>
              <button 
                type="submit" 
                disabled={sending}
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-bold shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Now'
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};