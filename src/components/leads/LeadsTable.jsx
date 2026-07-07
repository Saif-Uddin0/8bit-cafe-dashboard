import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";

// Mock customer leads data (25 entries)
const mockLeads = [
  { name: "Amara Osei", email: "amara.osei@gmail.com", phone: "0123456789", date: "05-06-2026" },
  { name: "John Smith", email: "john.smith@gmail.com", phone: "0172635489", date: "06-06-2026" },
  { name: "Sarah Connor", email: "sarah.c@gmail.com", phone: "0152435467", date: "07-06-2026" },
  { name: "David Miller", email: "david.m@gmail.com", phone: "0192837465", date: "08-06-2026" },
  { name: "James Wilson", email: "james.w@gmail.com", phone: "0182736455", date: "09-06-2026" },
  { name: "Emily Davis", email: "emily.d@gmail.com", phone: "0132435465", date: "10-06-2026" },
  { name: "Michael Brown", email: "michael.b@gmail.com", phone: "0142536475", date: "11-06-2026" },
  { name: "Jessica Taylor", email: "jessica.t@gmail.com", phone: "0162738495", date: "12-06-2026" },
  { name: "Daniel Jones", email: "daniel.j@gmail.com", phone: "0112233445", date: "13-06-2026" },
  { name: "Ashley Garcia", email: "ashley.g@gmail.com", phone: "0155667788", date: "14-06-2026" },
  { name: "Robert Martinez", email: "robert.m@gmail.com", phone: "0166778899", date: "15-06-2026" },
  { name: "Linda Anderson", email: "linda.a@gmail.com", phone: "0177889900", date: "16-06-2026" },
  { name: "William Taylor", email: "william.t@gmail.com", phone: "0188990011", date: "17-06-2026" },
  { name: "Elizabeth Thomas", email: "elizabeth.t@gmail.com", phone: "0199001122", date: "18-06-2026" },
  { name: "Richard Jackson", email: "richard.j@gmail.com", phone: "0122113344", date: "19-06-2026" },
  { name: "Susan White", email: "susan.w@gmail.com", phone: "0133224455", date: "20-06-2026" },
  { name: "Joseph Harris", email: "joseph.h@gmail.com", phone: "0144335566", date: "21-06-2026" },
  { name: "Karen Martin", email: "karen.m@gmail.com", phone: "0155446677", date: "22-06-2026" },
  { name: "Thomas Thompson", email: "thomas.t@gmail.com", phone: "0166557788", date: "23-06-2026" },
  { name: "Lisa Garcia", email: "lisa.g@gmail.com", phone: "0177668899", date: "24-06-2026" },
  { name: "Charles Martinez", email: "charles.m@gmail.com", phone: "0188779900", date: "25-06-2026" },
  { name: "Nancy Robinson", email: "nancy.r@gmail.com", phone: "0199880011", date: "26-06-2026" },
  { name: "Matthew Clark", email: "matthew.c@gmail.com", phone: "0122003344", date: "27-06-2026" },
  { name: "Sandra Rodriguez", email: "sandra.r@gmail.com", phone: "0133004455", date: "28-06-2026" },
  { name: "Paul Lewis", email: "paul.l@gmail.com", phone: "0144005566", date: "29-06-2026" },
];

const ITEMS_PER_PAGE = 10;

// Parse DD-MM-YYYY string to a comparable Date object
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

// Get today's and this week's boundaries (using today as reference)
const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
const getWeekStart = () => {
  const today = getToday();
  const day = today.getDay(); // 0 = Sun
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(today.setDate(diff));
};

// Sort / filter options
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
];

const LeadsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Process data: filter → date-filter/sort → slice
  const processedData = useMemo(() => {
    let result = [...mockLeads];

    // Filter by name or phone number
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.phone.includes(query)
      );
    }

    // Apply date sort / filter
    const today = getToday();
    const weekStart = getWeekStart();

    if (sortOption === "today") {
      result = result.filter((lead) => {
        const d = parseDate(lead.date);
        return d.toDateString() === today.toDateString();
      });
    } else if (sortOption === "this_week") {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      result = result.filter((lead) => {
        const d = parseDate(lead.date);
        return d >= weekStart && d <= weekEnd;
      });
    } else if (sortOption === "newest") {
      result.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    } else if (sortOption === "oldest") {
      result.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    }

    return result;
  }, [searchTerm, sortOption]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  const pageData = useMemo(() => {
    const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
    return processedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedData, activePage]);

  // Handlers
  const handleSortSelect = (value) => {
    setSortOption(value);
    setDropdownOpen(false);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full mt-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h2 className="text-xl font-bold text-gray-800">All Leads</h2>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search bar — name & phone */}
          <div className="relative flex-1 sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
              <Search size={16} />
            </span>
            <input
              id="leads-search"
              type="text"
              placeholder="Search by name or phone number"
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] text-[#1F2937] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#306BAC] transition-all"
            />
          </div>

          {/* Date sort dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="leads-sort-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <span className="hidden xs:inline">{selectedLabel}</span>
              <span className="xs:hidden">Sort</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    id={`sort-option-${opt.value}`}
                    onClick={() => handleSortSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      sortOption === opt.value
                        ? "bg-[#532C89]/10 text-[#306BAC] font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                    {sortOption === opt.value && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#532C89] inline-block" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table — horizontal scroll using reusable scroll wrapper */}
      <TableScrollWrapper minWidth="640px">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">No.</th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Email</th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Phone</th>
              <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageData.length > 0 ? (
              pageData.map((lead, index) => {
                const absoluteIndex = (activePage - 1) * ITEMS_PER_PAGE + index + 1;
                const formattedIndex = String(absoluteIndex).padStart(2, "0");
                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 pr-4 text-sm text-gray-400 font-medium whitespace-nowrap">{formattedIndex}</td>
                    <td className="py-4 pr-4 text-sm font-semibold text-gray-800 whitespace-nowrap">{lead.name}</td>
                    <td className="py-4 pr-4 text-sm text-gray-600 whitespace-nowrap">{lead.email}</td>
                    <td className="py-4 pr-4 text-sm text-gray-600 whitespace-nowrap">{lead.phone}</td>
                    <td className="py-4 pr-4 text-sm text-gray-600 whitespace-nowrap">{lead.date}</td>
                    <td className="py-4 text-sm text-right whitespace-nowrap">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-8 text-center text-sm text-gray-400">
                  {sortOption === "today"
                    ? "No leads found for today."
                    : sortOption === "this_week"
                    ? "No leads found for this week."
                    : "No leads found matching your search."}
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

export default LeadsTable;
