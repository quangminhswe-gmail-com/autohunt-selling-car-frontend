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
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.29 18c7.618 0 11.783-6.868 11.783-12.82 0-.195 0-.39-.013-.582A8.348 8.348 0 0020 3.92a7.83 7.83 0 01-2.26.637A3.995 3.995 0 0019.448 2.96a7.97 7.97 0 01-2.528.974A3.977 3.977 0 0014.696 2c-2.13 0-3.888 1.889-3.888 4.22 0 .33.037.653.111.964-3.23-.163-6.086-1.787-8.006-4.254a4.25 4.25 0 00-.526 2.124c0 1.465.709 2.759 1.794 3.522a3.968 3.968 0 01-1.762-.507v.053c0 2.047 1.397 3.768 3.252 4.154a3.975 3.975 0 01-1.757.072c.497 1.632 1.918 2.823 3.607 2.856A7.995 7.995 0 010 17.112a11.266 11.266 0 006.29 1.888" />
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
