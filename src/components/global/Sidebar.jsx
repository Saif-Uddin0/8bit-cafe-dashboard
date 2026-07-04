import React from "react";
import { Link, NavLink } from "react-router";
import logo from "../assets/vector.png";
import {
  LayoutDashboard,
  Gamepad2,
  Grid2X2,
  Users,
  UtensilsCrossed,
  CalendarDays,
  ClipboardList,
  UserCog,
  Settings,
  User,
  LogIn,
  X,
} from "lucide-react";

const menuItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/game-management",
    label: "Game Management",
    icon: Gamepad2,
  },
  {
    path: "/category",
    label: "Category",
    icon: Grid2X2,
  },
  {
    path: "/leads",
    label: "Leads",
    icon: Users,
  },
  {
    path: "/food-management",
    label: "Food Management",
    icon: UtensilsCrossed,
  },
  {
    path: "/schedule",
    label: "Schedule",
    icon: CalendarDays,
  },
  {
    path: "/booking",
    label: "Booking",
    icon: ClipboardList,
  },
  {
    path: "/sub-admin",
    label: "Sub Admin",
    icon: UserCog,
  },
  {
    path: "/setting",
    label: "Settings",
    icon: Settings,
  },
];

const Sidebar = ({ closeSidebar }) => {
  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
      isActive
        ? "text-[#00CE51] bg-gradient-to-r from-[#00CE51]/20 to-transparent"
        : "text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
    }`;

  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] border-r border-[#1F1F1F] overflow-y-auto">

      {/* Logo */}
      <Link to="/" className="flex flex-col items-center py-5">
        <div className="flex items-center gap-2 text-white">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <h1 className="text-3xl font-semibold">LoGo</h1>
        </div>
      </Link>

      <div className="border-t border-[#1F1F1F] mb-6"></div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 pr-4">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={linkClass}
            onClick={closeSidebar}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51] rounded-r" />
                )}
                <Icon size={18} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pb-10">

        <NavLink
          to="/setting"
          className={linkClass}
          onClick={closeSidebar}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51] rounded-r" />
              )}
              <User size={18} />
              Profile
            </>
          )}
        </NavLink>

        <div className="border-t border-[#1F1F1F] my-4"></div>

        <Link
          to="/auth/login"
          className="flex items-center gap-3 text-green-400 hover:text-green-500 text-sm transition px-5"
        >
          <LogIn size={18} />
          Login
        </Link>
      </div>

      {/* Mobile Close */}
      <button
        onClick={closeSidebar}
        className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default Sidebar;