"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Bell,
  Ticket,
  CreditCard,
  BarChart3,
  Headset,
  PlusCircle,
  List,
  MessageSquare,
  LogOut,
} from "lucide-react";

// --- CẬP NHẬT MÃ MÀU MỚI TẠI ĐÂY ---
const ACTIVE_BG = "bg-[#4EA674]";           // Màu nền khi Active
const HOVER_BG = "hover:bg-[#4EA674]/10";   // Màu nền mờ khi Hover
const HOVER_TEXT = "hover:text-[#4EA674]";  // Màu chữ khi Hover

type MenuItemProps = {
  label: string;
  icon: React.ReactNode;
  href: string;
  active?: boolean;
};

// --- Helper Component ---
function NavItem({ label, icon, href, active = false }: MenuItemProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-md text-[14px] font-medium transition-all duration-200 mb-1
        ${
          active
            ? `${ACTIVE_BG} text-white shadow-sm` // Active: Nền xanh #4EA674, chữ trắng
            : `text-gray-500 ${HOVER_BG} ${HOVER_TEXT}` // Inactive: Hover ra màu xanh
        }
      `}
    >
      {/* Clone icon để truyền prop size, ép kiểu cụ thể để tránh lỗi TypeScript */}
      <span className={active ? "text-white" : "text-gray-400"}>
        {React.cloneElement(icon as React.ReactElement<{ size: number }>, {
          size: 20,
        })}
      </span>
      <span>{label}</span>
    </Link>
  );
}

// --- Main Sidebar Component ---
export default function AdminSidebar() {
  const pathname = usePathname() || "";

  // Hàm helper để check active
  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen flex-shrink-0 z-20 sticky top-0">
      {/* 1. Logo Section */}
      <div className="h-20 flex items-center px-6 pt-4 pb-2 mb-2">
        <Link href="/" className="flex flex-col items-center gap-0.1">
          {/* Logo Image */}
          <Image
            src="/logoautohunt.png"
            alt="AutoHunt Logo"
            width={200}
            height={0}
            className="object-contain"
            priority
          />
          {/* Brand name */}
          <span className="text-sm font-bold text-[#006557] leading-none -mt-7">
            AutoHunt
          </span>
        </Link>
      </div>

      {/* 2. Menu Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <NavItem
          label="Dashboard"
          icon={<LayoutDashboard />}
          href="/dashboard"
          active={isActive("/dashboard")}
        />

        <NavItem
          label="Order Management"
          icon={<ShoppingCart />}
          href="/orders"
          active={isActive("/orders")}
        />

        <NavItem
          label="Customers"
          icon={<Users />}
          href="/customers"
          active={isActive("/customers")}
        />

        <NavItem
          label="Notifications User"
          icon={<Bell />}
          href="/notifications"
          active={isActive("/notifications")}
        />

        <NavItem
          label="Coupon Code"
          icon={<Ticket />}
          href="/coupons"
          active={isActive("/coupons")}
        />

        <NavItem
          label="Transaction"
          icon={<CreditCard />}
          href="/transactions"
          active={isActive("/transactions")}
        />

        <NavItem
          label="Finance"
          icon={<BarChart3 />}
          href="/finance"
          active={isActive("/finance")}
        />

        <NavItem
          label="Support"
          icon={<Headset />}
          href="/support"
          active={isActive("/support")}
        />

        {/* Separator Label */}
        <div className="mt-8 mb-3 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Cars
        </div>

        <NavItem
          label="Add Cars"
          icon={<PlusCircle />}
          href="/cars/add"
          active={isActive("/cars/add")}
        />

        <NavItem
          label="Cars List"
          icon={<List />}
          href="/cars"
          active={isActive("/cars")}
        />

        <NavItem
          label="Car Reviews"
          icon={<MessageSquare />}
          href="/cars/reviews"
          active={isActive("/cars/reviews")}
        />
      </div>

{/* 3. Footer: Logout Button */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <button 
          onClick={() => {
            // Thêm logic xử lý đăng xuất của bạn tại đây (vd: signOut(), xoá token, redirect...)
            console.log("User logged out");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-[14px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}