import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../pages/Provider/AuthProvider";

const ALLOWED_ROLES = ["ADMIN", "SUB_ADMIN"];

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still hydrating from storage — show spinner to avoid flash-redirect
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → redirect, preserve the page they were trying to visit
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // User role must be ADMIN or SUB_ADMIN
  if (!ALLOWED_ROLES.includes(user?.role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
