'use client'

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, 
  ChevronLeft, ChevronRight, 
  User, Eye, MapPin, Tag, BarChart2,
  Trash2, Pencil, ExternalLink,
  Phone, Mail, Calendar, X 
} from 'lucide-react';
import { apiClient } from '@/app/utils/api'; 
// --- 1. IMPORT COMPONENT PAGINATION CỦA BẠN VÀO ĐÂY ---
import Pagination from '@/components/admin/AdminPagination';

export default function PostManagementPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE QUẢN LÝ MODAL & FORM ĐỔI TRẠNG THÁI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>(""); 
  
  const [formData, setFormData] = useState({
    status: 'active'
  });

  // --- 2. THÊM STATE CHO SEARCH, FILTER VÀ PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseUrl}/admin/postings`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load posts.');
      }

      setPosts(Array.isArray(data) ? data : data.data || []);
      setCurrentPage(1); // Đặt lại trang 1 khi lấy dữ liệu mới
      
    } catch (err: any) {
      console.error("Fetch posts error:", err);
      setError(err.message || "An error occurred while loading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseUrl}/admin/postings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      fetchPosts(); 
    } catch (err: any) {
      console.error("Error deleting post:", err);
      alert("Error deleting: " + err.message);
    }
  };

  const handleEditClick = (post: any) => {
    setEditingId(post._id);
    setEditingTitle(post.title || 'Untitled Post');
    setFormData({
      status: post.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setEditingTitle("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseUrl}/admin/postings/${editingId}/status`, {
        method: 'PATCH', 
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: formData.status })
      });

      const responseData = await response.json();

      if (!response.ok) {
          throw new Error(responseData.message || 'Error updating status');
      }

      handleCloseModal();
      fetchPosts(); 
    } catch (err: any) {
      console.error("Error saving status:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. HANDLER TÌM KIẾM VÀ LỌC ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  // --- 4. LOGIC LỌC BÀI ĐĂNG (SEARCH & FILTER) ---
  const filteredPosts = posts.filter((post) => {
    // Lấy thông tin an toàn
    const postTitle = post.title?.toLowerCase() || '';
    const ownerEmail = post.ownerId?.email?.toLowerCase() || '';
    const postLocation = `${post.locationDistrict?.toLowerCase()} ${post.locationCity?.toLowerCase()}`;
    
    const searchLower = searchTerm.toLowerCase();

    // Check xem từ khóa có nằm trong Tiêu đề, Email hoặc Vị trí không
    const matchesSearch = 
      postTitle.includes(searchLower) ||
      ownerEmail.includes(searchLower) ||
      postLocation.includes(searchLower);

    // Lọc theo trạng thái
    const matchesStatus = filterStatus === "all" || post.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // --- 5. LOGIC PHÂN TRANG (PAGINATION) ---
  const indexOfLastPost = currentPage * itemsPerPage;
  const indexOfFirstPost = indexOfLastPost - itemsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            
            {/* Filter Toolbar */}
            <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
                
                {/* --- SELECT LỌC STATUS VỚI 3 TRẠNG THÁI --- */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={filterStatus}
                    onChange={handleFilterChange}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                
                {/* --- Ô TÌM KIẾM --- */}
                <div className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by Post Title, Owner Email or Location..." 
                        className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    {searchTerm && (
                      <button 
                        onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500 font-medium">Loading posts...</div>
            ) : error ? (
                <div className="py-20 text-center text-rose-500 font-medium">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left rounded-xl">
                        <thead className="bg-[#EBF7F1] border-b border-emerald-100/50">
                            <tr>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-tl-lg whitespace-nowrap">Post Info</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Seller</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Pricing & Location</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Stats</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center whitespace-nowrap">Status</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center rounded-tr-lg whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentPosts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                      {searchTerm || filterStatus !== 'all' 
                                        ? "No posts match your filters." 
                                        : "No posts found."}
                                    </td>
                                </tr>
                            ) : (
                                currentPosts.map((post) => {
                                    const vehicle = post.vehicleId || {};
                                    const owner = post.ownerId || {};
                                    
                                    const primaryImage = vehicle.images && vehicle.images.length > 0 
                                        ? vehicle.images[0] 
                                        : 'https://via.placeholder.com/150x100?text=No+Image';

                                    const phoneDisplay = (owner.phoneNumber && owner.phoneNumber !== 'false') 
                                        ? owner.phoneNumber 
                                        : 'N/A';

                                    return (
                                        <tr key={post._id} className="hover:bg-gray-50/80 transition-colors group">
                                            
                                            {/* Post Info Column */}
                                            <td className="py-4 px-5 align-middle min-w-[280px] max-w-[320px]">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative shadow-sm">
                                                        <img src={primaryImage} alt="Car" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-slate-800 truncate" title={post.title}>
                                                            {post.title || "No Title"}
                                                        </span>
                                                        <span className="text-xs text-emerald-600 font-medium mt-0.5 truncate">
                                                            {vehicle.make} {vehicle.model}
                                                        </span>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                                {vehicle.yearOfManufacture || "N/A"}
                                                            </span>
                                                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-medium capitalize">
                                                                {vehicle.condition || "N/A"}
                                                            </span>
                                                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                                                {vehicle.mileage ? `${vehicle.mileage.toLocaleString('en-US')} km` : "0 km"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* Seller Column */}
                                            <td className="py-4 px-5 align-middle min-w-[200px]">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <User size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="font-semibold capitalize truncate">
                                                            {owner.firstName} {owner.lastName}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Mail size={14} className="text-gray-400 flex-shrink-0" /> 
                                                        <span className="truncate" title={owner.email}>
                                                            {owner.email || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Phone size={14} className="text-gray-400 flex-shrink-0" /> 
                                                        <span className="truncate">
                                                            {phoneDisplay}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Pricing & Location Column */}
                                            <td className="py-4 px-5 align-middle min-w-[180px]">
                                                <div className="flex flex-col gap-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <Tag size={14} className="text-emerald-500 flex-shrink-0" />
                                                        <span className="font-bold text-emerald-700 text-sm">
                                                            {post.price?.toLocaleString('en-US')} {post.currency || 'VND'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                                                        <span className="truncate" title={`${post.locationDistrict}, ${post.locationCity}`}>
                                                            {post.locationDistrict}, {post.locationCity}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Stats Column */}
                                            <td className="py-4 px-5 align-middle whitespace-nowrap">
                                                <div className="flex flex-col gap-2.5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-700">
                                                        <BarChart2 size={14} className="text-blue-500 flex-shrink-0" />
                                                        <span className="font-medium">{post.viewCount || 0} views</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <Calendar size={14} className="text-gray-300 flex-shrink-0" />
                                                        <span>{formatDate(post.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Column - CẬP NHẬT 3 TRẠNG THÁI */}
                                            <td className="py-4 px-5 align-middle text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                                    post.status === 'sold' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                                    post.status === 'reserved' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    post.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    'bg-gray-50 text-gray-600 border-gray-200' // fallback
                                                }`}>
                                                    {post.status || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Admin Action Column */}
                                            <td className="py-4 px-5 align-middle whitespace-nowrap">
                                                <div className="flex justify-center gap-2 text-gray-400">
                                                    
                                                    <button 
                                                        className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors" 
                                                        title="Update Status"
                                                        onClick={() => handleEditClick(post)}
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    
                                                    <button 
                                                        className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors" 
                                                        title="Delete Post"
                                                        onClick={() => handleDeleteClick(post._id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* --- 6. SỬ DỤNG COMPONENT PAGINATION --- */}
            <Pagination 
                currentPage={currentPage}
                totalItems={filteredPosts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>

        {/* --- MODAL ĐỔI TRẠNG THÁI --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                    <div className="bg-white border-b border-gray-100 p-5 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-emerald-900">Update Status</h2>
                        <button onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        
                        {/* Hiển thị tóm tắt xe đang sửa */}
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Post:</span>
                            <span className="text-sm font-semibold text-slate-800">{editingTitle}</span>
                        </div>

                        {/* --- SELECT CẬP NHẬT STATUS VỚI 3 TRẠNG THÁI --- */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Select new status</label>
                            <select 
                                name="status" value={formData.status} onChange={handleInputChange} 
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all bg-white"
                            >
                                <option value="active">Active</option>
                                <option value="reserved">Reserved</option>
                                <option value="sold">Sold</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm shadow-emerald-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSubmitting ? 'Saving...' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}