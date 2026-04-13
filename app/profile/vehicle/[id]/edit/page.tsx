'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';

interface ImageFile {
  file?: File;
  preview: string;
}

interface FormDataType {
  make: string;
  model: string;
  yearOfManufacture: number | '';
  licensePlate: string;
  vinNumber: string;
  color: string;
  mileage: number | '';
  transmission: string;
  type: string;
  fuelType: string;
  condition: string;
  vehicleFeatures: string[];
  title: string;
  description: string;
  price: number | '';
  currency: string;
  locationCity: string;
  locationDistrict: string;
  locationAddress: string;
  images: ImageFile[];
  termsAccepted: boolean;
}

const COMMON_FEATURES = [
  'Air Conditioning',
  'Power Steering',
  'Power Windows',
  'Power Locks',
  'ABS Brakes',
  'Airbags',
  'Cruise Control',
  'Bluetooth',
  'USB Ports',
  'Backup Camera',
  'Navigation System',
  'Heated Seats',
  'Leather Seats',
  'Sunroof',
  'Alloy Wheels',
  'Fog Lights',
  'Tinted Windows',
  'Roof Rack',
  'Tow Package',
  'Keyless Entry',
  'Remote Start',
  'Original Paint',
  'Clean Interior',
  'No Accidents',
  'Single Owner',
  'Service Records',
  'Warranty',
  'Low Mileage'
];

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = (params && (params as any).id) || null;

  const [activeTab, setActiveTab] = useState('vehicle');
  const [loading, setLoading] = useState(true);
  const [hasActivePosting, setHasActivePosting] = useState(false);
  const [postingId, setPostingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    make: '',
    model: '',
    yearOfManufacture: '',
    licensePlate: '',
    vinNumber: '',
    color: '',
    mileage: '',
    transmission: '',
    type: '',
    fuelType: '',
    condition: 'used',
    vehicleFeatures: [],
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    locationCity: '',
    locationDistrict: '',
    locationAddress: '',
    images: [],
    termsAccepted: false,
  });

  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await apiClient<any[]>('/vehicle/my-vehicles');
        const found = data.find((v) => v._id === vehicleId || v.id === vehicleId);
        if (!found) {
          showErrorNotification('Error', 'Vehicle not found.');
          router.push('/profile');
          return;
        }

        const myPostings = await apiClient<any[]>('/postings/my-postings');
        const linkedPosting = myPostings.find(
          (p) => p.vehicle?.id === vehicleId || p.vehicle?._id === vehicleId || p.vehicleId === vehicleId,
        );
        setHasActivePosting(Boolean(linkedPosting));
        if (linkedPosting) {
          setPostingId(linkedPosting.id || linkedPosting._id);
        }

        setFormData({
          make: found.make || '',
          model: found.model || '',
          yearOfManufacture: found.yearOfManufacture || '',
          licensePlate: found.licensePlate || '',
          vinNumber: found.vinNumber || '',
          color: found.color || '',
          mileage: found.mileage || '',
          transmission: found.transmission || '',
          type: found.type || '',
          fuelType: found.fuelType || '',
          condition: found.condition || 'used',
          vehicleFeatures: found.features || [],
          title: linkedPosting?.title || '',
          description: linkedPosting?.description || found.description || '',
          price: linkedPosting?.price || found.price || '',
          currency: linkedPosting?.currency || 'USD',
          locationCity: linkedPosting?.locationCity || '',
          locationDistrict: linkedPosting?.locationDistrict || '',
          locationAddress: linkedPosting?.locationAddress || '',
          images: (found.images || []).map((img: string) => ({ preview: img })),
          termsAccepted: false,
        });
        setOriginalImages(found.images || []);
      } catch (err) {
        console.error('Failed to load vehicle details', err);
        showErrorNotification('Error', 'Failed to load vehicle details.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numberFields = ['yearOfManufacture', 'mileage', 'price'];

    setFormData(prev => ({
      ...prev,
      [name]: numberFields.includes(name) ? (value === '' ? '' : parseInt(value)) : value
    }));
    setError('');
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      vehicleFeatures: checked
        ? [...prev.vehicleFeatures, feature]
        : prev.vehicleFeatures.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.make || !formData.model || formData.yearOfManufacture === '' ||
        !formData.licensePlate || !formData.transmission || !formData.type || !formData.fuelType) {
      setError('Please fill in all required vehicle information fields');
      return false;
    }

    if (!formData.title || formData.price === '' ||
        !formData.locationCity || !formData.locationDistrict) {
      setError('Please fill in all listing information fields');
      return false;
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one image');
      return false;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Calculate removed images
      const currentImageUrls = formData.images.map(img => img.preview);
      const removedImages = originalImages.filter(url => !currentImageUrls.includes(url));

      // Prepare data for PATCH
      const updateData: any = {
        make: formData.make,
        model: formData.model,
        yearOfManufacture: Number(formData.yearOfManufacture),
        licensePlate: formData.licensePlate,
        vinNumber: formData.vinNumber,
        color: formData.color,
        mileage: Number(formData.mileage),
        transmission: formData.transmission,
        type: formData.type,
        fuelType: formData.fuelType,
        condition: formData.condition,
        features: formData.vehicleFeatures,
        price: Number(formData.price),
        description: formData.description,
      };

      // Handle images: new files to upload
      const newImages = formData.images.filter(img => img.file);

      const formDataMultipart = new FormData();
      
      // Add new images
      newImages.forEach((imageFile) => {
        formDataMultipart.append('images', imageFile.file!);
      });

      // Add removeImages as separate field
      removedImages.forEach((url) => {
        formDataMultipart.append('removeImages', url);
      });

      // Add other data as individual form fields
      Object.keys(updateData).forEach(key => {
        if (key !== 'removeImages') {
          const value = updateData[key];
          if (Array.isArray(value)) {
            value.forEach(item => formDataMultipart.append(key, item));
          } else {
            formDataMultipart.append(key, String(value));
          }
        }
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/vehicle/${vehicleId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataMultipart,
      });

      if (!response.ok) {
        throw new Error('Failed to update vehicle');
      }

      // Update posting if exists
      if (postingId) {
        const postingUpdateData = {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          currency: formData.currency,
          locationCity: formData.locationCity,
          locationDistrict: formData.locationDistrict,
          locationAddress: formData.locationAddress,
        };

        const postingResponse = await apiClient(`/postings/${postingId}`, {
          method: 'PATCH',
          body: postingUpdateData,
        });

        if (!postingResponse) {
          throw new Error('Failed to update posting');
        }
      }

      showSuccessNotification(
        'Listing Updated Successfully!',
        'Your vehicle listing has been updated and is now live.'
      );
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      showErrorNotification(
        'Failed to Update Listing',
        message
      );
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!postingId) {
      showErrorNotification('Error', 'No active posting to delete.');
      return;
    }

    const confirmed = confirm('Are you sure you want to delete this listing? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await apiClient(`/postings/${postingId}`, { method: 'DELETE' });
      showSuccessNotification(
        'Listing Deleted Successfully!',
        'Your vehicle listing has been removed from the marketplace.'
      );
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    } catch (err) {
      console.error('Failed to delete posting:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to delete listing.';
      setError(errMsg);
      showErrorNotification(
        'Failed to Delete Listing',
        errMsg
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Your Car for Sale</h1>
              <p className="text-gray-600 mt-2">Share your vehicle information to find the ideal buyer</p>
            </div>
            {hasActivePosting && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded font-medium hover:bg-red-700 transition whitespace-nowrap"
              >
                Delete
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className={`flex-1 text-center pb-4 ${activeTab === 'vehicle' ? 'border-b-2 border-[#006557] text-[#006557]' : 'text-gray-600 cursor-pointer'}`}
                onClick={() => setActiveTab('vehicle')}>
                <div className="font-semibold">Vehicle Info</div>
              </div>
              <div className={`flex-1 text-center pb-4 ${activeTab === 'posting' ? 'border-b-2 border-[#006557] text-[#006557]' : 'text-gray-600 cursor-pointer'}`}
                onClick={() => setActiveTab('posting')}>
                <div className="font-semibold">Listing Info</div>
              </div>
              <div className={`flex-1 text-center pb-4 ${activeTab === 'images' ? 'border-b-2 border-[#006557] text-[#006557]' : 'text-gray-600 cursor-pointer'}`}
                onClick={() => setActiveTab('images')}>
                <div className="font-semibold">Images</div>
              </div>
              <div className={`flex-1 text-center pb-4 ${activeTab === 'preview' ? 'border-b-2 border-[#006557] text-[#006557]' : 'text-gray-600 cursor-pointer'}`}
                onClick={() => setActiveTab('preview')}>
                <div className="font-semibold">Review</div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="bg-white rounded-lg shadow-md p-6 md:p-8">

            {/* Vehicle Information Tab */}
            {activeTab === 'vehicle' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Vehicle Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Make <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select vehicle make</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Ford">Ford</option>
                      <option value="Chevrolet">Chevrolet</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                      <option value="Audi">Audi</option>
                      <option value="Volkswagen">Volkswagen</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Kia">Kia</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Subaru">Subaru</option>
                      <option value="Lexus">Lexus</option>
                      <option value="Acura">Acura</option>
                      <option value="Infiniti">Infiniti</option>
                      <option value="Tesla">Tesla</option>
                      <option value="Porsche">Porsche</option>
                      <option value="Ferrari">Ferrari</option>
                      <option value="Lamborghini">Lamborghini</option>
                      <option value="Jaguar">Jaguar</option>
                      <option value="Land Rover">Land Rover</option>
                      <option value="Volvo">Volvo</option>
                      <option value="Chrysler">Chrysler</option>
                      <option value="Dodge">Dodge</option>
                      <option value="Jeep">Jeep</option>
                      <option value="Ram">Ram</option>
                      <option value="GMC">GMC</option>
                      <option value="Cadillac">Cadillac</option>
                      <option value="Lincoln">Lincoln</option>
                      <option value="Buick">Buick</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Isuzu">Isuzu</option>
                      <option value="Peugeot">Peugeot</option>
                      <option value="Renault">Renault</option>
                      <option value="Citroën">Citroën</option>
                      <option value="Fiat">Fiat</option>
                      <option value="Alfa Romeo">Alfa Romeo</option>
                      <option value="Maserati">Maserati</option>
                      <option value="Bentley">Bentley</option>
                      <option value="Rolls-Royce">Rolls-Royce</option>
                      <option value="Aston Martin">Aston Martin</option>
                      <option value="McLaren">McLaren</option>
                      <option value="Genesis">Genesis</option>
                      <option value="Polestar">Polestar</option>
                      <option value="Rivian">Rivian</option>
                      <option value="Lucid">Lucid</option>
                      <option value="NIO">NIO</option>
                      <option value="BYD">BYD</option>
                      <option value="Geely">Geely</option>
                      <option value="Great Wall">Great Wall</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="E.g. Civic, Camry, Ranger"
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year of Manufacture <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="yearOfManufacture"
                      value={formData.yearOfManufacture}
                      onChange={handleInputChange}
                      placeholder="E.g. 2020"
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      License Plate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      placeholder="E.g. 30A1-12345"
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      VIN Number
                    </label>
                    <input
                      type="text"
                      name="vinNumber"
                      value={formData.vinNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="E.g. Black, White, Gray"
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mileage (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      placeholder="E.g. 50000"
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmission <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select transmission</option>
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                      <option value="cvt">CVT</option>
                      <option value="dual-clutch">Dual-Clutch</option>
                      <option value="semi-automatic">Semi-Automatic</option>
                      <option value="amt">AMT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select vehicle type</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="coupe">Coupe</option>
                      <option value="convertible">Convertible</option>
                      <option value="wagon">Wagon</option>
                      <option value="pickup truck">Pickup Truck</option>
                      <option value="minivan">Minivan</option>
                      <option value="crossover">Crossover</option>
                      <option value="roadster">Roadster</option>
                      <option value="van">Van</option>
                      <option value="luxury sedan">Luxury Sedan</option>
                      <option value="sports car">Sports Car</option>
                      <option value="compact car">Compact Car</option>
                      <option value="midsize car">Midsize Car</option>
                      <option value="full-size car">Full-size Car</option>
                      <option value="subcompact car">Subcompact Car</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuel Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select fuel type</option>
                      <option value="gasoline">Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="plug-in hybrid">Plug-in Hybrid</option>
                      <option value="cng">CNG</option>
                      <option value="lpg">LPG</option>
                      <option value="hydrogen">Hydrogen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {/* <option value="new">New</option> */}
                      <option value="used">Used</option>
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Key Features
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {COMMON_FEATURES.map((feature) => (
                      <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.vehicleFeatures.includes(feature)}
                          onChange={(e) => handleFeatureChange(feature, e.target.checked)}
                          className="w-4 h-4 text-[#006557] border-gray-300 rounded focus:ring-[#006557]"
                        />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                  {formData.vehicleFeatures.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Selected features:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.vehicleFeatures.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('posting')}
                    className="px-6 py-2 bg-[#006557] text-white rounded-lg"
                  >
                    Next →
                  </button>
                </div>

                {hasActivePosting && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
                    This vehicle is currently linked to one or more active postings. Delete the posting from My Listings first, then you can delete this vehicle.
                  </div>
                )}
              </div>
            )}

            {/* Listing Information Tab */}
            {activeTab === 'posting' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Listing Information</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="E.g. Honda Civic 2020 Manual, Pristine Condition"
                      maxLength={100}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.title.length}/100</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="E.g. 500000000"
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="locationCity"
                          placeholder="Enter State/Province"
                          value={formData.locationCity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          District <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="locationDistrict"
                          value={formData.locationDistrict}
                          onChange={handleInputChange}
                          placeholder="E.g. District 1, Ba Vi District"
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detailed Address
                        </label>
                        <input
                          type="text"
                          name="locationAddress"
                          value={formData.locationAddress}
                          onChange={handleInputChange}
                          placeholder="Street address and house number"
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('vehicle')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('images')}
                    className="px-6 py-2 bg-[#006557] text-white rounded-lg"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Vehicle Images</h2>
                <p className="text-gray-600">Upload at least 3 photos to increase your chances of selling</p>

                {/* Image Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <svg
                      className="w-12 h-12 text-gray-400 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-gray-700 font-semibold">Drag and drop images here</p>
                    <p className="text-gray-500 text-sm">or click to select images</p>
                  </label>
                </div>

                {/* Images Preview */}
                {formData.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Uploaded Images ({formData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                              Cover Photo
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('posting')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="px-6 py-2 bg-[#006557] text-white rounded-lg"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Review Information</h2>

                {/* Vehicle Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Vehicle Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Make</p>
                      <p className="font-medium text-gray-900">{formData.make || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Model</p>
                      <p className="font-medium text-gray-900">{formData.model || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Year</p>
                      <p className="font-medium text-gray-900">{formData.yearOfManufacture || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Color</p>
                      <p className="font-medium text-gray-900">{formData.color || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mileage</p>
                      <p className="font-medium text-gray-900">{formData.mileage ? `${formData.mileage} km` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">License Plate</p>
                      <p className="font-medium text-gray-900">{formData.licensePlate || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">VIN Number</p>
                      <p className="font-medium text-gray-900">{formData.vinNumber || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Transmission</p>
                      <p className="font-medium text-gray-900">{formData.transmission || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Vehicle Type</p>
                      <p className="font-medium text-gray-900">{formData.type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Fuel Type</p>
                      <p className="font-medium text-gray-900">{formData.fuelType || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Condition</p>
                      <p className="font-medium text-gray-900">{formData.condition || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-medium text-gray-900 text-blue-600">
                        {formData.price ? `${(formData.price as number).toLocaleString()} ${formData.currency}` : '-'}
                      </p>
                    </div>
                    {formData.vehicleFeatures.length > 0 && (
                      <div className="md:col-span-3">
                        <p className="text-gray-600">Key Features</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.vehicleFeatures.map((feature, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Posting Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">Listing Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm">Title</p>
                      <p className="font-medium text-gray-900">{formData.title || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Location</p>
                      <p className="font-medium text-gray-900">
                        {formData.locationCity && formData.locationDistrict
                          ? `${formData.locationDistrict}, ${formData.locationCity}`
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Images Summary */}
                {formData.images.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">
                      Images ({formData.images.length})
                    </h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {formData.images.slice(0, 8).map((image, index) => (
                        <img
                          key={index}
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                      ))}
                      {formData.images.length > 8 && (
                        <div className="w-full h-24 bg-gray-300 rounded flex items-center justify-center">
                          <span className="text-gray-700 font-semibold">+{formData.images.length - 8}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      className="mt-1 w-4 h-4 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the terms of service and confirm that all information above is accurate
                    </label>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setActiveTab('images')}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#006557] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Updating...' : 'Update Listing'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}