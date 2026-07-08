import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, MoreVertical, Utensils } from "lucide-react";
import FoodStatCards from "../../components/food/FoodStatCards";
import AddFoodModal from "../../components/food/AddFoodModal";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";

const FoodManagement = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TanStack Query to fetch food items
  const { data: foods = [], isLoading, isError } = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const res = await axios.get("/foods.json");
      return res.data;
    },
  });

  // Search filter based on Name or Category
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new food item and update query cache dynamically
  const handleAddFood = (newFood) => {
    const nextId = foods.length > 0 ? Math.max(...foods.map((f) => f.id)) + 1 : 1;
    const updated = [...foods, { id: nextId, ...newFood }];
    queryClient.setQueryData(["foods"], updated);
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
                />
              </div>
            </div>

            <TableScrollWrapper minWidth="750px">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[15%] whitespace-nowrap">
                      Food Name
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">
                      Category
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[15%] whitespace-nowrap">
                      Delivery Time
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">
                      Delivery Fee
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[12%] whitespace-nowrap">
                      Price
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-[22%] whitespace-nowrap">
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
                  {filteredFoods.length > 0 ? (
                    filteredFoods.map((food) => (
                      <tr key={food.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {food.name}
                        </td>
                        <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                          {food.category}
                        </td>
                        <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                          {food.deliveryTime}
                        </td>
                        <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                          {food.deliveryFee}
                        </td>
                        <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                          {food.price}
                        </td>
                        <td className="py-4 text-sm text-gray-600 whitespace-nowrap truncate max-w-[200px]">
                          {food.description}
                        </td>
                        <td className="py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              food.status === "Available"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {food.status}
                          </span>
                        </td>
                        <td className="py-4 text-right whitespace-nowrap">
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
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