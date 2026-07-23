import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import CategoryStatCards from "../../components/category/CategoryStatCards";
import CreateCategoryModal from "../../components/category/CreateCategoryModal";
import EditCategoryModal from "../../components/category/EditCategoryModal";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

const Category = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Close action row when clicking outside the table
  const tableRef = useRef(null);
  useEffect(() => {
    const onClickOutside = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setActiveRow(null);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // TanStack Query — resolves the nested API shape inside queryFn
  // Backend returns: { data: { meta: { page, limit, total }, data: [...] }, success: true }
  const { data: rawCategories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/category/getCategories?limit=1000");
      const body = res.data;
      // Resolve the actual array from whichever shape the backend returns
      if (Array.isArray(body?.data?.data)) return body.data.data;
      if (Array.isArray(body?.data))       return body.data;
      if (Array.isArray(body))             return body;
      return [];
    },
  });

  // Show all categories from the API — no isDelete filtering
  const categories = Array.isArray(rawCategories) ? rawCategories : [];

  // Apply search filter on top
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (newCategory) => {
    // Map form values to API-expected uppercase type codes
    const payload = {
      name: newCategory.name.trim(),
      type: newCategory.type === "Games" ? "GAME" : "FOOD",
    };
    try {
      await axiosSecure.post("/api/category/addCategory", payload);
      toast.success("Category created successfully!");
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error("Create Category Error:", err.message);
      console.error("Status:", err.response?.status);
      console.error("Error Response Data:", JSON.stringify(err.response?.data, null, 2));
      console.error("Payload sent was:", JSON.stringify(payload));
      const message =
        err.response?.data?.message || "Failed to create category.";
      toast.error(message);
      throw err;
    }
  };

  const handleEditCategory = async (updatedCategory) => {
    const payload = {
      name: updatedCategory.name,
      type: updatedCategory.type,
    };
    await axiosSecure.patch(`/api/category/updateCategory/${updatedCategory.id}`, payload);
    refetch();
  };

  const handleDeleteCategory = (cat) => {
    setActiveRow(null);
    Swal.fire({
      title: "Are you sure you want to delete this category?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const payload = { name: cat.name, type: cat.type, isDelete: true };
          await axiosSecure.patch(`/api/category/updateCategory/${cat._id || cat.id}`, payload);
          Swal.fire("Deleted!", "Category has been deleted.", "success");
          refetch();
        } catch (err) {
          const errMsg = err.response?.data?.message || err.message || "Failed to delete category.";
          Swal.fire("Error", errMsg, "error");
        }
      }
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────
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

            {/* ref on table wrapper so clicks outside collapse open rows */}
            <TableScrollWrapper minWidth="500px">
              <table ref={tableRef} className="w-full text-left border-collapse px-2">
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
                    <th className="pb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-[180px]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const displayType =
                        cat.type === "GAME" ? "Games" :
                        cat.type === "FOOD" ? "Food" :
                        cat.type;
                      const status = cat.status || "Available";
                      const rowId = cat._id || cat.id;
                      const isOpen = activeRow === rowId;

                      return (
                        <tr key={rowId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 text-sm font-semibold text-gray-900">
                            {cat.name}
                          </td>
                          <td className="py-4 text-sm text-gray-600">
                            {displayType}
                          </td>
                          <td className="py-4">
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

                          {/*
                            ACTION CELL — uses INLINE toggle buttons instead of
                            absolute dropdown, which would be clipped by
                            TableScrollWrapper's overflow-x:auto container.
                          */}
                          <td className="py-3 text-right">
                            {isOpen ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCategory(cat);
                                    setActiveRow(null);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#532C89] text-white hover:bg-[#6C04D7] rounded-lg transition-colors cursor-pointer"
                                >
                                  <Pencil size={11} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 size={11} />
                                  Delete
                                </button>
                                <button
                                  onClick={() => setActiveRow(null)}
                                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                                  title="Cancel"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActiveRow(rowId)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                title="Actions"
                              >
                                <MoreVertical size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
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

          {editingCategory && (
            <EditCategoryModal
              category={editingCategory}
              onClose={() => setEditingCategory(null)}
              onSave={handleEditCategory}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Category;