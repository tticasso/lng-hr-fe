import React from "react";
import { Outlet } from "react-router-dom"; // Outlet là nơi nội dung thay đổi sẽ hiện ra

import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  return (
    <div className="flex h-screen ">
      <Sidebar />

      <div className="flex-1 flex flex-col ml-64">
        <Header />

        {/* Nội dung trang (có scroll nếu dài quá) */}
        <main className="flex-1 mt-16 px-6 pt-3 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
