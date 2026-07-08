import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, ListFilter, RotateCcw } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";

const ITEMS_PER_PAGE = 10;

// Helper to parse DD-MM-YYYY string to a comparable Date object
const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const BookingTable = ({ bookings = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  
  // Sorting state
  const [sortOption, setSortOption] = useState("date-newest");

  // UI state
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeActionRow, setActiveActionRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filterRef = useRef(null);
  const actionMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterDropdownOpen(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActiveActionRow(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get unique list of services for the service filter option dynamically
  const uniqueServices = useMemo(() => {
    const services = bookings.map((b) => b.service);
    return ["All", ...new Set(services)];
  }, [bookings]);

  // Reset all filters and sort options
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setServiceFilter("All");
    setSortOption("date-newest");
    setCurrentPage(1);
    setFilterDropdownOpen(false);
  };

  // Filter and sort the bookings list dynamically
  const processedData = useMemo(() => {
    let result = [...bookings];

    // 1. Text Search Filter (match name or service)
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (b) =>
          b.customer.toLowerCase().includes(query) ||
          b.service.toLowerCase().includes(query)
      );
    }

    // 2. Status Filter
    if (statusFilter !== "All") {
      result = result.filter((b) => b.status === statusFilter);
    }

    // 3. Service Filter
    if (serviceFilter !== "All") {
      result = result.filter((b) => b.service === serviceFilter);
    }

    // 4. Sort Options
    result.sort((a, b) => {
      if (sortOption === "date-newest") {
        return parseDate(b.date) - parseDate(a.date);
      }
      if (sortOption === "date-oldest") {
        return parseDate(a.date) - parseDate(b.date);
      }
      if (sortOption === "payment-high") {
        return b.payment - a.payment;
      }
      if (sortOption === "payment-low") {
        return a.payment - b.payment;
      }
      return 0;
    });

    return result;
  }, [bookings, searchTerm, statusFilter, serviceFilter, sortOption]);

  // Pagination calculation
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  const pageData = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, activePage]);

  // Status Badge Colors helper
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "Pending":
        return "bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "Completed":
        return "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold";
      case "Cancelled":
        return "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold";
      default:
        return "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold";
    }
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // Check if any filter is actively applied
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "All" || serviceFilter !== "All" || sortOption !== "date-newest";

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl py-5 px-8 shadow-sm flex flex-col h-full mt-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto relative">
          {/* Search input field */}
          <div className="relative flex-1 sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] text-[#1F2937] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#306BAC] transition-all"
            />
          </div>

          {/* Filter Popover Button */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterDropdownOpen((prev) => !prev)}
              className={`flex items-center justify-center p-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? "bg-[#532C89]/10 border-[#532C89] text-[#532C89] hover:bg-[#532C89]/20"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
              title="Filters & Sorting"
            >
              <ListFilter size={18} />
            </button>

            {/* Filter options panel dropdown */}
            {filterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 animate-fade-in">
                <div className="space-y-4">
                  {/* Sorting Options */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortOption}
                      onChange={(e) => {
                        setSortOption(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-[#F3F4F6] text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#306BAC]"
                    >
                      <option value="date-newest">Date: Newest First</option>
                      <option value="date-oldest">Date: Oldest First</option>
                      <option value="payment-high">Payment: High to Low</option>
                      <option value="payment-low">Payment: Low to High</option>
                    </select>
                  </div>

                  {/* Status Filters */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-[#F3F4F6] text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#306BAC]"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Service Filters */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Service
                    </label>
                    <select
                      value={serviceFilter}
                      onChange={(e) => {
                        setServiceFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-[#F3F4F6] text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#306BAC]"
                    >
                      {uniqueServices.map((service) => (
                        <option key={service} value={service}>
                          {service === "All" ? "All Services" : service}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reset Filters action */}
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="w-full flex items-center justify-center gap-1 text-xs font-bold text-red-500 hover:text-red-600 mt-2 py-1.5 border border-red-100 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <RotateCcw size={12} />
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Table using scroll wrapper for responsive swipe on mobile */}
      <TableScrollWrapper minWidth="768px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Customer</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Service</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Payment</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Time</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 relative">
            {pageData.length > 0 ? (
              pageData.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {booking.customer}
                  </td>
                  <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                    {booking.service}
                  </td>
                  <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                    {booking.payment} Tk
                  </td>
                  <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                    {booking.date}
                  </td>
                  <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                    {booking.time}
                  </td>
                  <td className="py-4 text-sm whitespace-nowrap">
                    <span className={getStatusBadge(booking.status)}>{booking.status}</span>
                  </td>
                  <td className="py-4 text-sm text-right whitespace-nowrap relative">
                    <button
                      onClick={() => setActiveActionRow(activeActionRow === booking.id ? null : booking.id)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Simple Action Dropdown */}
                    {activeActionRow === booking.id && (
                      <div
                        ref={actionMenuRef}
                        className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
                      >
                        <button
                          onClick={() => {
                            alert(`Viewing booking details for ${booking.customer}`);
                            setActiveActionRow(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            alert(`Editing booking for ${booking.customer}`);
                            setActiveActionRow(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Edit Booking
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-10 text-center text-sm text-gray-400">
                  No bookings found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScrollWrapper>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-1.5 mt-5">
          <button
            onClick={() => handlePageChange(activePage - 1)}
            disabled={activePage === 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  activePage === pageNum
                    ? "bg-[#306BAC] text-white"
                    : "text-gray-500 hover:bg-gray-50 border border-transparent"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(activePage + 1)}
            disabled={activePage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
