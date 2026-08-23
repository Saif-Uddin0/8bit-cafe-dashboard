import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../pages/Provider/AuthProvider";

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still hydrating from localStorage — show spinner to avoid flash-redirect
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

  return <Outlet />;
};

export default PrivateRoute;
