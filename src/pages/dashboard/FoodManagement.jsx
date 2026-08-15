import React, { useState, useRef, useEffect } from "react";
import { useQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import {
  Search, Utensils, ChevronLeft, ChevronRight, Loader2, ArrowUpDown, ChevronDown,
} from "lucide-react";
import FoodStatCards from "../../components/food/FoodStatCards";
import AddFoodModal from "../../components/food/AddFoodModal";
import ViewFoodModal from "../../components/food/ViewFoodModal";
import EditFoodModal from "../../components/food/EditFoodModal";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import ActionCell from "../../components/global/ActionCell";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";

const FoodManagement = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy,    setSortBy]    = useState("createdAt"); // price | name | createdAt
  const [sortOrder, setSortOrder] = useState("desc");      // asc | desc

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewFood, setViewFood] = useState(null);
  const [editFood, setEditFood] = useState(null);

  // ── Fetch foods (TanStack query + refetch) ──────────────────────────────────
  const { data: foodResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ["foods", currentPage, searchTerm, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page:      String(currentPage),
        limit:     "10",
        sortBy,
        sortOrder,
      });
      if (searchTerm.trim()) params.append("searchTerm", searchTerm.trim());
      const res = await axiosSecure.get(`/api/foods/getFoods?${params.toString()}`);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  // ── Fetch all foods for stats ──
  const { data: allFoodsResponse } = useQuery({
    queryKey: ["foods", "stats"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/foods/getFoods?limit=10000");
      return res.data;
    },
  });

  const allFoodsBody = allFoodsResponse?.data ?? allFoodsResponse ?? {};
  const allFoodsForStats = Array.isArray(allFoodsBody?.data)
    ? allFoodsBody.data
    : Array.isArray(allFoodsBody)
    ? allFoodsBody
    : [];

  const refreshData = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["foods", "stats"] });
  };

  // Normalise nested response shape
  const body  = foodResponse?.data ?? foodResponse ?? {};
  const meta  = body?.meta ?? {};
  const foods = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body)
    ? body
    : [];

  const totalItems = meta?.total ?? foods.length;
  const totalPages = meta?.totalPage || Math.ceil(totalItems / 10) || 1;
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  // Reset to page 1 whenever filters change
  const resetPage = () => setCurrentPage(1);

  // ── Inline status toggle ────────────────────────────────────────────────────
  const [statusUpdating, setStatusUpdating] = useState({}); // { [foodId]: true }

  const handleToggleStatus = async (food) => {
    const id = food.id ?? food._id;
    const currentStatus = food.status;
    const isCurrentlyAvailable =
      currentStatus === "AVAILABLE" || currentStatus === "Available";
    const newStatus = isCurrentlyAvailable ? "UNAVAILABLE" : "AVAILABLE";

    setStatusUpdating((prev) => ({ ...prev, [id]: true }));
    try {
      const fd = new FormData();
      fd.append("status", newStatus);
      // Required fields the backend always needs
      const deliveryTime = food.delivery_time ?? food.deliveryTime ?? "";
      const deliveryFee  = food.delivery_fee  ?? food.deliveryFee  ?? "";
      if (deliveryTime) fd.append("delivery_time", String(deliveryTime));
      if (deliveryFee)  fd.append("delivery_fee",  String(deliveryFee));
      await axiosSecure.patch(`/api/foods/updateFood/${id}`, fd);
      toast.success(`Status changed to ${newStatus === "AVAILABLE" ? "Available" : "Unavailable"}`);
      refreshData();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-semibold text-sm">Loading foods...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">Failed to load foods database.</p>
        </div>
      ) : (
        <>
          <FoodStatCards foods={allFoodsForStats} />

          {/* Add Food button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <Utensils size={16} />
              <span>Add Food</span>
            </button>
          </div>

          {/* Table card */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">

            {/* ── Filter / Sort toolbar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-gray-900">All Foods</h2>

              <div className="flex flex-wrap items-center gap-2">
                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                    className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                  >
                    <option value="createdAt">Sort: Newest</option>
                    <option value="name">Sort: Name</option>
                    <option value="price">Sort: Price</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort Order */}
                <button
                  onClick={() => { setSortOrder((o) => o === "asc" ? "desc" : "asc"); resetPage(); }}
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  <ArrowUpDown size={13} />
                  {sortOrder === "asc" ? "ASC" : "DESC"}
                </button>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search foods..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
                  />
                </div>
              </div>
            </div>

            <TableScrollWrapper minWidth="750px">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[25%] whitespace-nowrap">Food Name</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[15%] whitespace-nowrap">Category</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">Price</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[15%] whitespace-nowrap">Delivery Time</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[13%] whitespace-nowrap">Delivery Fee</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[10%] whitespace-nowrap">Status</th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[10%] whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {foods.length > 0 ? (
                    foods.map((food) => {
                      const categoryName =
                        typeof food.category === "object"
                          ? food.category?.name
                          : food.category;
                      const deliveryTime = food.delivery_time
                        ? `${food.delivery_time} mins`
                        : food.deliveryTime || "—";
                      const deliveryFee =
                        food.delivery_fee != null
                          ? `৳${food.delivery_fee}`
                          : food.deliveryFee || "—";
                      // Backend stores isDisCount (capital C) and disCountParcentage
                      const discountVal = food.disCountParcentage ?? food.discountParcentage ?? food.discountPercentage ?? food.discountParcenTage ?? 0;
                      const hasDiscount = (food.isDisCount ?? food.isDiscount) && Number(discountVal) > 0;
                      const originalPrice = food.price;
                      const discountedPrice = hasDiscount ? Math.round(originalPrice * (1 - discountVal / 100)) : originalPrice;

                      const description =
                        food.short_description || food.description || "—";
                      const foodImage =
                         Array.isArray(food.images) && food.images.length > 0
                           ? (typeof food.images[0] === "object" ? food.images[0]?.url : food.images[0])
                           : null;

                      return (
                        <tr
                          key={food.id || food._id}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Food Name + Thumbnail */}
                          <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {foodImage ? (
                                <img
                                  src={foodImage}
                                  alt={food.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-gray-100 shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                                  <Utensils size={18} />
                                </div>
                              )}
                              <span className="truncate max-w-[160px]">{food.name}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {categoryName || "—"}
                          </td>

                          {/* Price */}
                          <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {hasDiscount ? (
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-400 line-through">৳{originalPrice}</span>
                                <span className="text-sm font-bold text-red-500 flex items-center gap-1">
                                  ৳{discountedPrice}
                                  <span className="text-[10px] bg-red-50 text-red-600 px-1 py-0.5 rounded font-bold shrink-0">
                                    {discountVal}% OFF
                                  </span>
                                </span>
                              </div>
                            ) : (
                              food.price != null ? `৳${food.price}` : "—"
                            )}
                          </td>

                          {/* Delivery Time */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {deliveryTime}
                          </td>

                          {/* Delivery Fee */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {deliveryFee}
                          </td>

                          {/* Status — clickable inline toggle */}
                          <td className="py-4 text-sm whitespace-nowrap">
                            {statusUpdating[food.id ?? food._id] ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
                                <Loader2 size={11} className="animate-spin" />
                                Updating...
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(food)}
                                title="Click to toggle status"
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95 ${
                                  food.status === "AVAILABLE" || food.status === "Available"
                                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                                    : "bg-red-50 text-red-500 hover:bg-red-100"
                                }`}
                              >
                                {food.status === "AVAILABLE" || food.status === "Available" ? "Available" : "Unavailable"}
                              </button>
                            )}
                          </td>

                          {/* Action popover */}
                          <ActionCell
                            onView={() => setViewFood(food)}
                            onEdit={() => setEditFood(food)}
                          />
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-10 text-center text-sm text-gray-400">
                        No food items found
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
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={activePage === 1}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      activePage === idx + 1
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── Modals ── */}
          {isAddOpen && (
            <AddFoodModal
              onClose={() => setIsAddOpen(false)}
              onCreated={() => { refreshData(); }}
            />
          )}

          {viewFood && (
            <ViewFoodModal
              food={viewFood}
              onClose={() => setViewFood(null)}
              onEdit={(f) => { setViewFood(null); setEditFood(f); }}
            />
          )}

          {editFood && (
            <EditFoodModal
              food={editFood}
              onClose={() => setEditFood(null)}
              onUpdated={async () => { await refreshData(); setEditFood(null); }}
            />
          )}

        </>
      )}
    </div>
  );
};

export default FoodManagement;