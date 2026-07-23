import React from "react";
import { Link, NavLink, useNavigate } from "react-router";
import logo from "../../assets/logo-dash.png";
import { useAuth } from "../../pages/Provider/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../hooks/useAxios";
import {
  House,
  Users,
  Grid2x2,
  Gamepad2,
  UtensilsCrossed,
  CalendarDays,
  CalendarCheck2,
  Shield,
  Settings,
  X,
} from "lucide-react";

const menuItems = [
  {
    path: "/",
    label: "Home",
    icon: House,
  },
  {
    path: "/leads",
    label: "Leads",
    icon: Users,
  },
  {
    path: "/category",
    label: "Category",
    icon: Grid2x2,
  },
  {
    path: "/game-management",
    label: "Game Management",
    icon: Gamepad2,
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
    label: "Bookings",
    icon: CalendarCheck2,
  },
  {
    path: "/sub-admin",
    label: "Sub Admin",
    icon: Shield,
  },
  {
    path: "/setting",
    label: "Settings",
    icon: Settings,
  },
];

const Sidebar = ({ closeSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const axiosSecure = useAxiosSecure();

  const token = localStorage.getItem("accessToken");

  // Fetch the logged-in user profile from the backend
  const { data: adminData } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/user/getMe");
      return res.data?.data ?? {};
    },
    enabled: !!token,
  });

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };
  const linkClass = ({ isActive }) => `
    relative
    overflow-hidden
    flex
    items-center
    gap-2.5 md:gap-3
    h-[38px] md:h-[44px]
    px-3 md:px-4
    rounded-xl
    transition-all
    font-medium
    text-xs md:text-sm
    ${isActive
      ? "bg-white"
      : "text-white/80 hover:bg-white/10 hover:text-white"
    }
  `;

  return (
    <div className="relative flex flex-col h-full bg-[#532C89] overflow-y-auto no-scrollbar">



      {/* Logo */}
      <Link
        to="/"
        className="flex flex-col items-center pt-5 pb-5"
      >
        <img
          src={logo}
          className="w-16 h-16 md:w-20 md:h-20 rounded-xl"
          alt="logo"
        />

        {/* Divider */}
        <div className="w-full mt-5">
          <div className="border-t border-[#E8EAED]"></div>
        </div>

        {/* Admin Badge */}
        <div className="w-full px-2 mt-2.5">
          <div className="bg-white rounded-full h-8 px-3 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />

            <p className="text-[#2563EB] text-xs md:text-sm font-semibold">
              {(() => {
                const displayRole = adminData?.role || user?.role || "Admin";
                return displayRole.charAt(0).toUpperCase() + displayRole.slice(1).toLowerCase();
              })()}
            </p>
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-2">
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
                  <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-full bg-gradient-to-b from-[#FFF3E8] to-[#EF3D86]" />
                )}

                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                  stroke={isActive ? "url(#menuGradient)" : "currentColor"}
                  className={!isActive ? "text-white/80" : ""}
                />

                <span className={isActive ? "gradient-text text-semibold" : ""}>
                  {label}
                </span>
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

            {(() => {
              const displayName = adminData 
                ? `${adminData.firstName ?? ""} ${adminData.lastName ?? ""}`.trim() || adminData.name || user?.name || user?.email || "Admin User"
                : user?.name || user?.email || "Admin User";
              const firstLetter = displayName.charAt(0).toUpperCase() || "A";
              const profileImg = adminData?.profileImg || adminData?.profileImage || adminData?.image || user?.profileImg || user?.profileImage;

              return (
                <>
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white text-[#532C89] flex items-center justify-center text-xs font-bold">
                      {firstLetter}
                    </div>
                  )}

                  <div className="max-w-[110px] truncate">
                    <p className="text-xs font-semibold text-white truncate" title={displayName}>
                      {displayName}
                    </p>
                  </div>
                </>
              );
            })()}

          </div>

          {token || user ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/auth/login")}
              className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Login
            </button>
          )}

        </div>

      </div>

      {/* Mobile Close */}
      <button
        onClick={closeSidebar}
        className="absolute top-4 right-4 md:hidden text-white hover:text-gray-300"
      >
        <X size={20} />
      </button>

    </div>
  );
};

export default Sidebar;