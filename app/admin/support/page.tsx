'use client'

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MessageSquare, CheckCircle, 
  Clock, AlertCircle, Pencil, X 
} from 'lucide-react';
import { apiClient } from '@/app/utils/api';
// --- 1. IMPORT COMPONENT PAGINATION VÀO ĐÂY ---
import Pagination from '@/components/admin/AdminPagination';

// --- HELPER FUNCTIONS ---
const formatDate = (isoString: string) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

const capitalize = (str: string) => {
  if (!str) return '';
  const formattedStr = str.replace('_', ' ').replace('-', ' ');
  return formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // --- 2. STATE QUẢN LÝ SEARCH, FILTER VÀ PHÂN TRANG ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- STATE MODAL REPLY ---
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // --- STATE MODAL EDIT STATUS ---
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState("open");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      };
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const [supportRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/admin/support`, { method: 'GET', headers }),
        fetch(`${baseUrl}/admin/users`, { method: 'GET', headers })
      ]);

      const [supportData, usersData] = await Promise.all([
        supportRes.json(),
        usersRes.json()
      ]);

      if (!supportRes.ok) throw new Error(supportData.message || 'Failed to load support list');

      const ticketsList = Array.isArray(supportData) ? supportData : supportData.data || [];
      const usersList = Array.isArray(usersData) ? usersData : usersData.data || [];

      const mappedUsers: Record<string, any> = {};
      usersList.forEach((user: any) => {
          mappedUsers[user._id] = user;
      });

      setTickets(ticketsList);
      setUserMap(mappedUsers);
      setCurrentPage(1); // Reset trang khi có dữ liệu mới
      
    } catch (err: any) {
      console.error("Fetch data error:", err);
      setError("Unable to load support data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLER: CHUYỂN SEARCH VÀ FILTER ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  // --- HANDLER: REPLY ---
  const openReplyModal = (id: string) => {
    setReplyingTicketId(id);
    setReplyMessage("");
    setIsReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTicketId || !replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${baseUrl}/admin/support/${replyingTicketId}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: replyMessage })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reply');
      }

      setIsReplyModalOpen(false);
      setTickets(prev => prev.map(t => 
        t._id === replyingTicketId ? { ...t, status: 'in_process' } : t
      ));
      alert("Reply sent successfully!");

    } catch (err: any) {
      console.error("Reply error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsReplying(false);
    }
  };

  // --- HANDLER: EDIT STATUS ---
  const openStatusModal = (id: string, currentStatus: string) => {
    setEditingTicketId(id);
    setEditStatus(currentStatus);
    setIsStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicketId) return;

    setIsUpdatingStatus(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

      const response = await fetch(`${baseUrl}/admin/support/${editingTicketId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: editStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      setIsStatusModalOpen(false);
      setTickets(prev => prev.map(t => 
        t._id === editingTicketId ? { ...t, status: editStatus } : t
      ));

    } catch (err: any) {
      console.error("Status update error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- 3. LOGIC LỌC DỮ LIỆU ---
  const filteredTickets = tickets.filter(ticket => {
    // Tìm kiếm (Text)
    const query = searchQuery.toLowerCase();
    const titleMatch = ticket.title?.toLowerCase().includes(query) || false;
    const codeMatch = ticket.ticketCode?.toLowerCase().includes(query) || false;
    const user = userMap[ticket.customerId] || {};
    const emailMatch = user.email?.toLowerCase().includes(query) || false;
    
    const matchesSearch = !searchQuery || titleMatch || codeMatch || emailMatch;

    // Lọc theo Trạng thái (Status)
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // --- 4. LOGIC PHÂN TRANG ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            
            {/* Filter Toolbar */}
            <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
                
                {/* --- SELECT BỘ LỌC STATUS --- */}
                <div className="relative w-full xl:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="w-full xl:w-auto pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_process">In Process</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                {/* --- Ô TÌM KIẾM --- */}
                <div className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        placeholder="Search by Ticket ID, Subject or Email..." 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    {searchQuery && (
                      <button 
                        onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500 font-medium">Loading support data...</div>
            ) : error ? (
                <div className="py-20 text-center text-rose-500 font-medium">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left rounded-xl">
                        <thead className="bg-[#EBF7F1] border-b border-emerald-100/50">
                            <tr>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-tl-lg whitespace-nowrap">Ticket Details</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Customer</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center whitespace-nowrap">Priority</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center whitespace-nowrap">Status</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Last Updated</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center rounded-tr-lg whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* --- ĐỔI SANG MAP TRÊN currentTickets --- */}
                            {currentTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                      {searchQuery || filterStatus !== 'all' 
                                        ? "No tickets match your filters." 
                                        : "No tickets found."}
                                    </td>
                                </tr>
                            ) : (
                                currentTickets.map((t) => {
                                    const user = userMap[t.customerId] || {};
                                    const fullName = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown User';
                                    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

                                    return (
                                        <tr key={t._id} className="hover:bg-gray-50/80 transition-colors group">
                                            
                                            {/* Ticket Info */}
                                            <td className="py-4 px-5 align-middle max-w-[250px]">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-bold text-slate-800 truncate" title={t.title}>
                                                        {t.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[11px] font-mono text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                                            {t.ticketCode}
                                                        </span>
                                                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                                                            {t.category}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Customer Info */}
                                            <td className="py-4 px-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <img src={avatar} alt="User" className="w-9 h-9 rounded-full border border-gray-200 object-cover flex-shrink-0" />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold text-gray-700 capitalize truncate">
                                                            {fullName}
                                                        </span>
                                                        <span className="text-[11px] text-gray-500 truncate" title={user.email}>
                                                            {user.email || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Priority */}
                                            <td className="py-4 px-5 align-middle text-center whitespace-nowrap">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                                                    t.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                                    t.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                                }`}>
                                                    {t.priority}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-5 align-middle text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    t.status === 'open' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                                    t.status === 'resolved' || t.status === 'closed' ? 'bg-gray-50 text-gray-600 border-gray-200' : 
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                    {t.status === 'open' && <AlertCircle size={12} />}
                                                    {t.status === 'resolved' && <CheckCircle size={12} />}
                                                    {(t.status === 'in-progress' || t.status === 'in_process') && <Clock size={12} />}
                                                    {capitalize(t.status)}
                                                </span>
                                            </td>

                                            {/* Date */}
                                            <td className="py-4 px-5 align-middle text-xs text-gray-500 whitespace-nowrap">
                                                {formatDate(t.updatedAt || t.createdAt)}
                                            </td>

                                            {/* Action Đồng bộ */}
                                            <td className="py-4 px-5 align-middle whitespace-nowrap">
                                                <div className="flex justify-center gap-2 text-gray-400">
                                                    <button 
                                                        onClick={() => openReplyModal(t._id)}
                                                        className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors" 
                                                        title="Reply to Ticket"
                                                    >
                                                        <MessageSquare size={18} /> 
                                                    </button>

                                                    <button 
                                                        onClick={() => openStatusModal(t._id, t.status)}
                                                        className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors" 
                                                        title="Update Status"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- 5. GỌI COMPONENT PAGINATION CHUẨN --- */}
            {!loading && !error && (
              <Pagination 
                currentPage={currentPage} 
                totalItems={filteredTickets.length} 
                itemsPerPage={itemsPerPage}           
                onPageChange={(page) => setCurrentPage(page)} 
              />
            )}
        </div>

        {/* --- MODAL TRẢ LỜI TICKET --- */}
        {isReplyModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="bg-white border-b border-gray-100 p-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-emerald-900">Reply to Customer</h2>
                        <button onClick={() => setIsReplyModalOpen(false)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleReplySubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Reply Message</label>
                            <textarea 
                                required 
                                rows={5}
                                value={replyMessage} 
                                onChange={(e) => setReplyMessage(e.target.value)} 
                                placeholder="Enter your reply message here..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none" 
                            />
                            <p className="text-[11px] text-gray-400 mt-2">* The ticket status will automatically change to "In Process" after replying.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsReplyModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isReplying} className="px-5 py-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-sm shadow-blue-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isReplying ? 'Sending...' : 'Send Reply'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- MODAL CHỈNH SỬA TRẠNG THÁI --- */}
        {isStatusModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                    <div className="bg-white border-b border-gray-100 p-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-emerald-900">Update Status</h2>
                        <button onClick={() => setIsStatusModalOpen(false)} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleStatusSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">New Status</label>
                            <select 
                                value={editStatus} 
                                onChange={(e) => setEditStatus(e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all bg-white"
                            >
                                <option value="open">Open</option>
                                <option value="in_process">In Process</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={() => setIsStatusModalOpen(false)} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isUpdatingStatus} className="px-5 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm shadow-emerald-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isUpdatingStatus ? 'Saving...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}