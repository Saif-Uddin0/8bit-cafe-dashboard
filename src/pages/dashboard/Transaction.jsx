import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxios";
import TransactionStatCards from "../../components/transaction/TransactionStatCards";
import TransactionTable from "../../components/transaction/TransactionTable";

const Transaction = () => {
  const axiosSecure = useAxiosSecure();

  // State lifted from TransactionTable to control query params
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [methodFilter, setMethodFilter] = useState("All");
  const [sort, setSort] = useState("date-newest");

  // 1. Paginated Transactions Query (for the table)
  const {
    data: transactionsResponse,
    isLoading: isTableLoading,
    isError: isTableError,
    error: tableError,
  } = useQuery({
    queryKey: ["transactions", currentPage, searchTerm, statusFilter, typeFilter, methodFilter, sort],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
      });

      if (searchTerm.trim()) {
        params.append("searchTerm", searchTerm.trim());
      }
      if (statusFilter !== "All") {
        params.append("status", statusFilter);
      }
      if (typeFilter !== "All") {
        params.append("paymentType", typeFilter);
        params.append("type", typeFilter); // Send both to ensure backend match
      }
      if (methodFilter !== "All") {
        params.append("method", methodFilter);
      }

      // Map sort value to standard sortBy & sortOrder if backend expects it
      if (sort === "date-newest") {
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "desc");
      } else if (sort === "date-oldest") {
        params.append("sortBy", "createdAt");
        params.append("sortOrder", "asc");
      } else if (sort === "amount-high") {
        params.append("sortBy", "amount");
        params.append("sortOrder", "desc");
      } else if (sort === "amount-low") {
        params.append("sortBy", "amount");
        params.append("sortOrder", "asc");
      }
      params.append("sort", sort);

      // We send variables in headers too, matching SpecHub screenshot check behavior
      const headers = {
        page: String(currentPage),
        limit: "10",
        searchTerm: searchTerm.trim() || undefined,
        status: statusFilter !== "All" ? statusFilter : undefined,
        paymentType: typeFilter !== "All" ? typeFilter : undefined,
        type: typeFilter !== "All" ? typeFilter : undefined,
        method: methodFilter !== "All" ? methodFilter : undefined,
        sort: sort,
      };

      const res = await axiosSecure.get(`/api/payment/all-transection?${params.toString()}`, { headers });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // 2. Dedicated stats counter endpoint — no pagination, just totals
  const {
    data: statsResponse,
    isLoading: isStatsLoading,
  } = useQuery({
    queryKey: ["transactions", "stats"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/payment/all-transection-counter");
      return res.data;
    },
  });

  // Normalize paginated table response
  const meta = transactionsResponse?.meta ?? {};
  const transactions = Array.isArray(transactionsResponse?.data) ? transactionsResponse.data : [];
  const totalItems = meta?.total ?? transactions.length;
  const totalPages = meta?.totalPages ?? meta?.totalPage ?? (Math.ceil(totalItems / 10) || 1);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  // Normalize stats — backend returns { data: { totalTransaction, status, paymentType, totalAmount } }
  const statsData = statsResponse?.data ?? {};

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setTypeFilter("All");
    setMethodFilter("All");
    setSort("date-newest");
    setCurrentPage(1);
  };

  const isLoading = isTableLoading || isStatsLoading;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
      {isLoading && !transactionsResponse ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading transactions data...</p>
        </div>
      ) : isTableError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">
            Failed to load transactions: {tableError?.message || "Unknown error occurred"}
          </p>
        </div>
      ) : (
        <>
          {/* Row 1: Summary / Stat Cards */}
          <TransactionStatCards stats={statsData} />

          {/* Row 2: Transactions Data Table */}
          <TransactionTable
            transactions={transactions}
            totalPages={totalPages}
            currentPage={activePage}
            onPageChange={setCurrentPage}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            methodFilter={methodFilter}
            onMethodFilterChange={setMethodFilter}
            sort={sort}
            onSortChange={setSort}
            onResetFilters={handleResetFilters}
            isLoading={isTableLoading}
          />
        </>
      )}
    </div>
  );
};

export default Transaction;
