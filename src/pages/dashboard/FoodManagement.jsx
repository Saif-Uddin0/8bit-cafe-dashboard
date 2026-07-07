import React, { useState } from "react";
import { Search, MoreVertical, Utensils } from "lucide-react";
import FoodStatCards from "../../components/food/FoodStatCards";
import AddFoodModal from "../../components/food/AddFoodModal";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";

// Seed food data from the Figma screenshot
const INITIAL_FOODS = [
  { id: 1, name: "Burger", category: "Snacks", deliveryTime: "30 Minutes", deliveryFee: "30 Tk", price: "100 tk", description: "Complete grooming package", status: "Available" },
  { id: 2, name: "Burger", category: "Snacks", deliveryTime: "30 Minutes", deliveryFee: "30 Tk", price: "100 tk", description: "Complete grooming package", status: "Available" },
  { id: 3, name: "Burger", category: "Snacks", deliveryTime: "30 Minutes", deliveryFee: "30 Tk", price: "100 tk", description: "Complete grooming package", status: "Available" },
  { id: 4, name: "Burger", category: "Snacks", deliveryTime: "30 Minutes", deliveryFee: "30 Tk", price: "100 tk", description: "Complete grooming package", status: "Un-available" },
  { id: 5, name: "Burger", category: "Snacks", deliveryTime: "30 Minutes", deliveryFee: "30 Tk", price: "100 tk", description: "Complete grooming package", status: "Available" },
];

const FoodManagement = () => {
  const [foods, setFoods] = useState(INITIAL_FOODS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search filter based on Name or Category
  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding a new food item
  const handleAddFood = (newFood) => {
    const nextId = foods.length > 0 ? Math.max(...foods.map((f) => f.id)) + 1 : 1;
    setFoods([...foods, { id: nextId, ...newFood }]);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {/* Page Stats */}
      <FoodStatCards foods={foods} />

      {/* Action Row */}
      <div className="flex justify-end mt-4">
        <button
          id="add-food-btn"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center hover:cursor-pointer gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Utensils size={16} />
          <span>Add Food</span>
        </button>
      </div>

      {/* Foods Table Card */}
      <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-gray-900">All Foods</h2>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              id="food-search"
              type="text"
              placeholder="Search by name or category"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
            />
          </div>
        </div>

        {/* Table Wrapper for mobile horizontal scrolling */}
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
                    {/* Food Name */}
                    <td className="py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {food.name}
                    </td>
                    {/* Category */}
                    <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                      {food.category}
                    </td>
                    {/* Delivery Time */}
                    <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                      {food.deliveryTime}
                    </td>
                    {/* Delivery Fee */}
                    <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                      {food.deliveryFee}
                    </td>
                    {/* Price */}
                    <td className="py-4 text-sm text-gray-600 whitespace-nowrap">
                      {food.price}
                    </td>
                    {/* Description */}
                    <td className="py-4 text-sm text-gray-600 whitespace-nowrap truncate max-w-[200px]">
                      {food.description}
                    </td>
                    {/* Status Badge */}
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
                    {/* Action */}
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

      {/* Add Food Modal */}
      {isModalOpen && (
        <AddFoodModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleAddFood}
        />
      )}
    </div>
  );
};

export default FoodManagement;