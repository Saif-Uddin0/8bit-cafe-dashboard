import { useState } from "react";
import { Search, ChevronDown, Filter } from "lucide-react";
import TableScrollWrapper from "../global/TableScrollWrapper";
import ActionCell from "../global/ActionCell";
import Pagination from "../global/Pagination";
import LeadDetailModal from "./LeadDetailModal";

const ITEMS_PER_PAGE = 10;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

const STATUS_FILTERS = [
  { value: "all",      label: "All Status" },
  { value: "ACTIVE",   label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

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
  const [sortDropdown,   setSortDropdown]   = useState(false);
  const [filterDropdown, setFilterDropdown] = useState(false);
  const [selectedLead,   setSelectedLead]   = useState(null);


  // Server handles filtering & pagination; client only sorts within the current page
  const processed = [...leads].sort((a, b) => {
    const dA = new Date(a.createdAt), dB = new Date(b.createdAt);
    return sortOrder === "oldest" ? dA - dB : dB - dA;
  });

  const activePage          = currentPage;
  const selectedSortLabel   = SORT_OPTIONS.find((o) => o.value === sortOrder)?.label;
  const selectedFilterLabel = STATUS_FILTERS.find((o) => o.value === statusFilter)?.label;

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-lg font-bold text-gray-900">All Customers</h2>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => { setFilterDropdown((p) => !p); setSortDropdown(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  statusFilter !== "all"
                    ? "bg-[#532C89]/10 border-[#532C89]/30 text-[#532C89]"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Filter size={12} />
                {selectedFilterLabel}
                <ChevronDown size={12} className={`transition-transform ${filterDropdown ? "rotate-180" : ""}`} />
              </button>
              {filterDropdown && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {STATUS_FILTERS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onFilterChange?.(opt.value); setFilterDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                        statusFilter === opt.value
                          ? "bg-[#532C89]/10 text-[#532C89] font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                      {statusFilter === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#532C89] inline-block" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => { setSortDropdown((p) => !p); setFilterDropdown(false); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer whitespace-nowrap"
              >
                {selectedSortLabel}
                <ChevronDown size={12} className={`transition-transform ${sortDropdown ? "rotate-180" : ""}`} />
              </button>
              {sortDropdown && (
                <div className="absolute right-0 mt-1.5 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { onSortChange?.(opt.value); setSortDropdown(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-xs transition-colors ${
                        sortOrder === opt.value
                          ? "bg-[#532C89]/10 text-[#532C89] font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                      {sortOrder === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-[#532C89] inline-block" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div>
          <TableScrollWrapper minWidth="640px">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">No.</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Phone</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Joined</th>
                  <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center">
                      <div className="flex justify-center">
                        <div className="w-8 h-8 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : processed.length > 0 ? (
                  processed.map((lead, index) => {
                    const absoluteIndex = (activePage - 1) * ITEMS_PER_PAGE + index + 1;
                    const formattedIndex = String(absoluteIndex).padStart(2, "0");
                    const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || "—";
                    const initials = [lead.firstName?.[0], lead.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";
                    const isActive = lead.status === "ACTIVE";

                    return (
                      <tr key={lead.id || lead._id || index} className="group hover:bg-gray-50/60 transition-colors">
                        <td className="py-3.5 pr-4 text-sm text-gray-400 font-medium whitespace-nowrap">{formattedIndex}</td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-semibold text-gray-800">{fullName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-sm text-gray-500 whitespace-nowrap">{lead.email || "—"}</td>
                        <td className="py-3.5 pr-4 text-sm text-gray-500 whitespace-nowrap">{lead.phone || "—"}</td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-400"}`} />
                            {lead.status ?? "—"}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                        <ActionCell onView={() => setSelectedLead(lead)} />
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-sm text-gray-400">
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </TableScrollWrapper>

          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* View Details Modal */}
      {selectedLead && (
        <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </>
  );
};

export default LeadsTable;
