"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiClient } from "@/app/utils/api";
import { showSuccessNotification, showErrorNotification } from "@/utils/notifications";

type SupportCategory = 'technical' | 'billing' | 'account' | 'report' | 'other';

interface UploadedImage {
  file: File;
  url: string;
  uploading: boolean;
}

export default function SupportPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SupportCategory | "">("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('images', file);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: UploadedImage[] = Array.from(files).map(file => ({
      file,
      url: '',
      uploading: true,
    }));

    // Add to state immediately for UI feedback
    setUploadedImages(prev => [...prev, ...newImages]);

    // Upload each file
    for (let i = 0; i < newImages.length; i++) {
      try {
        const url = await uploadImage(newImages[i].file);
        setUploadedImages(prev =>
          prev.map((img, idx) =>
            idx === prev.length - newImages.length + i
              ? { ...img, url, uploading: false }
              : img
          )
        );
      } catch (err) {
        console.error('Upload failed:', err);
        setUploadedImages(prev =>
          prev.filter((_, idx) => idx !== prev.length - newImages.length + i)
        );
        setError('Failed to upload one or more images');
      }
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const attachments = uploadedImages
        .filter(img => img.url && !img.uploading)
        .map(img => img.url);

      const data = await apiClient<any>("/support", {
        method: "POST",
        body: {
          title,
          description,
          ...(category && { category }),
          ...(attachments.length > 0 && { attachments }),
        },
      });
      console.log("Support request created", data);
      showSuccessNotification(
        'Support Request Submitted!',
        'Your support request has been submitted successfully. Redirecting to your requests...'
      );
      setTitle("");
      setDescription("");
      setCategory("");
      setUploadedImages([]);
      setTimeout(() => {
        router.push('/support/requests');
      }, 2000);
    } catch (err) {
      console.error("Support request error:", err);
      showErrorNotification(
        'Failed to Submit Support Request',
        (err as Error).message || "Failed to submit support request"
      );
      setError((err as Error).message || "Failed to submit support request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header/Navigation */}
      <Header />

      {/* Breadcrumb */}
      <div className="px-8 py-3">
        <p className="text-sm text-gray-600">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          {" / "}
          <span className="text-gray-900 font-medium">Support</span>
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Support Heading */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Contact Support
          </h1>

          <p className="text-center text-gray-600 mb-8">
            Need help? Submit a support request and our team will assist you.
          </p>

          {/* Support Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div className="relative">
              <label className="absolute top-2 left-4 text-xs font-semibold text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of your issue"
                className="w-full px-4 pt-7 pb-3 border border-gray-300 rounded-lg
           text-sm text-gray-900 placeholder-gray-400
           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category Field */}
            <div className="relative">
              <label className="absolute top-2 left-4 text-xs font-semibold text-gray-700">
                Category (Optional)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SupportCategory)}
                className="w-full px-4 pt-7 pb-3 border border-gray-300 rounded-lg
           text-sm text-gray-900
           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description Field */}
            <div className="relative">
              <label className="absolute top-2 left-4 text-xs font-semibold text-gray-700">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about your issue"
                rows={6}
                className="w-full px-4 pt-7 pb-3 border border-gray-300 rounded-lg
           text-sm text-gray-900 placeholder-gray-400
           focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-vertical"
                required
              />
            </div>

            {/* Image Upload Field */}
            <div className="relative">
              <label className="absolute top-2 left-4 text-xs font-semibold text-gray-700">
                Supporting Images (Optional)
              </label>
              <div className="pt-7 pb-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
             text-sm text-gray-900
             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
             file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
             file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700
             hover:file:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can upload multiple images to help us better understand your issue.
                </p>
              </div>
            </div>

            {/* Image Previews */}
            {uploadedImages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Uploaded Images:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {image.uploading ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                          </div>
                        ) : (
                          <img
                            src={image.url}
                            alt={`Supporting image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {!image.uploading && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-500 text-white font-bold rounded-lg transition-colors"
            >
              {loading ? "Submitting..." : "Submit Support Request"}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              For urgent issues, you can also reach us at{" "}
              <a href="mailto:support@autohunt.com" className="text-teal-600 hover:text-teal-700">
                support@autohunt.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}