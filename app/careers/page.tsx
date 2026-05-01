import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Careers - AutoHunt',
  description: 'Explore career opportunities and join the AutoHunt team.',
};

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      <main className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-[#006557] mb-6">Careers at AutoHunt</h1>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Join AutoHunt and help build a modern car marketplace that connects buyers and sellers across Vietnam.
            We are always looking for talented people who want to make car buying and selling easier.
          </p>

          <section className="space-y-6 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-2xl font-semibold mb-3">Open Positions</h2>
              <p>
                We welcome applicants for roles in product development, engineering, design, and customer support.
                If you have a passion for technology and automotive commerce, we would love to hear from you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">Why Work with Us</h2>
              <p>
                AutoHunt offers a collaborative environment, opportunities to learn, and a chance to shape the future of online car trading.
                You will work with a dedicated team building a product that serves real users.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-3">How to Apply</h2>
              <p>
                To apply, send your resume and a brief introduction to our team email. We will review your application and contact
                you with the next steps.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
