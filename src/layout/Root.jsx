import{ useState } from "react";
import {  Outlet } from "react-router";
import Sidebar from "../components/global/Sidebar";
import Navbar from "../components/global/Navbar";



const Root = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

//   const { user, loading } = useAuth();

//   if (loading) {
//     return <Loader />;
//   }

//   // user না থাকলে login page
//   if (!user) {
//     return <Navigate to="/auth/login" replace />;
//   }

  return (

    <div className="flex min-h-screen bg-[#F7F7FA] text-white relative">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] border-r border-[#FFFFFF] h-screen sticky top-0">
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
          <div className="absolute left-0 top-0 h-full w-[260px] bg-[#FFFFFF] border-r border-[#2A2A2A]">

            <Sidebar closeSidebar={() => setSidebarOpen(false)} />

          </div>

        </div>
      )}

      {/* Right Section */}
      <div className="flex flex-col flex-1">

        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 bg-[#FFFFFF] min-h-[calc(100vh-80px)]">
          <Outlet />
        </main>

      </div>

    </div>

  );

};

export default Root;