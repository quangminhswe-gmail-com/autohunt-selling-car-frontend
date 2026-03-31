'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReadyToSell from '@/components/ReadyToSell';
import { apiClient } from '@/app/utils/api';

type SellerStatus = 'none' | 'pending' | 'approved' | 'rejected';
type UserRole = 'admin' | 'customer';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  sellerStatus: SellerStatus;
  avatarUrl: string;
  rating: number;
  totalPostings: number;
  createdAt: string;
  updatedAt: string;
};

type VehicleStatus = 'active' | 'sold';

type Posting = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  locationCity: string;
  locationDistrict: string;
  locationAddress: string;
  vehicle: {
    id?: string;
    _id?: string;
    make: string;
    model: string;
    yearOfManufacture: number;
    licensePlate: string;
    vinNumber: string;
    color: string;
    mileage: number;
    transmission: string;
    type: string;
    fuelType: string;
    condition: string;
    features: string[];
    price: number;
    images: string[];
  };
  createdAt: string;
  updatedAt: string;
};

const VEHICLE_LIST: Array<{
  id: string;
  make: 'honda' | 'toyota' | 'bmw' | 'audi';
  model: string;
  yearOfManufacture: number;
  licensePlate: string;
  vinNumber: string;
  color: string;
  mileage: number;
  transmission: 'automatic' | 'manual' | 'cvt';
  type: 'sedan' | 'suv';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  condition: 'new' | 'used';
  vehicleFeatures: string[];
  price: number;
  ownerId: string;
  status: VehicleStatus; // FE only
  imageUrl: string;      // FE only
  createdAt: string;
  updatedAt: string;
}> = [];


