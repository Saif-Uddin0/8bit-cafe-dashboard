import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";

const ITEMS_PER_PAGE = 10;

const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const getWeekStart = () => {
  const today = getToday();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(today.setDate(diff));
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
];

const LeadsTable = ({ leads = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const processedData = useMemo(() => {
    let result = [...leads];

    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.phone.includes(query) ||
          lead.email.toLowerCase().includes(query)
      );
    }

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
  }, [leads, searchTerm, sortOption]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const pageData = processedData.slice((activePage - 1) * ITEMS_PER_PAGE, activePage * ITEMS_PER_PAGE);

  const selectedLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label;

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex flex-col h-full mt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <h2 className="text-xl font-bold text-gray-800">All Leads</h2>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#9CA3AF]">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-[#F3F4F6] text-[#1F2937] text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#306BAC] transition-all"
            />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm font-medium transition-colors whitespace-nowrap"
            >
              <span className="hidden xs:inline">{selectedLabel}</span>
              <span className="xs:hidden">Sort</span>
              <ChevronDown size={15} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortOption(opt.value);
                      setDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      sortOption === opt.value
                        ? "bg-[#532C89]/10 text-[#306BAC] font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {opt.label}
                    {sortOption === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#532C89] inline-block" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
                  <tr key={lead.id || index} className="hover:bg-gray-50/50 transition-colors">
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
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableScrollWrapper>

      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-1.5 mt-5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={activePage === 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                activePage === idx + 1
                  ? "bg-[#306BAC] text-white"
                  : "text-gray-500 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {idx + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
