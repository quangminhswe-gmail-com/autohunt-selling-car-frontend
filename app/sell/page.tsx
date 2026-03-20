'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ImageFile {
  file: File;
  preview: string;
}

interface FormDataType {
  make: string;
  model: string;
  yearOfManufacture: string;
  licensePlate: string;
  vinNumber: string;
  color: string;
  mileage: string;
  transmission: string;
  type: string;
  fuelType: string;
  condition: string;
  vehicleFeatures: string[];
  title: string;
  description: string;
  price: string;
  currency: string;
  locationCity: string;
  locationDistrict: string;
  locationAddress: string;
  images: ImageFile[];
}

export default function SellCarPage() {
  const [activeTab, setActiveTab] = useState('vehicle');
  const [formData, setFormData] = useState<FormDataType>({
    // Vehicle Information
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
    condition: 'Used',
    vehicleFeatures: [],
    
    // Posting Information
    title: '',
    description: '',
    price: '',
    currency: 'VND',
    locationCity: '',
    locationDistrict: '',
    locationAddress: '',
    
    // Images
    images: [],
  });

  const [featureInput, setFeatureInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({
        ...prev,
        vehicleFeatures: [...prev.vehicleFeatures, featureInput.trim()]
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicleFeatures: prev.vehicleFeatures.filter((_, i) => i !== index)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Submit to API
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Post Your Car for Sale</h1>
            <p className="text-gray-600 mt-2">Share your vehicle information to find the ideal buyer</p>
          </div>

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
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 md:p-8">
            
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
                      <option value="honda">Honda</option>
                      <option value="toyota">Toyota</option>
                      <option value="ford">Ford</option>
                      <option value="bmw">BMW</option>
                      <option value="mercedes">Mercedes</option>
                      <option value="audi">Audi</option>
                      <option value="hyundai">Hyundai</option>
                      <option value="kia">Kia</option>
                      <option value="mazda">Mazda</option>
                      <option value="suzuki">Suzuki</option>
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
                      License Plate
                    </label>
                    <input
                      type="text"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      placeholder="E.g. 30A1-12345"
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      placeholder="Vehicle identification number"
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
                      <option value="">Select transmission type</option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                      <option value="cvt">CVT</option>
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
                      <option value="pickup">Pickup</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="mpv">MPV</option>
                      <option value="coupe">Coupe</option>
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
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="electric">Electric</option>
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
                      <option value="New">New</option>
                      <option value="Used">Used</option>
                    </select>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features
                  </label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      placeholder="E.g. Original paint, Clean interior"
                      className="flex-1 px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="px-4 py-2 bg-[#006557] text-white rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.vehicleFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        <span>{feature}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
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
              </div>
            )}

            {/* Posting Information Tab */}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Detailed Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the vehicle condition, maintenance history, any issues..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
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
                        <option value="VND">VND (₫)</option>
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
                        <select
                          name="locationCity"
                          value={formData.locationCity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="">Select State/Province</option>
                          <option value="hanoi">Hanoi</option>
                          <option value="hcm">Ho Chi Minh City</option>
                          <option value="danang">Da Nang</option>
                          <option value="haiphong">Hai Phong</option>
                          <option value="hochiminh">HCMC</option>
                        </select>
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
                        {formData.price ? `${parseInt(formData.price).toLocaleString()} ${formData.currency}` : '-'}
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
                    className="px-6 py-2 bg-[#006557] text-white rounded-lg font-semibold"
                  >
                    Post Listing
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
