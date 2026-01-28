import React from "react";
import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10">
      {/* Search Bar (Để trang trí cho chuyên nghiệp) */}
      <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên, phòng ban..."
          className="bg-transparent outline-none text-sm w-full text-gray-700"
        />
      </div>

      {/* User Info */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        <Link
          to="/profile"
          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-full"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800">
              Nguyễn Hữu Tần
            </p>
            <p className="text-xs text-gray-500">Human Resources</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            TN
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;
