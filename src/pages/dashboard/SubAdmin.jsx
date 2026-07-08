import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import SubAdminTable from "../../components/subadmin/SubAdminTable";
import AddSubAdminModal from "../../components/subadmin/AddSubAdminModal";

const SubAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: admins = [], refetch, isLoading, isError, error } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const res = await axios.get("/sub-admins.json");
      return res.data;
    },
  });

  const handleAddSubAdmin = (formData) => {
    console.log("New Sub-Admin:", formData);
    // TODO: await axiosSecure.post("/auth/users/", formData); then refetch()
    refetch();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 md:p-5 mt-2 pb-8 border border-gray-200 rounded-xl shadow-xs">

      {/* Add Sub-Admin button — right-aligned, title is shown in the Navbar */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-black text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={16} />
          Add Sub-Admin
        </button>
      </div>

      {/* Loading / error / table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading admins...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          Failed to load: {error?.message}
        </div>
      ) : (
        <SubAdminTable admins={admins} />
      )}

      <AddSubAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubAdmin}
      />
    </div>
  );
};

export default SubAdmin;