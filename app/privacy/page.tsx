import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - AutoHunt',
  description: 'Learn how AutoHunt collects, stores, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-[#006557] mb-6">Privacy Policy</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            AutoHunt respects your privacy and is committed to protecting your personal information.
            This policy explains what data we collect, how we use it, and how we keep it secure.
          </p>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
              <p>
                We collect contact details, account information, and listing data needed to support your experience on AutoHunt.
                We may also collect usage data to improve the service and maintain platform stability.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">How We Use Your Data</h2>
              <p>
                Your data is used to operate AutoHunt, process transactions, provide support, and deliver relevant platform features.
                We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
              <p>
                We apply reasonable safeguards to protect your information. While no system can be completely secure,
                we strive to keep your data protected from unauthorized access.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Your Choices</h2>
              <p>
                You can review and update your account information, and you may contact us for questions about your privacy.
                We encourage you to use strong passwords and to keep your contact details up to date.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
