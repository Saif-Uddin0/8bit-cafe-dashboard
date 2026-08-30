import React, { useState, useRef, useEffect } from "react";
import { Search, ListFilter, RotateCcw } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";
import ActionCell from "../global/ActionCell";
import Pagination from "../global/Pagination";
import TransactionDetailsModal from "./TransactionDetailsModal";

const ITEMS_PER_PAGE = 10;

// Status Badge styles for table
const STATUS_STYLES = {
  SUCCESS: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  CANCELLED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  SUCCESS: "Success",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

const TransactionTable = ({
  transactions = [],
  totalPages = 1,
  currentPage = 1,
  onPageChange,
  searchTerm = "",
  onSearchChange,
  statusFilter = "All",
  onStatusFilterChange,
  typeFilter = "All",
  onTypeFilterChange,
  sort = "date-newest",
  onSortChange,
  onResetFilters,
  isLoading = false,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);

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

  const curPage = currentPage;
  const pageData = transactions;

  const hasFilters = searchTerm || statusFilter !== "All" || typeFilter !== "All" || sort !== "date-newest";

  const handleReset = () => {
    if (onResetFilters) {
      onResetFilters();
    }
    setFilterOpen(false);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl py-5 px-8 shadow-sm mt-6 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
          <div className="w-8 h-8 border-3 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h2 className="text-xl font-bold text-gray-800">All Transactions</h2>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, or IDs..."
              value={searchTerm}
              onChange={(e) => {
                onSearchChange(e.target.value);
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
                    value: sort,
                    setter: onSortChange,
                    options: [
                      ["date-newest", "Date: Newest First"],
                      ["date-oldest", "Date: Oldest First"],
                      ["amount-high", "Amount: High → Low"],
                      ["amount-low", "Amount: Low → High"],
                    ],
                  },
                  {
                    label: "Status",
                    value: statusFilter,
                    setter: onStatusFilterChange,
                    options: [
                      ["All", "All Statuses"],
                      ["SUCCESS", "Success"],
                      ["PENDING", "Pending"],
                      ["CANCELLED", "Cancelled"],
                      ["FAILED", "Failed"],
                    ],
                  },
                  {
                    label: "Payment Type",
                    value: typeFilter,
                    setter: onTypeFilterChange,
                    options: [
                      ["All", "All Types"],
                      ["GAME", "Game Payment"],
                      ["FOOD", "Food Payment"],
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
                        setter(e.target.value);
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
      <TableScrollWrapper minWidth="800px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[5%]">
                No.
              </th>
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[25%]">
                Customer
              </th>
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[12%]">
                Type
              </th>
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[15%]">
                Method
              </th>
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[13%]">
                Amount
              </th>
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[12%]">
                Status
              </th>
              <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[13%]">
                Date
              </th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right w-[5%]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length > 0 ? (
              pageData.map((t, index) => {
                const absoluteIndex = (curPage - 1) * ITEMS_PER_PAGE + index + 1;
                const formattedIndex = String(absoluteIndex).padStart(2, "0");

                // Customer detail resolution
                const customerName = t.customerName || (t.user ? `${t.user.firstName || ""} ${t.user.lastName || ""}`.trim() : "") || "—";
                const customerEmail = t.customerEmail || t.user?.email || "—";

                // Date formatting
                const dateStr = t.createdAt
                  ? new Date(t.createdAt).toLocaleDateString("en-GB").split("/").join("-")
                  : "—";

                const statusUpper = (t.status || "").toUpperCase();
                const typeUpper = (t.paymentType || "").toUpperCase();

                return (
                  <tr key={t.id || index} className="hover:bg-gray-50/50 transition-colors group">
                    {/* Index */}
                    <td className="py-4 pr-6 text-sm text-gray-400 font-medium whitespace-nowrap">
                      {formattedIndex}
                    </td>

                    {/* Customer */}
                    <td className="py-4 pr-6 text-sm whitespace-nowrap truncate max-w-[200px]">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 truncate" title={customerName}>
                          {customerName}
                        </span>
                      </div>
                    </td>

                    {/* Type badge */}
                    <td className="py-4 pr-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700">
                        {typeUpper || "N/A"}
                      </span>
                    </td>

                    {/* Method */}
                    <td className="py-4 pr-6 text-sm text-gray-600 font-medium whitespace-nowrap">
                      {t.paymentMethod || "N/A"}
                    </td>

                    {/* Amount */}
                    <td className="py-4 pr-6 text-sm font-bold text-gray-800 whitespace-nowrap">
                      ৳{t.amount != null ? t.amount : "0"}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 pr-6 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[statusUpper] || "bg-gray-100 text-gray-600"
                        }`}>
                        {STATUS_LABELS[statusUpper] || t.status || "N/A"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">
                      {dateStr}
                    </td>

                    {/* View Action Cell */}
                    <ActionCell onView={() => setSelectedTxn(t)} />
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-10 text-center text-sm text-gray-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScrollWrapper>

      {/* Pagination */}
      <Pagination currentPage={curPage} totalPages={totalPages} onPageChange={onPageChange} />

      {/* Portal Details Modal */}
      {selectedTxn && (
        <TransactionDetailsModal
          transaction={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
};

export default TransactionTable;
