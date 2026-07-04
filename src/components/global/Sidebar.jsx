import React from "react";
import { Link, NavLink, useNavigate } from "react-router";
import logo from '../assets/vector.png'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  UserCog,
  Shield,
  LogOut,
  X,
  Sparkles,
  User,
  LogIn
} from "lucide-react";


const Sidebar = ({ closeSidebar }) => {

//   const { logout, user } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     toast("Logout Successfully!")
//     navigate("/auth/login");
//   };

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${isActive
      ? "text-[#00CE51] bg-gradient-to-r from-[#00CE51]/20 to-transparent"
      : "text-gray-400 hover:bg-[#1A1A1A] hover:text-white"
    }`;


  return (
    <div className="flex flex-col h-full bg-[#0B0B0B] border-r border-[#1F1F1F] w-full overflow-y-auto overflow-x-hidden">

      {/* Logo */}
      <Link to={'/'} className="flex flex-col items-center py-5">

        <div className="flex items-center gap-2 text-white text-lg font-semibold">
          <img src={logo} alt="logo" className="w-8 h-8" />
          <h1 className="text-3xl font-semibold">LoGo</h1>
        </div>

      </Link>

      {/* Divider */}
      <div className="border-t border-[#1F1F1F] mb-6"></div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 pr-4 pl-0">

        <NavLink to="/" className={linkClass} onClick={closeSidebar}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51] rounded-r" />
              )}

              <LayoutDashboard size={18} />
              Dashboard
            </>
          )}

        </NavLink>

        <NavLink to="/conversation" className={linkClass} onClick={closeSidebar}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51]" />
              )}

              <MessageSquare size={18} />
              Conversation
            </>
          )}
        </NavLink>



        <NavLink to="/leads" className={linkClass} onClick={closeSidebar}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51]" />
              )}
              <Users size={18} />
              Leads
            </>
          )}
        </NavLink>


        <NavLink to="/agent-manage" className={linkClass} onClick={closeSidebar}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51]" />
              )}
              <UserCog size={18} />
              Agent Manage
            </>
          )}
        </NavLink>


        <NavLink to="/admin-manage" className={linkClass} onClick={closeSidebar}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51]" />
              )}
              <Shield size={18} />
              Admin Manage
            </>
          )}
        </NavLink>

      </nav>

      {/* Bottom Section */}
      <div className="mt-auto pb-10 flex flex-col">

        {/* Profile */}
        <NavLink
          onClick={closeSidebar}
          className={linkClass}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-0 h-full w-[5px] bg-[#00CE51]" />
              )}
              <User size={18} />
              <span>Profile</span>
            </>
          )}


        </NavLink>

        {/* Divider */}
        <div className="border-t border-[#1F1F1F] my-4"></div>

        <div>
          
            <Link
              to="/auth/login"
              className="flex items-center gap-3 text-green-400 hover:text-green-500 text-sm transition px-5"
            >
              <LogIn size={18} />
              Login
            </Link>

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