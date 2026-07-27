import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MoreVertical, Pencil, Trash2, X, LayoutGrid, ChevronLeft, ChevronRight, ArrowUpDown, ChevronDown } from "lucide-react";
import TableScrollWrapper from "../../components/global/TableScrollWrapper";
import CategoryStatCards from "../../components/category/CategoryStatCards";
import CreateCategoryModal from "../../components/category/CreateCategoryModal";
import EditCategoryModal from "../../components/category/EditCategoryModal";
import useAxiosSecure from "../../hooks/useAxios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";

// ── ActionCell — same popover pattern as Game/Food pages ────────────────────────
// Note: categories have no View, so we expose Edit + Delete in the popover.
const ActionCell = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <td className="py-4 text-right whitespace-nowrap">
      <div ref={ref} className="relative inline-block">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <MoreVertical size={16} />
        </button>

        {open && (
          <div
            className="absolute right-0 top-9 z-50 flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-lg px-2.5 py-2"
            style={{ animation: "popIn 0.15s ease-out" }}
          >
            {/* Edit */}
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-black text-black hover:bg-black hover:text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Pencil size={11} />
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap"
            >
              <Trash2 size={11} />
              Delete
            </button>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all cursor-pointer ml-0.5"
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.9) translateY(-4px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </td>
  );
};

const Category = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Filter and sort states
  const [filterType, setFilterType] = useState("ALL"); // ALL | GAME | FOOD
  const [sortBy, setSortBy] = useState("name");       // name | type
  const [sortOrder, setSortOrder] = useState("asc");    // asc | desc
  const [currentPage, setCurrentPage] = useState(1);

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

  const resetPage = () => setCurrentPage(1);

  // Apply filters and sorting on the frontend
  let processedCategories = categories.filter((cat) => {
    const matchesSearch = cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || cat.type === filterType;
    return matchesSearch && matchesType;
  });

  processedCategories = [...processedCategories].sort((a, b) => {
    let valA = a[sortBy] || "";
    let valB = b[sortBy] || "";

    if (sortBy === "type") {
      valA = a.type === "GAME" ? "Games" : "Food";
      valB = b.type === "GAME" ? "Games" : "Food";
    }

    if (sortOrder === "asc") {
      return valA.localeCompare(valB);
    } else {
      return valB.localeCompare(valA);
    }
  });

  // Frontend Pagination
  const itemsPerPage = 10;
  const totalItems = processedCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));

  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedCategories = processedCategories.slice(startIndex, startIndex + itemsPerPage);

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
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              <LayoutGrid size={16} />
              <span>Create Category</span>
            </button>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-6 shadow-sm">
            {/* Filter / Sort toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-bold text-gray-900">All Categories</h2>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Type */}
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => { setFilterType(e.target.value); resetPage(); }}
                    className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                  >
                    <option value="ALL">All Types</option>
                    <option value="GAME">Games Only</option>
                    <option value="FOOD">Food Only</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Sort By */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                    className="appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                  >
                    <option value="name">Sort: Name</option>
                    <option value="type">Sort: Type</option>
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
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); resetPage(); }}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black text-gray-800"
                  />
                </div>
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
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((cat) => {
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

                        <ActionCell
                            onEdit={() => {
                              setEditingCategory(cat);
                              setActiveRow(null);
                            }}
                            onDelete={() => handleDeleteCategory(cat)}
                          />
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