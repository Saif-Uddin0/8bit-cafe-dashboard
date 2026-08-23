import React, { useState, useMemo, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, MoreVertical, ListFilter, RotateCcw,
  Loader2, Eye, X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import useAxiosSecure from "../../hooks/useAxios";
import TableScrollWrapper from "../global/TableScrollWrapper";
import ViewSubAdminModal from "./ViewSubAdminModal";
import Pagination from "../global/Pagination";

const ITEMS_PER_PAGE = 10;

// Initials avatar — first letters of firstName and lastName
const InitialsAvatar = ({ firstName = "", lastName = "" }) => {
  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-[#532C89] flex items-center justify-center shrink-0">
      <span className="text-white text-sm font-bold">{initials}</span>
    </div>
  );
};

const SubAdminTable = ({ admins = [] }) => {
  const axiosSecure  = useAxiosSecure();
  const queryClient  = useQueryClient();

  const [search,      setSearch]      = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [page,        setPage]        = useState(1);
  const [viewAdmin,   setViewAdmin]   = useState(null);

  // For the three-dot action menu
  const [activeRow,   setActiveRow]   = useState(null);
  const menuRef   = useRef({});
  const filterRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
      // Check if click is outside all open menus
      if (activeRow !== null) {
        const menuEl = menuRef.current[activeRow];
        if (menuEl && !menuEl.contains(e.target)) {
          setActiveRow(null);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activeRow]);


  const { mutate: updateStatus, variables: updatingVars, isPending: isStatusPending } = useMutation({
   mutationFn: async ({ adminId, newStatus }) => {
  const res = await axiosSecure.patch(
    "/api/user/update-super-admin-status",
    {
      status: newStatus,
      user: adminId,
    }
  );

  return res.data;
},
    onSuccess: (data) => {
      toast.success(data?.message || "Status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subAdmins"] });
      setActiveRow(null);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update status.";
      toast.error(msg);
    },
  });

  const handleStatusToggle = (admin) => {
    const currentStatus = admin.status?.toUpperCase();
    const newStatus     = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateStatus({ adminId: admin.id, newStatus });
  };

  // ── Client-side filtering ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return admins.filter((a) => {
      const name  = `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase();
      const email = (a.email ?? "").toLowerCase();
      const matchSearch = !q || name.includes(q) || email.includes(q);
      const normalizedStatus = (a.status ?? "").toUpperCase();
      const matchStatus =
        statusFilter === "All" ||
        (statusFilter === "Active"   && normalizedStatus === "ACTIVE") ||
        (statusFilter === "Inactive" && normalizedStatus === "INACTIVE");
      return matchSearch && matchStatus;
    });
  }, [admins, search, statusFilter]);

  // ── Client-side pagination ──
  const totalPages = Math.max(Math.ceil(filtered.length / ITEMS_PER_PAGE), 1);
  const curPage    = Math.min(page, totalPages);
  const pageData   = filtered.slice((curPage - 1) * ITEMS_PER_PAGE, curPage * ITEMS_PER_PAGE);

  const hasFilters = search || statusFilter !== "All";

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPage(1);
    setFilterOpen(false);
  };

  const statusBadge = (status) => {
    const upper = (status ?? "").toUpperCase();
    if (upper === "ACTIVE")   return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold";
    return "bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold";
  };

  return (
    <>
      <div className="bg-white border border-gray-200/80 rounded-2xl py-5 px-6 shadow-sm">

        {/* Header + Search + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-base font-bold text-gray-800">All Sub-Admins</h2>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-[#532C89]"
              />
            </div>

            {/* Filter button */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`p-2 rounded-lg border transition-colors ${
                  hasFilters
                    ? "bg-[#532C89]/10 border-[#532C89] text-[#532C89]"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                }`}
                title="Filters"
              >
                <ListFilter size={17} />
              </button>

              {filterOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                      className="w-full bg-gray-100 text-gray-700 text-sm rounded-lg px-2 py-1.5 focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  {hasFilters && (
                    <button
                      onClick={resetFilters}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
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
        <TableScrollWrapper minWidth="600px">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-6 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap w-[5%]">No.</th>
                {["Avatar", "Name", "Role", "Email", "Status"].map((h) => (
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
              {pageData.length > 0 ? pageData.map((admin, index) => {
                const absoluteIndex = (curPage - 1) * ITEMS_PER_PAGE + index + 1;
                const formattedIndex = String(absoluteIndex).padStart(2, "0");
                const fullName      = `${admin.firstName ?? ""} ${admin.lastName ?? ""}`.trim();
                const normalStatus  = (admin.status ?? "").toUpperCase();
                const isUpdating    = isStatusPending && updatingVars?.adminId === admin.id;

                return (
                  <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Row Number */}
                    <td className="py-4 pr-6 text-sm text-gray-400 font-medium whitespace-nowrap">{formattedIndex}</td>

                    {/* Avatar */}
                    <td className="py-4 pr-6 whitespace-nowrap">
                      {admin.image ? (
                        <img
                          src={admin.image}
                          alt={fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <InitialsAvatar firstName={admin.firstName} lastName={admin.lastName} />
                      )}
                    </td>

                    {/* Name */}
                    <td className="py-4 pr-6 text-sm font-semibold text-gray-800 whitespace-nowrap">
                      {fullName || "—"}
                    </td>

                    {/* Role */}
                    <td className="py-4 pr-6 text-sm text-gray-500 whitespace-nowrap">
                      {admin.role ?? "—"}
                    </td>

                    {/* Email */}
                    <td className="py-4 pr-6 text-sm text-gray-500 whitespace-nowrap">
                      {admin.email ?? "—"}
                    </td>

                    {/* Status badge */}
                    <td className="py-4 pr-6 whitespace-nowrap">
                      <span className={statusBadge(admin.status)}>
                        {normalStatus === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Action — matching ActionCell style from Food/Game pages */}
                    <td className="py-4 text-right whitespace-nowrap">
                      {isUpdating ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400">
                          <Loader2 size={12} className="animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        <div ref={(el) => (menuRef.current[admin.id] = el)} className="relative inline-block">
                          {/* Three-dot trigger */}
                          <button
                            onClick={() => setActiveRow(activeRow === admin.id ? null : admin.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer border-none bg-transparent"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {/* Horizontal inline popup — same as ActionCell */}
                          {activeRow === admin.id && (
                            <div
                              className="absolute right-0 top-9 z-50 flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-lg px-2.5 py-2"
                              style={{ animation: "popIn 0.15s ease-out" }}
                            >
                              {/* View */}
                              <button
                                type="button"
                                onClick={() => { setActiveRow(null); setViewAdmin(admin); }}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-black hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
                              >
                                <Eye size={11} />
                                View
                              </button>

                              {/* Set Inactive / Set Active */}
                              <button
                                type="button"
                                onClick={() => { setActiveRow(null); handleStatusToggle(admin); }}
                                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
                                  normalStatus === "ACTIVE"
                                    ? "bg-white border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                                    : "bg-white border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                                }`}
                              >
                                {normalStatus === "ACTIVE" ? "Set Inactive" : "Set Active"}
                              </button>

                              {/* Close */}
                              <button
                                type="button"
                                onClick={() => setActiveRow(null)}
                                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all cursor-pointer ml-0.5"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-sm text-gray-400">
                    {hasFilters ? "No sub-admins match your search." : "No sub-admins found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableScrollWrapper>

        <Pagination
          currentPage={curPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* View Details modal */}
      {viewAdmin && (
        <ViewSubAdminModal admin={viewAdmin} onClose={() => setViewAdmin(null)} />
      )}

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
};

export default SubAdminTable;
