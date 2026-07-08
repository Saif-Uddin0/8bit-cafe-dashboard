import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Search, MoreVertical } from "lucide-react";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import CategoryStatCards from "../../components/category/CategoryStatCards";
import CreateCategoryModal from "../../components/category/CreateCategoryModal";

const Category = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TanStack Query to fetch category data
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get("/categories.json");
      return res.data;
    },
  });

  // Filter based on Category Name
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Simulate addition by updating Query cache dynamically
  const handleCreateCategory = (newCat) => {
    const nextId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const updated = [...categories, { id: nextId, ...newCat }];
    queryClient.setQueryData(["categories"], updated);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold text-sm">Loading categories...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">Failed to load categories database.</p>
        </div>
      ) : (
        <>
          <CategoryStatCards categories={categories} />

          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Create Category
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900">All Category</h2>

              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
                />
              </div>
            </div>

            <TableScrollWrapper minWidth="500px">
              <table className="w-full text-left border-collapse px-2">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/3">
                      Category Name
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/4">
                      Type
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/6">
                      Status
                    </th>
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[10%]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 text-sm font-semibold text-gray-900">
                          {cat.name}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {cat.type}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              cat.status === "Available"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-sm text-gray-400">
                        No categories found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableScrollWrapper>
          </div>

          {isModalOpen && (
            <CreateCategoryModal
              onClose={() => setIsModalOpen(false)}
              onCreate={handleCreateCategory}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Category;