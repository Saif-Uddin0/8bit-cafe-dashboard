import React from "react";
import { Navigate, Outlet } from "react-router";
import { toast } from "react-hot-toast";
import { useAuth } from "../../pages/Provider/AuthProvider";

const AdminOnlyRoute = () => {
  const { user, loading } = useAuth();

  // Show spinner while auth state is hydrating
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] py-16">
        <div className="w-10 h-10 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Only ADMIN is allowed to access /sub-admin
  if (user?.role !== "ADMIN") {
    toast.error("Access denied: Admins only.", { id: "admin-only" });
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminOnlyRoute;
