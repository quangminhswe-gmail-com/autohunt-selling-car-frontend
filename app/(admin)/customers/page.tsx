'use client'

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, UserCheck, UserX, 
  Mail, Phone, Trash2, Lock, Unlock, X 
} from 'lucide-react';
import { apiClient } from '@/app/utils/api'; 
import Pagination from '@/components/admin/AdminPagination';

export default function CustomerManagementPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- STATE FOR SEARCH, FILTER, AND PAGINATION ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/admin/users');
      let usersList = Array.isArray(data) ? data : data.data || [];
      
      usersList = usersList.filter((user: any) => user.isDelete !== true);
      setCustomers(usersList);
      setCurrentPage(1); // Reset to page 1 when fetching new data
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load the customer list.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentIsActive: boolean) => {
    const isCurrentlyBlocked = !currentIsActive; 
    const endpoint = isCurrentlyBlocked 
      ? `/admin/users/${userId}/reactive` 
      : `/admin/users/${userId}/suspend`;

    if (!window.confirm(`Are you sure you want to ${isCurrentlyBlocked ? 'unblock' : 'block'} this user?`)) return;

    try {
      await apiClient(endpoint, { method: 'PATCH' });
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => {
          const cId = customer._id || customer.id;
          if (cId === userId) return { ...customer, isActive: !currentIsActive };
          return customer;
        })
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("An error occurred while updating the status.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      await apiClient(`/admin/users/${userId}`, { method: 'DELETE' });
      setCustomers(prevCustomers => 
        prevCustomers.filter(customer => {
           const cId = customer._id || customer.id;
           return cId !== userId;
        })
      );
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("An error occurred while deleting the user.");
    }
  };

  // --- HANDLERS FOR SEARCH AND FILTER ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };
  
  // --- DATA FILTERING LOGIC ---
  const filteredCustomers = customers.filter(customer => {
    // 1. Filter by text (Search)
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const phone = (customer.phoneNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = !searchQuery || fullName.includes(query) || email.includes(query) || phone.includes(query);

    // 2. Filter by status
    const currentIsActive = customer.isActive !== false; 
    let matchesFilter = true;
    if (filterStatus === 'active') matchesFilter = currentIsActive;
    if (filterStatus === 'blocked') matchesFilter = !currentIsActive;

    return matchesSearch && matchesFilter;
  });

  // --- PAGINATION LOGIC ---
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDisplayedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            
            {/* Synchronized Filter Toolbar */}
            <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
                
                {/* --- STATUS FILTER SELECT --- */}
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
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                {/* --- SEARCH INPUT --- */}
                <div className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        placeholder="Search by Name, Email or Phone Number..." 
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
                <div className="py-20 text-center text-gray-500 font-medium">Loading data...</div>
            ) : error ? (
                <div className="py-20 text-center text-rose-500 font-medium">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-center rounded-xl min-w-[800px]"> 
                        <thead className="bg-[#EBF7F1] border-b border-emerald-100/50">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-tl-lg text-left pl-6 whitespace-nowrap">ID</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-left whitespace-nowrap">Name</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-left whitespace-nowrap">Contact Info</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Role</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-tr-lg whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentDisplayedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        {searchQuery || filterStatus !== 'all' 
                                            ? "No customers found matching the criteria." 
                                            : "No customers available."}
                                    </td>
                                </tr>
                            ) : (
                                currentDisplayedCustomers.map((customer, index) => {
                                    const fullName = `${customer.firstName || 'User'} ${customer.lastName || ''}`.trim();
                                    const cId = customer._id || customer.id || `CUS-${index}`;
                                    const currentIsActive = customer.isActive !== false; 
                                    const isBlocked = !currentIsActive;
                                    
                                    return (
                                        <tr key={cId} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="p-4 text-left pl-6 whitespace-nowrap align-middle">
                                                <span className="text-sm font-mono font-medium text-gray-500" title={cId}>#{cId.slice(-6).toUpperCase()}</span>
                                            </td>
                                            <td className="p-4 text-left whitespace-nowrap align-middle">
                                                <div className="flex items-center gap-3">
                                                    <img src={customer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`} alt="User" className="w-9 h-9 rounded-full border border-gray-200 object-cover flex-shrink-0 shadow-sm" />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-800 capitalize">{fullName}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-left whitespace-nowrap align-middle">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Mail size={12} className="text-gray-400 flex-shrink-0" /> 
                                                        <span className="truncate" title={customer.email}>{customer.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Phone size={12} className="text-gray-400 flex-shrink-0" /> 
                                                        <span>{customer.phoneNumber || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 whitespace-nowrap align-middle">
                                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] uppercase font-bold text-gray-500 bg-gray-100 border border-gray-200">
                                                    {customer.role || 'customer'}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap align-middle">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border
                                                    ${isBlocked 
                                                        ? 'bg-rose-50 text-rose-600 border-rose-200' 
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                                    }`}
                                                >
                                                    {isBlocked ? (
                                                    <>
                                                        <UserX size={12} />
                                                        Blocked
                                                    </>
                                                    ) : (
                                                    <>
                                                        <UserCheck size={12} />
                                                        Active
                                                    </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap align-middle">
                                                <div className="flex justify-center gap-2 text-gray-400">
                                                    <button onClick={() => handleToggleBlock(cId, currentIsActive)} className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-md transition-colors" title={isBlocked ? "Unblock User" : "Block User"}>
                                                        {isBlocked ? <Unlock size={18} /> : <Lock size={18} />}
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(cId)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors" title="Delete User">
                                                        <Trash2 size={18} />
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

            {/* Call Synchronized Pagination Component */}
            {!loading && !error && (
              <Pagination 
                currentPage={currentPage} 
                totalItems={filteredCustomers.length} 
                itemsPerPage={itemsPerPage}           
                onPageChange={(page) => setCurrentPage(page)} 
              />
            )}

        </div>
    </div>
  );
}