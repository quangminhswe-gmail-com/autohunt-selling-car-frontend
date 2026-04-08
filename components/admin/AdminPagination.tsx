import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;       
  itemsPerPage?: number;    
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage = 10, 
  onPageChange 
}: PaginationProps) {
  
  if (totalItems <= itemsPerPage) {
    return null; 
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- LOGIC TẠO MẢNG TRANG RÚT GỌN CÓ DẤU '...' ---
  const getVisiblePages = (current: number, total: number) => {
    // Nếu tổng số trang nhỏ hơn hoặc bằng 7, hiển thị tất cả
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    // Nếu đang ở gần đầu
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    // Nếu đang ở gần cuối
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    // Nếu đang ở giữa
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-t border-gray-100 gap-4 mt-2">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors ${
          currentPage === 1 
            ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <ChevronLeft size={16} /> Previous
      </button>
      
      <div className="flex flex-wrap justify-center gap-2">
        {visiblePages.map((page, index) => {
          // Xử lý render dấu 3 chấm
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="w-9 h-9 flex items-center justify-center text-gray-400 font-medium">
                ...
              </span>
            );
          }

          // Render nút bấm số trang
          return (
            <button 
              key={`page-${page}`}
              onClick={() => onPageChange(page as number)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                currentPage === page 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium transition-colors ${
          currentPage === totalPages 
            ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}