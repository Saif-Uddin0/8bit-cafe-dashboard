import React, { useState, useRef, useEffect } from "react";
import { Search, ListFilter, RotateCcw } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";
import ActionCell from "../global/ActionCell";
import Pagination from "../global/Pagination";
import LeadDetailModal from "./LeadDetailModal";

const ITEMS_PER_PAGE = 10;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Main Table ───────────────────────────────────────────────────────────────
const LeadsTable = ({
  leads = [],
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchTerm = "",
  onSearchChange,
  sortOrder = "newest",
  onSortChange,
  statusFilter = "all",
  onFilterChange,
  isLoading = false,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasFilters = searchTerm || statusFilter !== "all" || sortOrder !== "newest";

  const handleReset = () => {
    if (onSearchChange) onSearchChange("");
    if (onFilterChange) onFilterChange("all");
    if (onSortChange) onSortChange("newest");
    onPageChange(1);
    setFilterOpen(false);
  };

  // Server handles filtering & pagination; client only sorts within the current page
  const processed = [...leads].sort((a, b) => {
    const dA = new Date(a.createdAt), dB = new Date(b.createdAt);
    return sortOrder === "oldest" ? dA - dB : dB - dA;
  });

  const curPage = currentPage;
  const pageData = processed;

  return (
    <>
      <div className="bg-white border border-gray-200/80 rounded-2xl py-5 px-8 shadow-sm mt-6 relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
            <div className="w-8 h-8 border-3 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h2 className="text-xl font-bold text-gray-800">All Customers</h2>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  onPageChange(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#306BAC]"
              />
            </div>

            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${hasFilters
                    ? "bg-[#532C89]/10 border-[#532C89] text-[#532C89]"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                title="Filters & Sort"
              >
                <ListFilter size={17} />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 space-y-3">
                  {[
                    {
                      label: "Sort By",
                      value: sortOrder,
                      setter: onSortChange,
                      options: [
                        ["newest", "Date: Newest First"],
                        ["oldest", "Date: Oldest First"],
                      ],
                    },
                    {
                      label: "Status",
                      value: statusFilter,
                      setter: onFilterChange,
                      options: [
                        ["all", "All Statuses"],
                        ["ACTIVE", "Active"],
                        ["INACTIVE", "Inactive"],
                      ],
                    },
                  ].map(({ label, value, setter, options }) => (
                    <div key={label}>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                        {label}
                      </p>
                      <select
                        value={value}
                        onChange={(e) => {
                          setter?.(e.target.value);
                          onPageChange(1);
                        }}
                        className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                      >
                        {options.map(([val, text]) => (
                          <option key={val} value={val}>
                            {text}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {hasFilters && (
                    <button
                      onClick={handleReset}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <RotateCcw size={11} /> Reset Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <TableScrollWrapper minWidth="750px">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[5%]">
                  No.
                </th>
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[25%]">
                  Name
                </th>
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[30%]">
                  Email
                </th>
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[15%]">
                  Phone
                </th>
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[12%]">
                  Status
                </th>
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[13%]">
                  Joined
                </th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right w-[5%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pageData.length > 0 ? (
                pageData.map((lead, index) => {
                  const absoluteIndex = (curPage - 1) * ITEMS_PER_PAGE + index + 1;
                  const formattedIndex = String(absoluteIndex).padStart(2, "0");
                  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—";
                  const isActive = lead.status === "ACTIVE";

                  return (
                    <tr key={lead.id || lead._id || index} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 pr-6 text-sm text-gray-400 font-medium whitespace-nowrap">
                        {formattedIndex}
                      </td>
                      <td className="py-4 pr-6 whitespace-nowrap truncate max-w-[200px]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 truncate" title={fullName}>
                            {fullName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-6 text-sm text-gray-600 font-medium whitespace-nowrap truncate max-w-[220px]" title={lead.email}>
                        {lead.email || "—"}
                      </td>
                      <td className="py-4 pr-6 text-sm text-gray-600 font-medium whitespace-nowrap">
                        {lead.phone || "—"}
                      </td>
                      <td className="py-4 pr-6 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(lead.createdAt)}
                      </td>
                      <ActionCell onView={() => setSelectedLead(lead)} />
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-sm text-gray-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScrollWrapper>

        {/* Pagination */}
        <Pagination currentPage={curPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>

      {/* View Details Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  );
};

export default LeadsTable;
