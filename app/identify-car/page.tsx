'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiClient } from '@/app/utils/api';
import { showSuccessNotification, showErrorNotification } from '@/utils/notifications';

interface IdentificationResult {
  brand: string;
  model?: string;
  type?: string;
  yearOfManufacture?: string | number;
  confidence: number;
}

export default function IdentifyCarPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<Array<{ _id: string; title: string; price: number; currency: string; vehicle: { make: string; model: string; yearOfManufacture: number; images: string[]; }; }>>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetPage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setRawResponse(null);
    setSimilarVehicles([]);
    setError(null);
  };

  const parsePredictionText = (text: string) => {
    try {
      const parsed = JSON.parse(text.trim());
      return parsed;
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  };

  const normalizePrediction = (raw: any): IdentificationResult | null => {
    if (!raw) return null;

    const source = typeof raw === 'string' ? parsePredictionText(raw) : raw;
    if (!source || typeof source !== 'object') return null;

    const brand = source.brand || source.make || source.manufacturer || '';
    const model = source.model || '';
    const type = source.type || source.bodyType || source.vehicleType || '';
    const rawYearOfManufacture =
      source['year of manufacture'] ||
      source.yearOfManufacture ||
      source.year ||
      source.year_of_manufacture ||
      source.manufactureYear ||
      '';

    const yearOfManufacture =
      typeof rawYearOfManufacture === 'string'
        ? rawYearOfManufacture.replace(/\bpresent\b/ig, String(new Date().getFullYear()))
        : rawYearOfManufacture;

    let confidence = Number(
      source.confidence ??
        source.confidenceScore ??
        source.confidence_percentage ??
        source.confidencePercent ??
        source.confidence_percentage ??
        0,
    );

    if (confidence > 1) {
      confidence = confidence / 100;
    }

    if (!brand) {
      return null;
    }

    return {
      brand,
      model: model || undefined,
      type: type || undefined,
      yearOfManufacture: yearOfManufacture || undefined,
      confidence: Number.isFinite(confidence) ? confidence : 0,
    };
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setRawResponse(null);
      setSimilarVehicles([]);
      setError(null);
    }
  };

  const fetchSimilarVehicles = async (brand: string, model: string) => {
    if (!brand && !model) {
      setSimilarVehicles([]);
      return;
    }

    setLoadingSimilar(true);
    try {
      const postings = await apiClient<Array<{ _id: string; title: string; price: number; currency: string; vehicle: { make: string; model: string; yearOfManufacture: number; images: string[]; }; }>>('/postings');
      const matches = postings.filter((posting) => {
        const postingMake = posting.vehicle?.make?.toLowerCase() || '';
        const postingModel = posting.vehicle?.model?.toLowerCase() || '';
        const expectedMake = brand.toLowerCase();
        const expectedModel = model.toLowerCase();

        return (
          (expectedMake ? postingMake === expectedMake : true) &&
          (expectedModel ? postingModel === expectedModel : true)
        );
      });
      setSimilarVehicles(matches.slice(0, 6));
    } catch (err) {
      console.error('Failed to load similar vehicles', err);
      setSimilarVehicles([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const identifyCar = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIdentifying(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${baseUrl}/ai/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to identify car');
      }

      const data = await response.json();
      const raw = data?.data?.raw ?? data?.data ?? data;
      const rawText = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
      setRawResponse(rawText);

      const normalized = normalizePrediction(raw);
      if (!normalized) {
        throw new Error('Unable to parse prediction response.');
      }

      setResult(normalized);
      showSuccessNotification('Car Identified!', `Brand: ${normalized.brand}, Model: ${normalized.model || 'unknown'}`);
      await fetchSimilarVehicles(normalized.brand, normalized.model || '');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
      showErrorNotification('Identification Failed', message);
    } finally {
      setIdentifying(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#080b14] text-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_30%)]" />
          <div className="relative px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-10">
                <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-2xl">
                    <span className="inline-flex rounded-full bg-cyan-500/15 px-4 py-1 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300 ring-1 ring-cyan-400/20">
                      AI Vehicle Identify
                    </span>
                    <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                      Identify any car from a photo.
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                      Upload an image and let our AI inspect the vehicle, returning brand, model, body type, year and confidence score.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 shadow-xl shadow-cyan-500/5">
                    <p className="text-sm text-slate-400">Powered by</p>
                    <p className="mt-2 text-lg font-semibold text-white">AutoHunt Neural Vision</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.4)]">
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-semibold text-white">Upload your car photo</h2>
                          <p className="mt-1 text-sm text-slate-400">JPEG, PNG, or GIF up to 5MB.</p>
                        </div>
                        <div className="rounded-2xl bg-cyan-500/10 px-3 py-1 text-sm font-semibold text-cyan-200">
                          Smart scan</div>
                      </div>

                      <div className="rounded-[24px] border border-cyan-500/20 bg-slate-900/90 p-6">
                        <label className="flex cursor-pointer flex-col gap-3 rounded-3xl border border-dashed border-cyan-400/30 bg-slate-950/80 p-6 text-center transition hover:bg-slate-900/90 hover:border-cyan-300/40">
                          <span className="text-sm font-semibold text-cyan-200">Choose a car image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                          <span className="text-xs text-slate-400">Tap or drop your photo here</span>
                        </label>
                        <p className="mt-3 text-xs text-slate-500">Minimum resolution 720x480. Best results on clear exterior shots.</p>
                      </div>

                      <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/80">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Car preview" className="h-80 w-full object-cover" />
                        ) : (
                          <div className="flex min-h-[20rem] items-center justify-center px-6 py-10 text-center text-sm text-slate-400">
                            Preview will appear here after image selection.
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={identifyCar}
                          disabled={!selectedImage || identifying}
                          className="inline-flex flex-1 items-center justify-center rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 py-4 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {identifying ? 'Analyzing image...' : 'Identify Vehicle'}
                        </button>
                        <button
                          type="button"
                          onClick={resetPage}
                          className="inline-flex flex-1 items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                        >
                          Upload new image
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-100">
                        <p className="font-semibold text-red-100">Unable to identify vehicle</p>
                        <p className="mt-2 text-slate-200">{error}</p>
                      </div>
                    )}

                    {rawResponse && !result && (
                      <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-100">
                        <p className="font-semibold text-yellow-100">Raw backend response</p>
                        <pre className="mt-3 max-h-60 overflow-auto text-xs text-slate-100">{rawResponse}</pre>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/10 bg-slate-950/75 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.45)]">
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Result summary</p>
                          <h4 className="mt-3 text-2xl font-semibold text-white">Vehicle In Your Picture</h4>
                        </div>
                        {/* <div className="inline-flex items-center rounded-2xl bg-slate-900/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                          AI estimated
                        </div> */}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          { label: 'Brand', value: result?.brand },
                          { label: 'Model', value: result?.model },
                          { label: 'Type', value: result?.type },
                          { label: 'Year', value: result?.yearOfManufacture },
                        ].map((item) => (
                          <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                            <p className="mt-2 text-lg font-semibold text-white">{item.value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result && (
                      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/75 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-white">Similar vehicles</h3>
                            <p className="mt-1 text-sm text-slate-400">Listings that match the same make and model.</p>
                          </div>

                          <span className="inline-flex items-center rounded-3xl bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                            {similarVehicles.length} found
                          </span>
                        </div>

                        {loadingSimilar ? (
                          <p className="text-sm text-slate-400">Searching for similar vehicles...</p>
                        ) : similarVehicles.length === 0 ? (
                          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center">
                            <p className="text-sm text-slate-400">No matching vehicles available right now.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {similarVehicles.map((posting) => (
                              <Link
                                key={posting._id}
                                href={`/vehicle/${posting._id}`}
                                className="block overflow-hidden rounded-[24px] border border-white/10 bg-slate-900/70 transition hover:border-cyan-400/40 hover:bg-slate-900/90"
                              >
                                <div className="flex gap-4 p-4">
                                    {/* IMAGE */}
                                    <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl bg-slate-800">
                                        {posting.vehicle.images?.[0] ? (
                                        <img
                                            src={posting.vehicle.images[0]}
                                            alt={`${posting.vehicle.make} ${posting.vehicle.model}`}
                                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                                        />
                                        ) : (
                                        <div className="h-full w-full bg-slate-700" />
                                        )}
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex min-w-0 flex-1 flex-col">

                                        {/* TITLE */}
                                        <div className="min-w-0">
                                        <h4 className="line-clamp-2 text-lg font-semibold leading-6 text-white">
                                            {posting.title}
                                        </h4>
                                        </div>

                                        {/* INFO */}
                                        <div className="mt-4 space-y-2">

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm text-slate-500">
                                            Brand
                                            </span>

                                            <span className="text-sm font-medium text-slate-200">
                                            {posting.vehicle.make}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm text-slate-500">
                                            Model
                                            </span>

                                            <span className="text-sm font-medium text-slate-200">
                                            {posting.vehicle.model}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm text-slate-500">
                                            Year
                                            </span>

                                            <span className="text-sm font-medium text-slate-200">
                                            {posting.vehicle.yearOfManufacture}
                                            </span>
                                        </div>
                                        </div>

                                        {/* PRICE */}
                                        <div className="mt-5 inline-flex w-fit items-center rounded-2xl bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                                        {posting.currency}

                                        <span className="ml-2">
                                            {posting.price.toLocaleString()}
                                        </span>
                                        </div>
                                    </div>
                                    </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}