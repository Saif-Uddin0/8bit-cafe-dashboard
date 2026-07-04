import React from "react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router";



const Navbar = ({ setSidebarOpen }) => {


  const location = useLocation();
//   const { profile, avatar, loading } = useAuth();


  // dynamic title
  const switchTitlte = {
    '/': 'Dashboard',
    '/conversation': 'Conversation',
    '/leads': 'Leads',
    '/agent-manage': 'Agent Manage',
    '/admin-manage': 'Admin Manage',
    '/profile': 'Profile',
  };

  const title = switchTitlte[location.pathname] || "Dashboard";
  return (
    <header className="py-5 border-b border-[#1F1F1F] bg-[#0B0B0B] flex items-center justify-between px-6">

      {/* Left */}
      <div className="flex items-center gap-4">

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-gray-400 hover:text-white transition"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <h1 className="text-lg md:text-2xl font-semibold text-white">
          {title}
        </h1>

      </div>

      {/* Right User */}

      {!loading && (
        <div className="flex items-center gap-3">

          <Link to={'/profile'}>
            <img
              src={avatar}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover"
            />
          </Link>

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">
              {profile?.name}
            </span>

            <span className="text-xs text-gray-400">
              {profile?.role}
            </span>
          </div>

        </div>
      )}

    </header>
  );
};

export default Navbar;