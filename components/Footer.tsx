import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* AutoHunt Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">AutoHunt</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              The trusted marketplace for buying and selling cars directly between
              buyers and sellers.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-white text-sm">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-white text-sm">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.29 20v-7.21H5.733V9.25h2.557V7.151c0-2.537 1.537-3.918 3.771-3.918 1.074 0 2.001.08 2.27.116v2.619h-1.56c-1.223 0-1.463.582-1.463 1.435v1.881h2.909l-.787 3.529h-2.122V20" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M7.75 2h8.5C19.216 2 22 4.784 22 7.75v8.5C22 19.216 19.216 22 16.25 22h-8.5C4.784 22 2 19.216 2 16.25v-8.5C2 4.784 4.784 2 7.75 2zm0 1.5C5.678 3.5 3.5 5.678 3.5 7.75v8.5c0 2.072 2.178 4.25 4.25 4.25h8.5c2.072 0 4.25-2.178 4.25-4.25v-8.5c0-2.072-2.178-4.25-4.25-4.25h-8.5z" />
                  <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 1.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7z" />
                  <circle cx="17.5" cy="6.5" r="1.25" />
                </svg>

              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 AutoHunt. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
