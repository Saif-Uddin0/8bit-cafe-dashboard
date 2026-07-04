import React from "react";
import { Link, NavLink } from "react-router";
import logo from "../../assets/hero.png"
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
    label: "Home",
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
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all font-medium ${isActive
      ? "bg-white text-[#532C89]"
      : "text-white/80 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex flex-col h-full bg-[#532C89] overflow-y-auto">

      {/* Logo */}
      <Link
        to="/"
        className="flex flex-col items-center pt-8 pb-6"
      >
        <img
          src={logo}
          className="w-16 h-16 rounded-xl"
          alt=""
        />

        <div className="mt-3 bg-white rounded-full px-8 py-1">
          <p className="text-[#532C89] text-sm font-semibold">
            Admin
          </p>
        </div>
      </Link>

      <div className="my-4 border-t border-[#1F1F1F"></div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3">
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
      <div className="mt-auto px-3 pb-6">

        <div className="border-t border-white/20 mb-4"></div>

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <div className="w-8 h-8 rounded-full bg-white text-[#532C89] flex items-center justify-center text-xs font-bold">
              AD
            </div>

            <div>
              <p className="text-xs font-semibold">
                Admin User
              </p>
            </div>

          </div>

          <button
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-semibold"
          >
            Logout
          </button>

        </div>

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