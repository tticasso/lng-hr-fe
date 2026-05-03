import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSidebar } from "../context/SidebarContext";

const MainLayout = () => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const lockMainScroll =
    location.pathname.startsWith("/leave/") || location.pathname.startsWith("/ot/");

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />

      <div className={`min-h-dvh min-w-0 flex flex-col transition-[margin-left] duration-300 ease-in-out ${isCollapsed ? "lg:ml-20" : "lg:ml-60"}`}>
        <Header />

        <main
          className={`mt-16 min-h-0 overflow-x-hidden px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6 ${
            lockMainScroll
              ? "h-[calc(100dvh-4rem)] overflow-y-hidden"
              : "flex-1 overflow-y-auto"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
