import React from "react";
import { Navigate, Outlet } from "react-router";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../pages/Provider/AuthProvider";
import useAxiosSecure from "../../hooks/useAxios";


const AdminOnlyRoute = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const token = localStorage.getItem("accessToken");

  // Always fetch fresh role from the API
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/getMe");
      return res.data?.data ?? {};
    },
    enabled: !!token,
    staleTime: 0, // always re-fetch for route guards
  });

  // Show spinner while the role is being confirmed
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-16">
        <div className="w-10 h-10 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Prefer fresh API role; fall back to locally stored value
  const role = adminData?.role || user?.role || "";

  if (role === "SUB_ADMIN") {
    toast.error("Access denied: Admins only.", { id: "admin-only" });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;
