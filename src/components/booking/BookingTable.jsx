import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MoreVertical, ChevronLeft, ChevronRight, ListFilter, RotateCcw } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";

const ITEMS_PER_PAGE = 10;

// Parse DD-MM-YYYY to Date
const parseDate = (str) => {
  const [d, m, y] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// Status badge styles
const STATUS_STYLES = {
  Paid:      "bg-green-100 text-green-700",
  Pending:   "bg-amber-100 text-amber-700",
  Completed: "bg-blue-100 text-blue-700",
  Cancelled: "bg-red-100 text-red-700",
};

const BookingTable = ({ bookings = [] }) => {
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("All");
  const [service, setService]       = useState("All");
  const [sort, setSort]             = useState("date-newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeRow, setActiveRow]   = useState(null);
  const [page, setPage]             = useState(1);

  const filterRef = useRef(null);
  const menuRef   = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (menuRef.current   && !menuRef.current.contains(e.target))   setActiveRow(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Unique services list for dropdown
  const services = useMemo(() => ["All", ...new Set(bookings.map((b) => b.service))], [bookings]);

  // Filtered + sorted data
  const processed = useMemo(() => {
    let data = bookings.filter((b) => {
      const q = search.toLowerCase();
      return (
        (!q || b.customer.toLowerCase().includes(q) || b.service.toLowerCase().includes(q)) &&
        (status  === "All" || b.status  === status)  &&
        (service === "All" || b.service === service)
      );
    });

    data.sort((a, b) => {
      if (sort === "date-newest")  return parseDate(b.date) - parseDate(a.date);
      if (sort === "date-oldest")  return parseDate(a.date) - parseDate(b.date);
      if (sort === "payment-high") return b.payment - a.payment;
      if (sort === "payment-low")  return a.payment - b.payment;
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
              className={`p-2 rounded-lg border transition-colors ${hasFilters ? "bg-[#532C89]/10 border-[#532C89] text-[#532C89]" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"}`}
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
                    ["All","All Statuses"],["Paid","Paid"],["Pending","Pending"],["Completed","Completed"],["Cancelled","Cancelled"],
                  ]},
                  { label: "Service", value: service, setter: setService, options: services.map((s) => [s, s === "All" ? "All Services" : s]) },
                ].map(({ label, value, setter, options }) => (
                  <div key={label}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <select
                      value={value}
                      onChange={(e) => { setter(e.target.value); setPage(1); }}
                      className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
                    </select>
                  </div>
                ))}

                {hasFilters && (
                  <button onClick={resetFilters} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 py-1.5 rounded-lg transition-colors">
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
              {["Customer", "Service", "Payment", "Date", "Time", "Status", "Action"].map((h) => (
                <th key={h} className={`pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Action" ? "pr-0" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length > 0 ? pageData.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 pr-6 text-sm font-semibold text-gray-800 whitespace-nowrap">{b.customer}</td>
                <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">{b.service}</td>
                <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">{b.payment} Tk</td>
                <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">{b.date}</td>
                <td className="py-4 pr-6 text-sm text-gray-600 whitespace-nowrap">{b.time}</td>
                <td className="py-4 pr-6 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[b.status] || "bg-gray-100 text-gray-600"}`}>
                    {b.status}
                  </span>
                </td>
                <td className="py-4 whitespace-nowrap relative">
                  <button
                    onClick={() => setActiveRow(activeRow === b.id ? null : b.id)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeRow === b.id && (
                    <div ref={menuRef} className="absolute left-0 top-12 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                      <button onClick={() => setActiveRow(null)} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">View Details</button>
                      <button onClick={() => setActiveRow(null)} className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">Edit Booking</button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
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
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                curPage === n ? "bg-[#306BAC] text-white" : "text-gray-500 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={curPage === totalPages}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingTable;
