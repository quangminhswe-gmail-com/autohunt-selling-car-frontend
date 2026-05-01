import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About - AutoHunt',
  description: 'Learn more about AutoHunt, our mission, and how our car marketplace works.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-[#006557] mb-4">About AutoHunt</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              AutoHunt is an online car marketplace designed to help users search, compare, and trade vehicles with confidence.
              We connect buyers and sellers through a user-friendly, transparent, and trusted platform.
            </p>
          </div>

          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed">
                Our mission is to make car shopping fast and simple. AutoHunt is committed to providing a reliable place where
                users can browse car listings, compare options, and connect directly with sellers.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">What We Offer</h2>
              <ul className="list-disc list-inside text-slate-600 leading-relaxed space-y-2">
                <li>Clear and intuitive interface for both buyers and sellers.</li>
                <li>Organized car listings with detailed pricing, condition, and location information.</li>
                <li>Quick communication tools to help buyers and sellers connect.</li>
                <li>Helpful support features to answer questions and guide users through the process.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our Commitment</h2>
              <p className="text-slate-600 leading-relaxed">
                We are committed to delivering a secure, transparent, and effective car marketplace.
                Every listing is displayed clearly so you can make informed decisions with ease.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
