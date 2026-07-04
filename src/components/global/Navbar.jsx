import React from "react";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router";
import avatar from "../../assets/error.png"



const Navbar = ({ setSidebarOpen }) => {


  const location = useLocation();
//   const { profile, avatar, loading } = useAuth();


  // dynamic title
  const switchTitlte = {
  '/': 'Dashboard',
  '/game-management': 'Game Management',
  '/category': 'Category',
  '/leads': 'Leads',
  '/food-management': 'Food Management',
  '/schedule': 'Schedule',
  '/booking': 'Booking',
  '/sub-admin': 'Sub Admin Management',
  '/setting': 'Admin Settings',
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

      
        <div className="flex items-center gap-3">

          <Link>
            <img
              src={avatar}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover"
            />
          </Link>

          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-white">
              mahir
            </span>

            <span className="text-xs text-gray-400">
              admin
            </span>
          </div>

        </div>

    </header>
  );
};

export default Navbar;