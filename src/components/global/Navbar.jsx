import React from "react";
import { Menu } from "lucide-react";
import {  useLocation } from "react-router";



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
    <header className="py-5  bg-[#FFFFFF] flex items-center justify-between px-4">

      {/* Left */}
      <div className="flex items-center gap-4">

        {/* mobile Sidebar */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-black hover:text-gray-700 transition"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <h1 className="text-lg md:text-2xl font-semibold text-black">
          {title}
        </h1>

      </div>


    </header>
  );
};

export default Navbar;