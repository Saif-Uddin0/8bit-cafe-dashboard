import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreVertical, Utensils, ChevronLeft, ChevronRight } from "lucide-react";
import FoodStatCards from "../../components/food/FoodStatCards";
import AddFoodModal from "../../components/food/AddFoodModal";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import useAxiosSecure from "../../hooks/useAxios";

const FoodManagement = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch foods with backend server-side pagination (page & limit)
  const { data: foodResponse, isLoading, isError, refetch } = useQuery({
    queryKey: ["foods", currentPage, searchTerm],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
      });
      if (searchTerm.trim()) {
        queryParams.append("searchTerm", searchTerm.trim());
      }
      const res = await axiosSecure.get(`/api/foods/getFoods?${queryParams.toString()}`);
      return res.data;
    },
  });

  // Extract nested pagination meta & data array
  const body = foodResponse?.data ?? foodResponse ?? {};
  const meta = body?.meta ?? {};
  const foods = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body)
    ? body
    : [];

  const totalItems = meta?.total ?? foods.length;
  const totalPages = meta?.totalPage || Math.ceil(totalItems / 10) || 1;
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  // Add new food item and refetch backend state
  const handleAddFood = async () => {
    refetch();
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading foods...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">Failed to load foods database.</p>
        </div>
      ) : (
        <>
          <FoodStatCards foods={foods} />

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <Utensils size={16} />
              <span>Add Food</span>
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900">All Foods</h2>

              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by name or category"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
                />
              </div>
            </div>

            <TableScrollWrapper minWidth="750px">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[22%] whitespace-nowrap">
                      Food Name
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">
                      Category
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[13%] whitespace-nowrap">
                      Delivery Time
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">
                      Delivery Fee
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[11%] whitespace-nowrap">
                      Price
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[20%] whitespace-nowrap">
                      Short Description
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[10%] whitespace-nowrap">
                      Status
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[8%] whitespace-nowrap">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {foods.length > 0 ? (
                    foods.map((food) => {
                      const categoryName = typeof food.category === "object" ? food.category?.name : food.category;
                      const deliveryTime = food.delivery_time ? `${food.delivery_time} mins` : food.deliveryTime || "N/A";
                      const deliveryFee = food.delivery_fee !== undefined ? `৳${food.delivery_fee}` : food.deliveryFee || "N/A";
                      const price = food.price !== undefined ? `৳${food.price}` : "N/A";
                      const description = food.short_description || food.description || "N/A";
                      const status = food.status || (food.isDelete ? "Un-available" : "Available");
                      const foodImage = Array.isArray(food.images) && food.images.length > 0 ? food.images[0] : null;

                      return (
                        <tr key={food.id || food._id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Food Name + Image Thumbnail */}
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
                              <span className="truncate max-w-[180px]">{food.name}</span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {categoryName || "N/A"}
                          </td>

                          {/* Delivery Time */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {deliveryTime}
                          </td>

                          {/* Delivery Fee */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                            {deliveryFee}
                          </td>

                          {/* Price */}
                          <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            {price}
                          </td>

                          {/* Description */}
                          <td className="py-4 text-sm text-gray-600 whitespace-nowrap truncate max-w-[200px]" title={description}>
                            {description}
                          </td>

                          {/* Status */}
                          <td className="py-4 whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                status === "Available"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-500"
                              }`}
                            >
                              {status}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-4 text-right whitespace-nowrap">
                            <button className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
                              <MoreVertical size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-10 text-center text-sm text-gray-400">
                        No food items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableScrollWrapper>

            {/* Pagination Controls — Leads style */}
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

          {isModalOpen && (
            <AddFoodModal
              onClose={() => setIsModalOpen(false)}
              onCreate={handleAddFood}
            />
          )}
        </>
      )}
    </div>
  );
};

export default FoodManagement;