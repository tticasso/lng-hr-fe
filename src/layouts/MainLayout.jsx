import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { useSidebar } from "../context/SidebarContext";
import { ROUTES } from "../config/routes";

const MainLayout = () => {
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const isLeavePage =
    location.pathname === ROUTES.LEAVE ||
    location.pathname.startsWith(`${ROUTES.LEAVE}/`);
  const isOvertimePage =
    location.pathname === ROUTES.OVERTIME ||
    location.pathname.startsWith(`${ROUTES.OVERTIME}/`);
  const lockMainScroll =
    isLeavePage || isOvertimePage;

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar />

      <div className={`min-h-dvh min-w-0 flex flex-col transition-[margin-left] duration-300 ease-in-out ${isCollapsed ? "lg:ml-20" : "lg:ml-60"}`}>
        <Header />

        <main
          className={`mt-16 min-h-0 overflow-x-hidden px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6 ${
            lockMainScroll
              ? "overflow-y-auto sm:h-[calc(100dvh-4rem)] sm:overflow-y-hidden"
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
