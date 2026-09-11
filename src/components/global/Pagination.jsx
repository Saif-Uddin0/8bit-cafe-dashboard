import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared Pagination Component
 * Renders consistent and professional pagination design and behavior.
 * Hides itself if totalPages <= 1.
 */
const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  const safeTotalPages = Math.max(1, totalPages || 1);

  // Generate page numbers with smart ellipsis truncation
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      // Determine range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(safeTotalPages - 1, currentPage + 1);

      // Adjust range to always show at least 3 pages in middle if possible
      if (currentPage <= 2) {
        end = 4;
      } else if (currentPage >= safeTotalPages - 1) {
        start = safeTotalPages - 3;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < safeTotalPages - 1) {
        pages.push("...");
      }

      pages.push(safeTotalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-100 select-none">
      {/* Page Info summary */}
      <span className="text-xs font-medium text-gray-500">
        Page <span className="font-semibold text-gray-800">{currentPage}</span> of{" "}
        <span className="font-semibold text-gray-800">{safeTotalPages}</span>
      </span>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage <= 1}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer animate-fade-in"
          title="Previous Page"
        >
          <ChevronLeft size={16} strokeWidth={2.2} />
        </button>

        {/* Numbered Page Buttons */}
        {pages.map((page, idx) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-gray-400"
              >
                ...
              </span>
            );
          }

          const isActive = currentPage === page;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isActive
                  ? "bg-[#306BAC] text-white hover:bg-[#306BAC]"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, safeTotalPages))}
          disabled={currentPage >= safeTotalPages}
          className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-500 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer animate-fade-in"
          title="Next Page"
        >
          <ChevronRight size={16} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
