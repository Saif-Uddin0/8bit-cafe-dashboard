import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxios";
import LeadsStatCards from "../../components/leads/LeadsStatCards";
import LeadsTable from "../../components/leads/LeadsTable";

const Leads = () => {
  const axiosSecure = useAxiosSecure();
  const [currentPage,  setCurrentPage]  = useState(1);
  const [searchTerm,   setSearchTerm]   = useState("");
  const [sortOrder,    setSortOrder]    = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "ACTIVE" | "INACTIVE"

  // ── Paginated leads query (changes with filters) ──────────────────────────
  const { data: leadsResponse, isLoading, isError } = useQuery({
    queryKey: ["leads", currentPage, searchTerm, sortOrder, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        role:  "USER",
        page:  String(currentPage),
        limit: "10",
      });
      if (searchTerm.trim())      params.append("searchTerm", searchTerm.trim());
      if (statusFilter !== "all") params.append("status",     statusFilter);
      const res = await axiosSecure.get(`/api/user/allUsers?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // ── Stats query — NEVER filtered, stat cards never change ─────────────────
  const { data: statsResponse } = useQuery({
    queryKey: ["leads", "stats"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/allUsers?role=USER&limit=10000");
      return res.data;
    },
  });

  // ── Normalise paginated response (table + pagination only) ────────────────
  const body       = leadsResponse?.data ?? leadsResponse ?? {};
  const meta       = body?.meta ?? {};
  const leads      = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
  const totalItems = meta?.total ?? leads.length;
  const totalPages = meta?.totalPage || Math.ceil(totalItems / 10) || 1;
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  // ── Stats — always from full unfiltered dataset ───────────────────────────
  const statsBody     = statsResponse?.data ?? statsResponse ?? {};
  const allLeads      = Array.isArray(statsBody?.data) ? statsBody.data : Array.isArray(statsBody) ? statsBody : [];
  const totalLeads    = allLeads.length;
  const activeLeads   = allLeads.filter((u) => u.status === "ACTIVE").length;
  const inactiveLeads = allLeads.filter((u) => u.status !== "ACTIVE").length;

  const handleSearch = (val) => { setSearchTerm(val);   setCurrentPage(1); };
  const handleSort   = (val) => { setSortOrder(val);    setCurrentPage(1); };
  const handleFilter = (val) => { setStatusFilter(val); setCurrentPage(1); };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {isLoading && !leads.length ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-semibold text-sm">Loading leads data...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">Failed to load leads database.</p>
        </div>
      ) : (
        <>
          {/* Stat Cards — always shows unfiltered totals */}
          <LeadsStatCards
            totalLeads={allLeads.length ? totalLeads : undefined}
            activeLeads={allLeads.length ? activeLeads : undefined}
            inactiveLeads={allLeads.length ? inactiveLeads : undefined}
          />

          {/* Table */}
          <LeadsTable
            leads={leads}
            totalPages={totalPages}
            currentPage={activePage}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            sortOrder={sortOrder}
            onSortChange={handleSort}
            statusFilter={statusFilter}
            onFilterChange={handleFilter}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
};

export default Leads;