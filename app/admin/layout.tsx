import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin - AutoHunt",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f9fafb]">
      {/* Sidebar nằm cố định bên trái */}
      <AdminSidebar />

      {/* Khu vực nội dung bên phải */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Trong thiết kế Figma, không có thanh Header trắng nằm ngang ở đây.
          Tiêu đề trang (ví dụ: "Dashboard") sẽ nằm trong component con (page.tsx).
        */}
        
        {/* Main Content: Cho phép cuộn dọc nếu nội dung dài */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}