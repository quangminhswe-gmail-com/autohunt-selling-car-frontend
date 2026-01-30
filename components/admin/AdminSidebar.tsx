"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Order Management", href: "/orders" },
  { label: "Customers", href: "/customers" },
  { label: "Notifications", href: "/notifications" },
  { label: "Coupon Code", href: "/coupons" },
  { label: "Transaction", href: "/transactions" },
  { label: "Finance", href: "/finance" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r px-4 py-6">
      {/* Logo */}
      <div className="text-xl font-bold text-teal-700 mb-8">
        AutoHunt Admin
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg text-sm font-medium
                ${
                  isActive
                    ? "bg-teal-100 text-teal-700"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
