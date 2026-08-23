import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import SubAdminTable from "../../components/subadmin/SubAdminTable";
import AddSubAdminModal from "../../components/subadmin/AddSubAdminModal";
import useAxiosSecure from "../../hooks/useAxios";
import { useAuth } from "../Provider/AuthProvider";

const SubAdmin = () => {
  const axiosSecure = useAxiosSecure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  // Safety net: never fire this query for SUB_ADMIN users
  // (AdminOnlyRoute already blocks the page, but this adds a second layer)
  const isAdmin = user?.role !== "SUB_ADMIN";

  // ── Fetch all sub-admins ──
  const { data: admins = [], isLoading, isError, error } = useQuery({
    queryKey: ["subAdmins"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/allUsers?role=SUB_ADMIN");
      // Backend may wrap: { data: { data: [...] } } or { data: [...] }
      const body = res.data?.data;
      if (Array.isArray(body?.data)) return body.data;
      if (Array.isArray(body))       return body;
      if (Array.isArray(res.data))   return res.data;
      return [];
    },
    enabled: isAdmin,
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-2 md:px-4 pb-8">

      {/* Add Sub-Admin button — right-aligned */}
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
          <p className="text-gray-400 text-sm">Loading sub-admins...</p>
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
          {error?.response?.data?.message || error?.message || "Failed to load sub-admins."}
        </div>
      ) : (
        <SubAdminTable admins={admins} />
      )}

      <AddSubAdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default SubAdmin;