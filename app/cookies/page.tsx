import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy - AutoHunt',
  description: 'Understand how AutoHunt uses cookies and similar technologies on the website.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-[#006557] mb-6">Cookie Policy</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            AutoHunt uses cookies and similar technologies to improve your experience, analyze usage, and support site functionality.
            This page explains how we use cookies and what options you have.
          </p>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help remember preferences,
                support navigation, and provide analytics information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">How We Use Cookies</h2>
              <p>
                We use cookies to keep you signed in, remember your settings, and improve the responsiveness of AutoHunt.
                We may also use cookies for analytics to understand how visitors use the site.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Managing Cookies</h2>
              <p>
                Most browsers allow you to control cookie settings. You can choose to block or delete cookies, but some features
                of AutoHunt may not work correctly if cookies are disabled.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Third-Party Cookies</h2>
              <p>
                Some third-party services may place cookies when you use AutoHunt. These cookies are governed by the providers' policies,
                and AutoHunt does not control those third-party cookie practices.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
