'use client'

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Car, Fuel, 
  Settings, Calendar, Trash2, CheckCircle, 
  AlertCircle, Pencil, X, Upload
} from 'lucide-react';
import { apiClient } from '@/app/utils/api';
// --- 1. IMPORT REACT-SELECT LIBRARY ---
import Select from 'react-select';
// --- IMPORT YOUR PAGINATION COMPONENT HERE ---
import Pagination from '@/components/admin/AdminPagination';

// --- 2. CREATE OPTIONS LIST FROM ENUM FOR REACT-SELECT ---
const VEHICLE_MAKES = [
  'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'BYD',
  'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Dodge', 'Ferrari', 'Fiat', 'Ford',
  'Geely', 'Genesis', 'GMC', 'Great Wall', 'Honda', 'Hyundai', 'Infiniti', 'Isuzu',
  'Jaguar', 'Jeep', 'Kia', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln', 'Lucid',
  'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mitsubishi', 'NIO', 'Nissan',
  'Peugeot', 'Polestar', 'Porsche', 'Ram', 'Renault', 'Rivian', 'Rolls-Royce',
  'Subaru', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
];
const makeOptions = VEHICLE_MAKES.map(make => ({ value: make, label: make }));

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    make: '', model: '', yearOfManufacture: new Date().getFullYear(),
    licensePlate: '', vinNumber: '', color: '', mileage: 0,
    transmission: 'automatic', type: 'hatchback', fuelType: 'hybrid',
    condition: 'new', price: 0, features: ''
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // --- NEW 1: STATE FOR SEARCH AND FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCondition, setFilterCondition] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/admin/vehicle');
      setVehicles(Array.isArray(data) ? data : data.data || []);
      setCurrentPage(1); 
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      setError("Failed to load vehicles. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMakeChange = (selectedOption: any) => {
    setFormData(prev => ({ 
      ...prev, 
      make: selectedOption ? selectedOption.value : '' 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  // --- NEW 2: HANDLERS FOR SEARCH AND FILTER ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when typing search
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterCondition(e.target.value);
    setCurrentPage(1); // Reset to page 1 when changing filter
  };

  const resetForm = () => {
    setFormData({
      make: '', model: '', yearOfManufacture: new Date().getFullYear(),
      licensePlate: '', vinNumber: '', color: '', mileage: 0,
      transmission: 'automatic', type: 'hatchback', fuelType: 'hybrid',
      condition: 'new', price: 0, features: ''
    });
    setImageFiles([]);
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (car: any) => {
    setEditingId(car._id);
    setFormData({
      make: car.make || '',
      model: car.model || '',
      yearOfManufacture: car.yearOfManufacture || new Date().getFullYear(),
      licensePlate: car.licensePlate || '',
      vinNumber: car.vinNumber || '',
      color: car.color || '',
      mileage: car.mileage || 0,
      transmission: car.transmission || 'automatic',
      type: car.type || 'hatchback',
      fuelType: car.fuelType || 'hybrid',
      condition: car.condition || 'new',
      price: car.price || 0,
      features: Array.isArray(car.features) ? car.features.join(', ') : (car.features || '')
    });
    setImageFiles([]); 
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${baseUrl}/admin/vehicle/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      fetchVehicles();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      alert("Error deleting: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.make) {
      alert("Please select a vehicle make!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('make', formData.make);
      data.append('model', formData.model);
      data.append('yearOfManufacture', formData.yearOfManufacture.toString());
      data.append('licensePlate', formData.licensePlate);
      data.append('vinNumber', formData.vinNumber);
      data.append('color', formData.color);
      data.append('mileage', formData.mileage.toString());
      data.append('price', formData.price.toString());
      data.append('transmission', formData.transmission);
      data.append('type', formData.type);
      data.append('fuelType', formData.fuelType);
      data.append('condition', formData.condition);

      const featureArray = formData.features.split(',').map(f => f.trim()).filter(Boolean);
      featureArray.forEach(f => {
        data.append('features[]', f); 
      });

      imageFiles.forEach(file => {
        data.append('images', file); 
      });

      const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || '';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const url = editingId ? `${baseUrl}/admin/vehicle/${editingId}` : `${baseUrl}/vehicle`;
      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const responseData = await response.json();

      if (!response.ok) {
          throw new Error(responseData.message || `Error ${editingId ? 'updating' : 'adding'} vehicle`);
      }

      resetForm();
      fetchVehicles();

    } catch (err: any) {
      console.error("Error saving vehicle:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW 3: FILTER LOGIC BASED ON SEARCH & FILTER ---
  const filteredVehicles = vehicles.filter((car) => {
    // Text search (VIN, Model, Make)
    const matchSearch = 
      car.vinNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by condition
    const matchCondition = filterCondition === "all" || car.condition === filterCondition;

    return matchSearch && matchCondition;
  });

  // --- UPDATE: PAGINATION SLICE FROM FILTERED ARRAY ---
  const indexOfLastVehicle = currentPage * itemsPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - itemsPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);
  
  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 p-6 relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="pb-3 flex flex-col xl:flex-row items-center gap-3 border-b border-gray-50 mb-4">
                
                {/* --- NEW 4: FILTER SELECT UI --- */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={filterCondition}
                    onChange={handleFilterChange}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-all cursor-pointer"
                  >
                    <option value="all">All Conditions</option>
                    <option value="new">New Vehicles</option>
                    <option value="used">Used Vehicles</option>
                  </select>
                </div>
                
                {/* --- NEW 5: SEARCH INPUT UI --- */}
                <div className="relative flex-1 w-full">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search by VIN, Model or Brand..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    {searchTerm && (
                      <button 
                        onClick={() => { setSearchTerm(""); setCurrentPage(1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                </div>

                <div className="flex">
                    <button 
                      onClick={handleOpenAdd}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-all shadow-emerald-200"
                    >
                        <Plus size={18} /> Add Vehicle
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-gray-500 font-medium">Loading vehicle list...</div>
            ) : error ? (
                <div className="py-20 text-center text-red-500 font-medium">{error}</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left rounded-xl">
                        <thead className="bg-[#EBF7F1]">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-l-md">Vehicle Details</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Specs</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider">Price</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider text-center">Status</th>
                                <th className="p-4 text-xs font-semibold text-emerald-900 uppercase tracking-wider rounded-r-md text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentVehicles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">
                                      {searchTerm || filterCondition !== 'all' 
                                        ? "No vehicles match your search criteria." 
                                        : "No vehicles available in the inventory."}
                                    </td>
                                </tr>
                            ) : (
                                currentVehicles.map((car) => {
                                    const primaryImage = car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/150x100?text=No+Image';
                                    return (
                                        <tr key={car._id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="p-4 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                                                        <img src={primaryImage} alt="Car" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-700 block uppercase">{car.make} {car.model}</span>
                                                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 mt-1 inline-block rounded">{car.vinNumber}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                                                    <div className="flex items-center gap-1.5"><Calendar size={12} className="text-gray-400" /> {car.yearOfManufacture}</div>
                                                    <div className="flex items-center gap-1.5 capitalize"><Settings size={12} className="text-gray-400" /> {car.transmission}</div>
                                                    <div className="flex items-center gap-1.5 capitalize"><Fuel size={12} className="text-gray-400" /> {car.fuelType}</div>
                                                    <div className="flex items-center gap-1.5"><Car size={12} className="text-gray-400" /> {car.mileage?.toLocaleString()} km</div>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className="text-sm font-bold text-emerald-600">${car.price?.toLocaleString()}</span>
                                                <div className="text-[10px] font-mono text-gray-400 mt-0.5">Plate: {car.licensePlate}</div>
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${car.condition === 'new' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {car.condition === 'new' && <CheckCircle size={12} className="mr-1" />}
                                                    {car.condition === 'used' && <AlertCircle size={12} className="mr-1" />}
                                                    {car.condition || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="flex justify-center gap-2 text-gray-400">
                                                    <button onClick={() => handleEditClick(car)} className="p-1.5 hover:bg-emerald-50 hover:text-emerald-600 rounded-md transition-colors"><Pencil size={18} /></button>
                                                    <button onClick={() => handleDeleteClick(car._id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"><Trash2 size={18} /></button>
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

            {/* --- UPDATE: PASS TOTAL FILTERED VEHICLES --- */}
            <Pagination 
                currentPage={currentPage}
                totalItems={filteredVehicles.length}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>

        {/* --- MODAL FORM --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex items-center justify-between z-10">
                        <h2 className="text-lg font-bold text-emerald-900">
                            {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </h2>
                        <button onClick={resetForm} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Make</label>
                                <Select
                                    options={makeOptions}
                                    value={makeOptions.find(option => option.value === formData.make) || null}
                                    onChange={handleMakeChange}
                                    placeholder="Search Brand..."
                                    isClearable
                                    className="text-sm"
                                    styles={{
                                        control: (baseStyles, state) => ({
                                            ...baseStyles,
                                            borderColor: state.isFocused ? '#10b981' : '#e5e7eb',
                                            borderRadius: '0.5rem',
                                            padding: '0.125rem',
                                            boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.5)' : 'none',
                                            '&:hover': {
                                                borderColor: state.isFocused ? '#10b981' : '#d1d5db'
                                            }
                                        }),
                                        option: (baseStyles, state) => ({
                                            ...baseStyles,
                                            backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
                                            color: state.isSelected ? 'white' : '#374151',
                                            '&:active': {
                                                backgroundColor: '#10b981'
                                            }
                                        })
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Model</label>
                                <input required type="text" name="model" value={formData.model} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" placeholder="e.g. CAMRY" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Year</label>
                                <input required type="number" name="yearOfManufacture" value={formData.yearOfManufacture} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">License Plate</label>
                                <input required type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">VIN Number</label>
                                <input required type="text" name="vinNumber" value={formData.vinNumber} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Color</label>
                                <input required type="text" name="color" value={formData.color} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Mileage (km)</label>
                                <input required type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Price ($)</label>
                                <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Transmission</label>
                                <select name="transmission" value={formData.transmission} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
                                    <option value="automatic">Automatic</option>
                                    <option value="manual">Manual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Type</label>
                                <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
                                    <option value="sedan">Sedan</option>
                                    <option value="suv">SUV</option>
                                    <option value="hatchback">Hatchback</option>
                                    <option value="truck">Truck</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Fuel Type</label>
                                <select name="fuelType" value={formData.fuelType} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="hybrid">Hybrid</option>
                                    <option value="electric">Electric</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Condition</label>
                                <select name="condition" value={formData.condition} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all">
                                    <option value="new">New</option>
                                    <option value="used">Used</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Features</label>
                            <textarea name="features" value={formData.features} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all" rows={2} placeholder="Enter features, separated by commas (e.g., Bluetooth, Sunroof...)" />
                        </div>
                        
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase mb-2">
                                <Upload size={14} className="text-emerald-500"/> 
                                {editingId ? 'Upload New Images (Optional)' : 'Upload Vehicle Images'}
                            </label>
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer transition-all" 
                            />
                            {imageFiles.length > 0 && (
                                <p className="text-xs text-emerald-600 font-medium mt-2">
                                    Selected {imageFiles.length} images.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg shadow-sm shadow-emerald-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSubmitting ? (
                                    <>Saving...</>
                                ) : (
                                    <>{editingId ? 'Update Vehicle' : 'Save Vehicle'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}