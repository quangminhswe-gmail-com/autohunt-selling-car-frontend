import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service - AutoHunt',
  description: 'Read the AutoHunt Terms of Service that govern your use of the platform.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-[#006557] mb-6">Terms of Service</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            These Terms of Service govern your access to and use of the AutoHunt website and related services.
            By using AutoHunt, you agree to follow these terms and to use the platform in a lawful and respectful way.
          </p>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Use of the Platform</h2>
              <p>
                AutoHunt provides a marketplace where buyers and sellers can list, browse, and negotiate car transactions.
                You are responsible for providing accurate information and for your interactions with other users.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Account Responsibility</h2>
              <p>
                If you create an account, keep your credentials secure. You are responsible for all activity under your account,
                and you must notify AutoHunt immediately if you believe your account has been compromised.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Listing and Buying</h2>
              <p>
                All listings are created by users. AutoHunt does not guarantee the accuracy or completeness of listings.
                Buyers and sellers should verify details and complete transactions with care.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Prohibited Conduct</h2>
              <p>
                You may not use AutoHunt for fraud, unlawful activity, or to post misleading or harmful content.
                Violations may result in account suspension or removal from the platform.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
