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
  deliveryAddress: string;
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
  status: 'draft' | 'pending_approval' | 'active' | 'reserved' | 'sold' | 'expired' | 'hidden' | 'blocked';
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [user, setUser] = useState({
    id: '',
    email: '',
    password: '********',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    deliveryAddress: '',

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
          deliveryAddress: data.deliveryAddress || '',
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

  const markPostingAsSold = async (postingId: string) => {
    try {
      await apiClient(`/postings/${postingId}`, {
        method: 'PATCH',
        body: { status: 'sold' },
      });
      // Update the local state to reflect the change
      setMyListings((prevListings) =>
        prevListings.map((posting) =>
          posting._id === postingId || posting.id === postingId
            ? { ...posting, status: 'sold' as const }
            : posting
        )
      );
      alert('Listing marked as sold!');
    } catch (error) {
      console.error('Failed to mark listing as sold:', error);
      alert('Failed to mark listing as sold.');
    }
  };


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
      if (user.deliveryAddress !== originalData.deliveryAddress) updateData.deliveryAddress = user.deliveryAddress;

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

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await apiClient('/users/me/password', {
        method: 'PATCH',
        body: {
          currentPassword,
          newPassword,
        },
      });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError((error as Error).message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
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
            <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden border border-gray-200">
              {/* ================= HEADER ================= */}
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 px-5 py-6 text-white">
                <div className="mx-auto grid w-full max-w-[1040px] gap-5 lg:grid-cols-[minmax(240px,_280px)_1fr] items-center">
                  <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/15 bg-white/10 p-4 shadow-[0_28px_84px_-52px_rgba(0,0,0,0.32)] backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className="w-20 h-20 rounded-full border border-white/25 bg-white/10 flex items-center justify-center overflow-hidden">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-14 h-14 text-white/80"
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

                      <label className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/90 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm cursor-pointer transition hover:bg-white">
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleAvatarChange}
                        />
                        Upload photo
                      </label>
                    </div>

                    <div className="text-center">
                      <h1 className="text-xl font-semibold tracking-tight text-white">{user.firstName} {user.lastName}</h1>
                      <p className="mt-1 text-xs text-white/80">Member since {memberSince}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:bg-white/20">
                      <p className="text-xl font-bold text-white">{postedCarsCount}</p>
                      <p className="mt-1 text-xs text-white/80">Cars Posted</p>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:bg-white/20">
                      <p className="text-xl font-bold text-white">{user.rating.toFixed(1)}</p>
                      <p className="mt-1 text-xs text-white/80">Seller Rating</p>
                    </div>

                    <div className="rounded-[1.75rem] border border-white/20 bg-white/10 p-3 text-center backdrop-blur-sm transition hover:bg-white/20">
                      <p className="text-xl font-bold text-white">{user.sellerStatus === 'approved' ? 'Approved' : user.sellerStatus === 'pending' ? 'Pending' : 'Customer'}</p>
                      <p className="mt-1 text-xs text-white/80">Account Status</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CONTENT ================= */}
              <div className="px-6 py-8">
              {/* Tabs */}
              <div className="mb-8 rounded-full bg-slate-100 p-1 shadow-sm">
                <nav className="flex flex-wrap gap-2">
                  {[
                    { key: 'personal', label: 'Personal Information' },
                    { key: 'account', label: 'Account Settings' },
                    { key: 'listings', label: 'My Listings' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        activeTab === tab.key
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-slate-100'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* ===== PERSONAL ===== */}
              {activeTab === 'personal' && (
                <div className="space-y-8">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Personal Information</h2>
                        <p className="mt-1 text-sm text-gray-500">Update your name, email, phone number, and delivery address.</p>
                      </div>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
                      >
                        Save Changes
                      </button>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                        <input
                          type="text"
                          value={user.firstName}
                          onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                          className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                        <input
                          type="text"
                          value={user.lastName}
                          onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                          className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        Email Address
                        <input
                          type="email"
                          value={user.email}
                          readOnly
                          className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-600 cursor-not-allowed"
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                        <input
                          type="tel"
                          value={user.phoneNumber}
                          onChange={(e) => setUser({ ...user, phoneNumber: e.target.value })}
                          className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                      </label>

                      <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                        Delivery Address
                        <textarea
                          value={user.deliveryAddress}
                          onChange={(e) => setUser({ ...user, deliveryAddress: e.target.value })}
                          className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          rows={3}
                          placeholder="Street address, city, postal code"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* ACCOUNT */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">Account Settings</h2>
                        <p className="text-sm text-gray-500">Manage your security and privacy preferences.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Change Password</h3>
                          <p className="mt-1 text-sm text-gray-600">Update your password to keep your account secure.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowPasswordModal(true)}
                          className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                        >
                          Change
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                          <p className="mt-1 text-sm text-gray-600">Manage your email notification preferences.</p>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50">
                          Manage
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">Privacy Settings</h3>
                          <p className="mt-1 text-sm text-gray-600">Control your privacy and data sharing preferences.</p>
                        </div>
                        <button className="inline-flex items-center justify-center rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50">
                          Settings
                        </button>
                      </div>
                    </div>
                  </div>

                  {showPasswordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
                      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-2xl font-semibold text-gray-900">Change Password</h3>
                            <p className="mt-1 text-sm text-gray-500">Enter your current password and choose a new password.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPasswordModal(false)}
                            className="text-gray-400 transition hover:text-gray-600"
                          >
                            <span className="sr-only">Close</span>
                            ✕
                          </button>
                        </div>

                        <div className="mt-6 grid gap-5">
                          <label className="block text-sm font-medium text-gray-700">
                            Current Password
                            <input
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                          </label>

                          <label className="block text-sm font-medium text-gray-700">
                            New Password
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                          </label>

                          <label className="block text-sm font-medium text-gray-700">
                            Confirm New Password
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                          </label>

                          {passwordError && (
                            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
                              {passwordError}
                            </div>
                          )}

                          {passwordSuccess && (
                            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
                              {passwordSuccess}
                            </div>
                          )}

                          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={() => setShowPasswordModal(false)}
                              className="rounded-full border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleChangePassword}
                              disabled={passwordLoading}
                              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                            >
                              {passwordLoading ? 'Updating...' : 'Update Password'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                            <Link href={`/vehicle/${postingId}`} className="block relative">
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
                              {posting.status === 'sold' && (
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                  <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg">
                                    SOLD
                                  </div>
                                </div>
                              )}
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
                                  {vehicle && posting.status !== 'sold' ? (
                                    <Link href={`/profile/vehicle/${vehicleId}/edit`} className="flex-1">
                                      <button className="w-full border text-black rounded-md py-2 text-sm hover:bg-gray-50">Edit</button>
                                    </Link>
                                  ) : (
                                    <button className="flex-1 border text-gray-400 rounded-md py-2 text-sm cursor-not-allowed" disabled>Edit</button>
                                  )}
                                  {posting.status !== 'sold' ? (
                                    <button
                                      onClick={() => markPostingAsSold(postingId ?? posting._id!)}
                                      className="flex-1 bg-[#006557] text-white rounded-md py-2 text-sm hover:bg-[#005446]"
                                    >
                                      Mark Sold
                                    </button>
                                  ) : (
                                    <button
                                      className="flex-1 bg-gray-400 text-white rounded-md py-2 text-sm cursor-not-allowed"
                                      disabled
                                    >
                                      Sold
                                    </button>
                                  )}
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
