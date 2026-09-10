import React from "react";
import { Link, NavLink, useNavigate } from "react-router";
import logo from "../../assets/logo-dash.png";
import { useAuth } from "../../pages/Provider/AuthProvider";
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
  Receipt,
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
    path: "/transaction",
    label: "Transaction",
    icon: Receipt,
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
  const { user, logout, loading } = useAuth();

  const role = user?.role || "";
  const isSubAdmin = role === "SUB_ADMIN";

  // Hide the Sub Admin entry for SUB_ADMIN users
  const visibleMenuItems = isSubAdmin
    ? menuItems.filter((item) => item.path !== "/sub-admin")
    : menuItems;

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



<div className="flex flex-col items-center pt-5 pb-5">
  <Link to="/">
    <img
      src={logo}
      className="w-16 h-16 md:w-20 md:h-20 rounded-xl"
      alt="logo"
    />
  </Link>

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
          const displayRole = user?.role || "";
          if (!displayRole) return loading ? "..." : "";
          const cleanedRole = displayRole
            .trim()
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/-/g, " ");

          return cleanedRole.replace(/\b\w/g, (char) => char.toUpperCase());
        })()}
      </p>
    </div>
  </div>
</div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 px-2">
        {visibleMenuItems.map(({ path, label, icon: Icon }) => (
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
              const displayName =
                user?.name ||
                (user?.firstName
                  ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                  : "") ||
                user?.email ||
                "Admin User";
              const firstLetter = displayName.charAt(0).toUpperCase() || "A";
              const profileImg =
                user?.image || user?.profileImg || user?.profileImage || user?.avatar;

              return (
                <>
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-white/20 shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white text-[#532C89] flex items-center justify-center text-xs font-bold shrink-0">
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

          {user ? (
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