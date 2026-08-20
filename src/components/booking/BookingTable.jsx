import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, ListFilter, RotateCcw } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";
import ActionCell from "../global/ActionCell";
import BookingDetailsModal from "./BookingDetailsModal";

const ITEMS_PER_PAGE = 10;

// Status badge styles
const STATUS_STYLES = {
  PAID:      "bg-green-100 text-green-700",
  PENDING:   "bg-amber-100 text-amber-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
  EXPIRED:   "bg-red-100 text-red-700",
};

const STATUS_LABELS = {
  PAID:      "Paid",
  PENDING:   "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED:   "Expired",
};

// Helper to determine active display status
const getDisplayStatus = (booking) => {
  if (booking.gameStatus === "ENDED") return "COMPLETED";
  return booking.status?.toUpperCase() || "PENDING";
};

// Local helper to format times
const formatTime = (date) => {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

const BookingTable = ({ bookings = [] }) => {
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("All");
  const [service, setService]       = useState("All");
  const [sort, setSort]             = useState("date-newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage]             = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filterRef = useRef(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Unique games list for dropdown
  const services = useMemo(() => {
    const gameNames = bookings.map((b) => b.game?.name).filter(Boolean);
    return ["All", ...new Set(gameNames)];
  }, [bookings]);

  // Filtered + sorted data
  const processed = useMemo(() => {
    let data = bookings.filter((b) => {
      const q = search.toLowerCase();
      const customerName = `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.toLowerCase();
      const gameName = (b.game?.name || "").toLowerCase();
      const displayStatus = getDisplayStatus(b);

      return (
        (!q || customerName.includes(q) || gameName.includes(q)) &&
        (status  === "All" || displayStatus === status)  &&
        (service === "All" || b.game?.name === service)
      );
    });

    data.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      const amtA  = Number(a.totalAmount) || 0;
      const amtB  = Number(b.totalAmount) || 0;

      if (sort === "date-newest")  return timeB - timeA;
      if (sort === "date-oldest")  return timeA - timeB;
      if (sort === "payment-high") return amtB - amtA;
      if (sort === "payment-low")  return amtA - amtB;
      return 0;
    });

    return data;
  }, [bookings, search, status, service, sort]);

  // Pagination
  const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);
  const curPage    = Math.min(page, Math.max(totalPages, 1));
  const pageData   = processed.slice((curPage - 1) * ITEMS_PER_PAGE, curPage * ITEMS_PER_PAGE);

  const hasFilters = search || status !== "All" || service !== "All" || sort !== "date-newest";

  const resetFilters = () => {
    setSearch(""); setStatus("All"); setService("All");
    setSort("date-newest"); setPage(1); setFilterOpen(false);
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl py-5 px-8 shadow-sm mt-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#306BAC]"
            />
          </div>

          {/* Filter button + dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen((v) => !v)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${hasFilters ? "bg-[#532C89]/10 border-[#532C89] text-[#532C89]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
              title="Filters & Sort"
            >
              <ListFilter size={17} />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 space-y-3">
                {[
                  { label: "Sort By", value: sort, setter: setSort, options: [
                    ["date-newest", "Date: Newest First"],
                    ["date-oldest", "Date: Oldest First"],
                    ["payment-high", "Payment: High → Low"],
                    ["payment-low",  "Payment: Low → High"],
                  ]},
                  { label: "Status", value: status, setter: setStatus, options: [
                    ["All","All Statuses"],
                    ["PAID","Paid"],
                    ["PENDING","Pending"],
                    ["COMPLETED","Completed"],
                    ["CANCELLED","Cancelled"],
                    ["EXPIRED","Expired"],
                  ]},
                  { label: "Game / Service", value: service, setter: setService, options: services.map((s) => [s, s === "All" ? "All Games" : s]) },
                ].map(({ label, value, setter, options }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <select
                      value={value}
                      onChange={(e) => { setter(e.target.value); setPage(1); }}
                      className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                    >
                      {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
                    </select>
                  </div>
                ))}

                {hasFilters && (
                  <button onClick={resetFilters} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 py-1.5 rounded-lg transition-colors cursor-pointer">
                    <RotateCcw size={11} /> Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <TableScrollWrapper minWidth="720px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              {["Customer", "Game / Service", "Payment", "Date", "Time Range", "Status"].map((h) => (
                <th key={h} className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length > 0 ? pageData.map((b) => {
              const start = new Date(b.startTime);
              const end = new Date(start.getTime() + (b.durationMin || 0) * 60 * 1000);
              const dateStr = start.toLocaleDateString("en-GB").split("/").join("-");
              const timeStr = `${formatTime(start)} - ${formatTime(end)}`;
              const displayStatus = getDisplayStatus(b);

              return (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 pr-6 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {b.user ? `${b.user.firstName || "—"} ${b.user.lastName || ""}` : "—"}
                  </td>
                  <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap truncate max-w-[180px]">
                    {b.game?.name || "—"}
                  </td>
                  <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">
                    ৳{b.totalAmount || "0"}
                  </td>
                  <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">{dateStr}</td>
                  <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">{timeStr}</td>
                  <td className="py-4 pr-6 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[displayStatus] || "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[displayStatus]}
                    </span>
                  </td>
                  <ActionCell
                    onView={() => setSelectedBooking(b)}
                  />
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" className="py-10 text-center text-sm text-gray-400">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScrollWrapper>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-1.5 mt-5">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={curPage === 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                curPage === n ? "bg-[#306BAC] text-white" : "text-gray-500 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={curPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Portal Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          bookingId={selectedBooking.id}
          initialData={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
};

export default BookingTable;
