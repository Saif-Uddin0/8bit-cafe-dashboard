import React from 'react';
import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../pages/Provider/AuthProvider';

const ALLOWED_ROLES = ["ADMIN", "SUB_ADMIN"];

const Auth = () => {
    const { user, loading } = useAuth();

    // Still restoring session — wait silently before deciding where to go
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="w-12 h-12 border-4 border-[#532C89] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Already logged in with an allowed admin role — send them to the dashboard
    if (user && ALLOWED_ROLES.includes(user?.role)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <Outlet />
        </div>
    );
};

export default Auth;