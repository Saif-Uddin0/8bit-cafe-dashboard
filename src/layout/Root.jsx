import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "../components/global/Sidebar";
import Navbar from "../components/global/Navbar";

const Root = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-white">

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-[260px] px-1 h-screen shrink-0 bg-[#532C89]">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          {/* Overlay */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Sidebar */}
          <aside className="absolute left-0 top-0 h-full w-[210px] bg-[#532C89] shadow-lg">
            <Sidebar closeSidebar={() => setSidebarOpen(false)} />
          </aside>

        </div>
      )}

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