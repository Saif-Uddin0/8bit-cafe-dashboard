import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import SubAdminTable from "../../components/subadmin/SubAdminTable";
import AddSubAdminModal from "../../components/subadmin/AddSubAdminModal";

const SubAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch sub-admins data using TanStack Query + Axios
  // To connect a real API, just replace "/sub-admins.json" with your endpoint
  const {
    data: admins = [],
    refetch,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await axios.get("/sub-admins.json");
      return res.data;
    },
  });

  // Handles new sub-admin submission from modal form
  const handleAddSubAdmin = (formData) => {
    console.log("New Sub-Admin submitted:", formData);
    // TODO: Replace with real API call e.g. await axiosSecure.post("/auth/users/", formData)
    // Then call refetch() to update the list
    refetch();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 mt-2 pb-8">
      {/* Page Header Row */}
      <div className="flex items-center justify-between">

        {/* Add Sub-Admin Button — opens the modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Sub-Admin
        </button>
      </div>

      {/* Conditional rendering for loading, error, or data states */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-semibold text-sm">
            Loading admins data...
          </p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <p className="font-semibold">
            Failed to load admins:{" "}
            {error?.message || "Unknown error occurred"}
          </p>
        </div>
      ) : (
        /* Admin list table */
        <SubAdminTable admins={admins} />
      )}

      {/* Add Sub-Admin Modal — controlled by isModalOpen state */}
      <AddSubAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubAdmin}
      />
    </div>
  );
};

export default SubAdmin;