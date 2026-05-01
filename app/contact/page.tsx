import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contact - AutoHunt',
  description: 'Contact information for the AutoHunt development team and project representatives.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-[#006557] mb-4">Contact Us</h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Below is our project team contact table for AutoHunt. If you need more information or support,
              please reach out to the right team members by email.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold">No</th>
                  <th className="px-6 py-4 text-sm font-semibold">Full name</th>
                  <th className="px-6 py-4 text-sm font-semibold">Represent for</th>
                  <th className="px-6 py-4 text-sm font-semibold">Contact info</th>
                  <th className="px-6 py-4 text-sm font-semibold">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="bg-white">
                  <td className="px-6 py-4 text-sm text-slate-700">1</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Mr. Huynh Phuoc Danh</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Van Lang University</td>
                  <td className="px-6 py-4 text-sm text-slate-700">-</td>
                  <td className="px-6 py-4 text-sm text-slate-700">-</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">2</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Pham Quang Minh</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Development team</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    Minh.2274801030089@vanlanguni.vn
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">Project Manager, Developer</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4 text-sm text-slate-700">3</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Chau Gia Hao</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Development team</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    Hao.2274801030042@vanlanguni.vn
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">Developer</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-700">4</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Nguyen Thi Xuan</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Development team</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    Xuan.2274801030173@vanlanguni.vn
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">Developer</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4 text-sm text-slate-700">5</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Pham Hoang Nam</td>
                  <td className="px-6 py-4 text-sm text-slate-700">Development team</td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    Nam.2274801030096@vanlanguni.vn
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">Developer</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
