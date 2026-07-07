import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/global/Sidebar";
import Navbar from "../components/global/Navbar";

const Root = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* SVG Gradient definition once globally to prevent ID duplicates and reference loss */}
      <svg width="0" height="0" className="absolute animate-none">
        <defs>
          <linearGradient id="menuGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6C04D7" />
            <stop offset="100%" stopColor="#CD4ECD" />
          </linearGradient>
        </defs>
      </svg>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[260px] px-1 h-screen shrink-0 bg-[#532C89]">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Overlay */}
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-black/50"
        />

        {/* Sidebar */}
        <aside
          className={`absolute left-0 top-0 h-full w-[210px] bg-[#532C89] shadow-lg transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar closeSidebar={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* Right Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">

        {/* Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto md:no-scrollbar px-6 py-5 bg-white text-black">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default Root;