export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [myListings, setMyListings] = useState<Posting[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const [user, setUser] = useState({
    id: '',
    email: '',
    password: '********',
    firstName: '',
    lastName: '',
    phoneNumber: '',

    role: 'customer' as UserRole,
    isEmailVerified: false,
    isActive: false,
    sellerStatus: 'none' as SellerStatus,

    avatarUrl: '',
    rating: 0,
    totalPostings: 0,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await apiClient<any>('/users/me');
        setUser({
          id: data.id,
          email: data.email,
          password: '********',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber && data.phoneNumber !== 'false' ? data.phoneNumber : '',
          role: data.role || 'customer',
          isEmailVerified: data.isEmailVerified || false,
          isActive: data.isActive || false,
          sellerStatus: data.sellerStatus || 'none',
          avatarUrl: data.avatarUrl || '',
          rating: data.rating || 0,
          totalPostings: data.totalPostings || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
        setOriginalData(data);
      } catch (err) {
        console.error('Failed to load profile', err);
        setError((err as Error).message || 'Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchMyListings = async () => {
    setListingsLoading(true);
    try {
      const data = await apiClient<Posting[]>('/postings/my-postings');
      setMyListings(data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setListingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'listings') {
      fetchMyListings();
    }
  }, [activeTab]);

  useEffect(() => {
    // Fetch listings on initial page load so postedCarsCount is accurate immediately.
    fetchMyListings();
  }, []);


  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const postedCarsCount = myListings.length;

  const canShowRating =
    (user.sellerStatus === 'approved' && postedCarsCount > 0) || user.rating > 0;

  const handleSave = async () => {
    if (!originalData) return;
    try {
      const updateData: any = {};
      if (user.firstName !== originalData.firstName) updateData.firstName = user.firstName;
      if (user.lastName !== originalData.lastName) updateData.lastName = user.lastName;
      if (user.phoneNumber !== originalData.phoneNumber) updateData.phoneNumber = user.phoneNumber;

      if (Object.keys(updateData).length > 0) {
        await apiClient('/users/me', {
          method: 'PATCH',
          body: updateData,
        });
        setOriginalData({ ...originalData, ...updateData });
        alert('Profile updated successfully!');
      } else {
        alert('No changes to save.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUser({ ...user, avatarUrl: previewUrl });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-8">
          {loading ? (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-600">Loading profile...</div>
          ) : error ? (
            <div className="rounded-lg border bg-white p-8 text-center text-red-600">{error}</div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border">
              {/* ================= HEADER ================= */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Upload */}
                    <label className="absolute bottom-0 right-0 bg-[#006557] p-2 rounded-full cursor-pointer hover:bg-[#005446]">
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleAvatarChange}
                      />
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7h4l2-3h6l2 3h4v13H3V7z"
                        />
                      </svg>
                    </label>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {user.firstName} {user.lastName}
                      </h1>

                      {user.isEmailVerified && (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                          <svg width="12" height="16" viewBox="0 0 12 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16H0V0H12V16Z" stroke="#E5E7EB"/>
                            <g clip-path="url(#clip0_250_742)">
                            <path d="M6 13.5C7.5913 13.5 9.11742 12.8679 10.2426 11.7426C11.3679 10.6174 12 9.0913 12 7.5C12 5.9087 11.3679 4.38258 10.2426 3.25736C9.11742 2.13214 7.5913 1.5 6 1.5C4.4087 1.5 2.88258 2.13214 1.75736 3.25736C0.632141 4.38258 0 5.9087 0 7.5C0 9.0913 0.632141 10.6174 1.75736 11.7426C2.88258 12.8679 4.4087 13.5 6 13.5ZM8.64844 6.39844L5.64844 9.39844C5.42813 9.61875 5.07188 9.61875 4.85391 9.39844L3.35391 7.89844C3.13359 7.67813 3.13359 7.32188 3.35391 7.10391C3.57422 6.88594 3.93047 6.88359 4.14844 7.10391L5.25 8.20547L7.85156 5.60156C8.07187 5.38125 8.42812 5.38125 8.64609 5.60156C8.86406 5.82187 8.86641 6.17812 8.64609 6.39609L8.64844 6.39844Z" fill="#166534"/>
                            </g>
                            <defs>
                            <clipPath id="clip0_250_742">
                            <path d="M0 1.5H12V13.5H0V1.5Z" fill="white"/>
                            </clipPath>
                            </defs>
                        </svg>
                            Verified
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm">
                      Member since {memberSince}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-10">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {postedCarsCount}
                    </p>
                    <p className="text-sm text-gray-600">Cars Posted</p>
                  </div>

                  {canShowRating && (
                    <div className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg
                            key={i}
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className={`${
                              i <= Math.floor(user.rating)
                                ? 'text-yellow-400'
                                : i - user.rating < 1
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            style={{
                              opacity:
                                i <= Math.floor(user.rating) ? 1 : i - user.rating < 1 ? user.rating % 1 : 0.3,
                            }}
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xl font-bold text-gray-900 block mb-1">
                        {user.rating.toFixed(1)}
                      </span>
                      <p className="text-sm text-gray-600 font-medium">Seller Rating</p>
                      <div className="mt-2 px-3 py-1 bg-white rounded-full text-xs text-gray-600 font-medium inline-block">
                        ⭐ Trusted Seller
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="p-6">
              {/* Tabs */}
              <div className="border-b mb-6">
                <nav className="flex space-x-8">
                  {[
                    { key: 'personal', label: 'Personal Information' },
                    { key: 'account', label: 'Account Settings' },
                    { key: 'listings', label: 'My Listings' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.key
                          ? 'border-[#006557] text-[#006557]'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* ===== PERSONAL (GIỮ NGUYÊN LAYOUT) ===== */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user.firstName}
                        onChange={(e) =>
                          setUser({ ...user, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006557]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user.lastName}
                        onChange={(e) =>
                          setUser({ ...user, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006557]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={user.phoneNumber}
                        onChange={(e) =>
                          setUser({ ...user, phoneNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:ring-2 focus:ring-[#006557]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSave}
                      className="bg-[#006557] text-white px-6 py-2 rounded-md hover:bg-[#005446]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* ACCOUNT */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>

                  <div className="space-y-4">
                    {[
                      {
                        title: 'Change Password',
                        desc: 'Update your password to keep your account secure',
                        action: 'Change',
                      },
                      {
                        title: 'Email Notifications',
                        desc: 'Manage your email notification preferences',
                        action: 'Manage',
                      },
                      {
                        title: 'Privacy Settings',
                        desc: 'Control your privacy and data sharing preferences',
                        action: 'Settings',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="flex items-center justify-between p-4 border rounded-md"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <button className="text-[#006557] font-medium hover:text-[#005446]">
                          {item.action}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LISTINGS */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
                    <Link href="/sell">
                      <button className="bg-[#006557] text-white px-4 py-2 rounded-md hover:bg-[#005446]">Add New Listing</button>
                    </Link>
                  </div>

                  {listingsLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006557] mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading your listings...</p>
                    </div>
                  ) : myListings.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No listings yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating your first car listing.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {myListings.map((posting) => {
                        const vehicle = posting.vehicle;
                        const postingId = posting.id ?? posting._id;
                        const vehicleId = vehicle?.id ?? vehicle?._id;
                        const imageSrc = vehicle?.images?.length ? vehicle.images[0] : undefined;
                        if (!vehicleId) {
                          return null;
                        }

                        return (
                          <div key={postingId ?? posting._id ?? posting.id} className="bg-white border rounded-lg shadow-sm overflow-hidden">
                            <Link href={`/vehicle/${postingId}`} className="block">
                              <div className="h-40 bg-gray-100">
                                {imageSrc ? (
                                  <img
                                    src={imageSrc}
                                    alt={`${vehicle?.yearOfManufacture ?? ''} ${vehicle?.make ?? ''} ${vehicle?.model ?? ''}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No Image
                                  </div>
                                )}
                              </div>
                            </Link>

                            <div className="p-4 space-y-2 flex-1 flex flex-col">
                              <Link href={`/vehicle/${posting.id}`} className="block">
                                <h3 className="text-lg font-semibold text-gray-900 hover:text-[#006557]">
                                  {vehicle ? `${vehicle.yearOfManufacture} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                                </h3>
                              </Link>

                              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.625 0.875V1.75H1.3125C0.587891 1.75 0 2.33789 0 3.0625V4.375H12.25V3.0625C12.25 2.33789 11.6621 1.75 10.9375 1.75H9.625V0.875C9.625 0.391016 9.23398 0 8.75 0C8.26602 0 7.875 0.391016 7.875 0.875V1.75H4.375V0.875C4.375 0.391016 3.98398 0 3.5 0C3.01602 0 2.625 0.391016 2.625 0.875ZM12.25 5.25H0V12.6875C0 13.4121 0.587891 14 1.3125 14H10.9375C11.6621 14 12.25 13.4121 12.25 12.6875V5.25Z" fill="#4B5563"/>
                                  </svg>
                                  <span>{vehicle?.yearOfManufacture || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 0H4.95469C4.21367 0 3.55195 0.467578 3.30586 1.16484L0.0847656 10.2594C0.0300781 10.418 0 10.5875 0 10.757C0 11.5801 0.669922 12.25 1.49297 12.25H7V10.5C7 10.016 7.39102 9.625 7.875 9.625C8.35898 9.625 8.75 10.016 8.75 10.5V12.25H14.257C15.0828 12.25 15.75 11.5801 15.75 10.757C15.75 10.5875 15.7199 10.418 15.6652 10.2594L12.4441 1.16484C12.1953 0.467578 11.5363 0 10.7953 0H8.75V1.75C8.75 2.23398 8.35898 2.625 7.875 2.625C7.39102 2.625 7 2.23398 7 1.75V0ZM8.75 5.25V7C8.75 7.48398 8.35898 7.875 7.875 7.875C7.39102 7.875 7 7.48398 7 7V5.25C7 4.76602 7.39102 4.375 7.875 4.375C8.35898 4.375 8.75 4.76602 8.75 5.25Z" fill="#4B5563"/>
                                  </svg>
                                  <span>{vehicle?.mileage?.toLocaleString() || 0} km</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-2">
                                <p className="text-2xl font-bold text-[#006557]">${posting.price.toLocaleString()}</p>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <svg width="11" height="14" viewBox="0 0 11 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.89805 13.65C7.30078 11.8945 10.5 7.63984 10.5 5.25C10.5 2.35156 8.14844 0 5.25 0C2.35156 0 0 2.35156 0 5.25C0 7.63984 3.19922 11.8945 4.60195 13.65C4.93828 14.0684 5.56172 14.0684 5.89805 13.65ZM5.25 3.5C5.71413 3.5 6.15925 3.68437 6.48744 4.01256C6.81563 4.34075 7 4.78587 7 5.25C7 5.71413 6.81563 6.15925 6.48744 6.48744C6.15925 6.81563 5.71413 7 5.25 7C4.78587 7 4.34075 6.81563 4.01256 6.48744C3.68437 6.15925 3.5 5.71413 3.5 5.25C3.5 4.78587 3.68437 4.34075 4.01256 4.01256C4.34075 3.68437 4.78587 3.5 5.25 3.5Z" fill="#6B7280"/>
                                  </svg>
                                  <span>{posting.locationCity ? posting.locationCity : 'Unknown location'}</span>
                                </div>
                              </div>

                              <div className="mt-auto pt-2">
                                <div className="flex gap-2">
                                  {vehicle ? (
                                    <Link href={`/profile/vehicle/${vehicleId}/edit`} className="flex-1">
                                      <button className="w-full border text-black rounded-md py-2 text-sm hover:bg-gray-50">Edit</button>
                                    </Link>
                                  ) : (
                                    <button className="flex-1 border text-gray-400 rounded-md py-2 text-sm cursor-not-allowed" disabled>Edit</button>
                                  )}
                                  <button className="flex-1 bg-[#006557] text-white rounded-md py-2 text-sm hover:bg-[#005446]">Mark Sold</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </main>

      <ReadyToSell />
      <Footer />
    </div>
  );
}
