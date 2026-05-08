'use client'

import React, { useEffect, useState } from 'react';
import {
  Bell,
  Send,
  Users,
  FileText,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  Tag,
} from 'lucide-react';
import { apiClient } from '@/app/utils/api';
import {
  showErrorNotification,
  showSuccessNotification,
} from '@/utils/notifications';

interface NotificationLog {
  _id: string;
  title: string;
  message: string;
  targetRole: 'all' | 'customer';
  targetUserId?: string | null;
  createdBy?: { fullName?: string; email?: string };
  createdAt: string;
}

export default function NotificationPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [sending, setSending] = useState(false);
  const [targetMode, setTargetMode] = useState<'all' | 'specific'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await apiClient<NotificationLog[]>('/admin/notifications/logs', {
        method: 'GET',
      });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed to load notification logs:', message);
      showErrorNotification('Load failed', 'Cannot fetch notification history.');
      setLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSendNow = async () => {
    if (!title.trim()) {
      showErrorNotification('Validation error', 'Title cannot be empty.');
      return;
    }
    if (!message.trim()) {
      showErrorNotification('Validation error', 'Message cannot be empty.');
      return;
    }
    if (targetMode === 'specific' && !email.trim()) {
      showErrorNotification('Validation error', 'Recipient email cannot be empty.');
      return;
    }

    try {
      setSending(true);
      if (targetMode === 'all') {
        await apiClient('/admin/notifications', {
          method: 'POST',
          body: {
            title,
            message,
            targetRole: 'all',
          },
        });
      } else {
        await apiClient('/admin/notifications/send-by-email', {
          method: 'POST',
          body: {
            title,
            message,
            targetRole: 'customer',
            email,
          },
        });
      }

      showSuccessNotification('Sent successfully', 'Notification has been delivered.');
      setTitle('');
      setMessage('');
      setEmail('');
      setTargetMode('all');
      fetchLogs();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      showErrorNotification('Send failed', message || 'Unable to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 flex flex-col xl:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1 flex flex-col">
          <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 bg-white shadow-sm">
              <Filter size={18} />
            </button>
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
            <div className="flex gap-2 w-full xl:w-auto">
              <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none cursor-pointer flex-1">
                <option>Status: All</option>
                <option>Status: Sent</option>
                <option>Status: Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rounded-xl">
              <thead className="bg-[#EBF7F1]">
                <tr>
                  <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md">
                    Details
                  </th>
                  <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center rounded-r-md">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Loading notification history...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      No notification history available.
                    </td>
                  </tr>
                ) : (
                  logs.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td className="p-4">
                        <p className="font-medium text-gray-800 group-hover:text-emerald-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {item.message}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.targetRole === 'all'
                          ? 'All Users'
                          : item.targetUserId
                          ? `User ID: ${item.targetUserId}`
                          : 'Specific User'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {item.createdBy?.fullName || item.createdBy?.email || 'Admin'}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-4 mt-auto border-t border-gray-100">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} /> Prev
            </button>
            <div className="text-sm text-gray-500">Page 1 of 1</div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-full xl:w-96 flex flex-col gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-3">
            <Send className="w-5 h-5 text-emerald-500" />
            Compose Notification
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Target Audience
              </label>
              <div className="relative">
                <select
                  value={targetMode}
                  onChange={(event) => setTargetMode(event.target.value as 'all' | 'specific')}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none"
                >
                  <option value="all">All Users</option>
                  <option value="specific">Specific User (email)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {targetMode === 'specific' && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Weekend promotion"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Message Body
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Write your notification message..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
              />
            </div>

            <div className="mt-1 bg-gray-50 rounded-lg p-4 border border-gray-200 border-dashed">
              <p className="text-[10px] uppercase text-gray-400 mb-3 font-bold tracking-wider">
                Mobile Preview
              </p>
              <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{title || 'New notification'}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">
                    {message || 'Notification content will display here.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 font-medium transition-colors"
                onClick={() => {
                  setTitle('');
                  setMessage('');
                  setEmail('');
                  setTargetMode('all');
                }}
                disabled={sending}
              >
                Reset
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold shadow-md shadow-emerald-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSendNow}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};