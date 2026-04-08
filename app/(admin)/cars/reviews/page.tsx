'use client'

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Star, 
  Trash2, User, Car, X // --- THÊM X ICON ---
} from 'lucide-react';
// --- 1. IMPORT COMPONENT PAGINATION VÀO ĐÂY ---
import Pagination from '@/components/admin/AdminPagination';

export default function ReviewManagementPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [vehicleMap, setVehicleMap] = useState<Record<string, any>>({}); 
  const [userMap, setUserMap] = useState<Record<string, any>>({}); 
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // --- 2. STATE QUẢN LÝ SEARCH, FILTER VÀ PHÂN TRANG ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [reviewsRes, vehiclesRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/admin/reviews`, { method: 'GET', headers }),
        fetch(`${baseUrl}/admin/vehicle`, { method: 'GET', headers }),
        fetch(`${baseUrl}/admin/users`, { method: 'GET', headers })
      ]);

      const [reviewsData, vehiclesData, usersData] = await Promise.all([
        reviewsRes.json(),
        vehiclesRes.json(),
        usersRes.json()
      ]);

      if (!reviewsRes.ok) {
        throw new Error(reviewsData.message || 'Failed to load reviews.');
      }

      const reviewsList = Array.isArray(reviewsData) ? reviewsData : reviewsData.data || [];
      const vehiclesList = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData.data || [];
      const usersList = Array.isArray(usersData) ? usersData : usersData.data || [];

      const vMap: Record<string, any> = {};
      vehiclesList.forEach((v: any) => {
        vMap[v._id] = v;
      });

      const uMap: Record<string, any> = {};
      usersList.forEach((u: any) => {
        uMap[u._id] = u;
      });

      setReviews(reviewsList);
      setVehicleMap(vMap);
      setUserMap(uMap);
      setCurrentPage(1); // Reset về trang 1 khi có dữ liệu mới
      
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Unable to load reviews data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseUrl}/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      fetchData(); 
    } catch (err: any) {
      console.error("Error deleting review:", err);
      alert("Error: " + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={14} 
            className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  // --- 3. HANDLERS CHO SEARCH VÀ FILTER ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRating(e.target.value);
    setCurrentPage(1);
  };

  // --- 4. LOGIC LỌC DỮ LIỆU ---
  const filteredReviews = reviews.filter(review => {
    // Logic Tìm kiếm
    const query = searchQuery.toLowerCase();
    const fullCustomer = userMap[review.customerId?._id] || review.customerId || {};
    const fullOwner = userMap[review.ownerId?._id] || review.ownerId || {};
    
    const customerEmail = fullCustomer.email?.toLowerCase() || '';
    const ownerEmail = fullOwner.email?.toLowerCase() || '';
    const vehicleName = `${review.vehicleId?.make || ''} ${review.vehicleId?.model || ''}`.toLowerCase();
    
    const matchesSearch = !searchQuery || 
                          customerEmail.includes(query) || 
                          ownerEmail.includes(query) || 
                          vehicleName.includes(query);

    // Logic Lọc theo số sao
    const matchesRating = filterRating === "all" || review.rating?.toString() === filterRating;

    return matchesSearch && matchesRating;
  });

  // --- 5. LOGIC PHÂN TRANG ---
  const indexOfLastReview = currentPage * itemsPerPage;
  const indexOfFirstReview = indexOfLastReview - itemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            
            {/* Filter Toolbar */}
            <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
                
                {/* --- SELECT BỘ LỌC SAO --- */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={filterRating}
                    onChange={handleFilterChange}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                
                {/* --- Ô TÌM KIẾM --- */}
                <div className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        placeholder="Search by Vehicle or Email..." 
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
                <div className="py-20 text-center text-gray-500 font-medium">Loading reviews...</div>
            ) : error ? (
                <div className="py-20 text-center text-rose-500 font-medium">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left rounded-xl">
                        <thead className="bg-[#EBF7F1] border-b border-emerald-100/50">
                            <tr>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-tl-lg whitespace-nowrap">Product / Vehicle</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Customer (Reviewer)</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Seller (Owner)</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Rating & Comment</th>
                                <th className="py-4 px-5 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center rounded-tr-lg whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* --- MAP QUA currentReviews THAY VÌ filteredReviews --- */}
                            {currentReviews.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                      {searchQuery || filterRating !== 'all' 
                                        ? "No reviews match your filters." 
                                        : "No reviews found."}
                                    </td>
                                </tr>
                            ) : (
                                currentReviews.map((review) => {
                                    const baseVehicle = review.vehicleId || {};
                                    const baseCustomer = review.customerId || {};
                                    const baseOwner = review.ownerId || {};

                                    const fullVehicleData = vehicleMap[baseVehicle._id] || baseVehicle;
                                    const vehicleImage = fullVehicleData.images && fullVehicleData.images.length > 0 
                                      ? fullVehicleData.images[0] 
                                      : null;

                                    const fullCustomerData = userMap[baseCustomer._id] || baseCustomer;
                                    const customerName = fullCustomerData.firstName ? `${fullCustomerData.firstName} ${fullCustomerData.lastName || ''}`.trim() : (fullCustomerData.email || 'User');
                                    const customerAvatar = fullCustomerData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=random`;

                                    const fullOwnerData = userMap[baseOwner._id] || baseOwner;
                                    const ownerName = fullOwnerData.firstName ? `${fullOwnerData.firstName} ${fullOwnerData.lastName || ''}`.trim() : (fullOwnerData.email || 'Seller');
                                    const ownerAvatar = fullOwnerData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=random`;

                                    return (
                                        <tr key={review._id} className="hover:bg-gray-50/80 transition-colors group">
                                            
                                            {/* Vehicle Column */}
                                            <td className="py-4 px-5 align-middle min-w-[220px]">
                                                {fullVehicleData.make ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                            {vehicleImage ? (
                                                                <img src={vehicleImage} alt="Car" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Car size={20} />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-slate-800">
                                                                {fullVehicleData.make} {fullVehicleData.model}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-mono">ID: {fullVehicleData._id?.slice(-6).toUpperCase() || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400 italic">No vehicle data</span>
                                                )}
                                            </td>
                                            
                                            {/* Customer (Reviewer) Column */}
                                            <td className="py-4 px-5 align-middle min-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <img src={customerAvatar} alt="Reviewer" className="w-9 h-9 rounded-full border border-gray-200 object-cover flex-shrink-0 shadow-sm" />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium text-gray-700 truncate capitalize" title={customerName}>
                                                            {customerName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 truncate" title={fullCustomerData.email}>
                                                            {fullCustomerData.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Owner (Seller) Column */}
                                            <td className="py-4 px-5 align-middle min-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <img src={ownerAvatar} alt="Seller" className="w-9 h-9 rounded-full border border-gray-200 object-cover flex-shrink-0 shadow-sm" />
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-medium text-gray-700 truncate capitalize" title={ownerName}>
                                                            {ownerName}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 truncate" title={fullOwnerData.email}>
                                                            {fullOwnerData.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Rating & Comment Column */}
                                            <td className="py-4 px-5 align-middle max-w-sm">
                                                <div className="mb-1.5 flex items-center gap-2">
                                                    {renderStars(review.rating || 0)}
                                                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 italic line-clamp-2">
                                                    {review.comment ? `"${review.comment}"` : <span className="text-gray-400">No comment provided.</span>}
                                                </p>
                                            </td>

                                            {/* Action Column */}
                                            <td className="py-4 px-5 align-middle whitespace-nowrap">
                                                <div className="flex justify-center gap-2 text-gray-400">
                                                    <button 
                                                        onClick={() => handleDeleteClick(review._id)}
                                                        className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors" 
                                                        title="Delete Review"
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

            {/* --- 6. SỬ DỤNG COMPONENT PAGINATION CHUẨN --- */}
            {!loading && !error && (
              <Pagination 
                  currentPage={currentPage}
                  totalItems={filteredReviews.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
              />
            )}
        </div>
    </div>
  );
}