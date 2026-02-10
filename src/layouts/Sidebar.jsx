import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  CalendarCheck2,
  Users,
  Plane,
  DollarSign,
  FileText,
  UserCog,
  Settings,
  Presentation,
  BriefcaseBusiness,
  Coins,
  Landmark,
  SquareStar,
  LogOut,
} from "lucide-react";
import logoLNG from "../assets/LNG.png";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isAdmin = role === "ADMIN";

  const menuGroups = [
    {
      title: "PERSONAL WORKSPACE",
      items: [
        { path: "/", label: "Dashboard", icon: <Home size={20} /> },
        {
          path: "/timesheet",
          label: "My Calendar",
          icon: <CalendarCheck2 size={20} />,
        },
        // ✅ Không phải ADMIN mới hiển thị My Request
        ...(isAdmin
          ? []
          : [
              {
                path: "/leave",
                label: "My Request",
                icon: <Plane size={20} />,
              },
            ]),
      ],
    },
    {
      title: "HR MANAGEMENT",
      items: [
        {
          path: "/hr/employees",
          label: "Employee",
          icon: <Users size={20} />,
        },
        {
          path: "/hr/attendance-admin",
          label: "Management",
          icon: <Coins size={20} />,
        },
        {
          path: "/hr/announcements",
          label: "Announcement",
          icon: <SquareStar size={20} />,
        },
        {
          path: "/hr/recruitment",
          label: "Recruitment",
          icon: <BriefcaseBusiness size={20} />,
        },
        {
          path: "/hr/boarding",
          label: "On/Off Boarding",
          icon: <Presentation size={20} />,
        },
        // ✅ ADMIN mới hiển thị Requesting Manager trong HR MANAGEMENT
        ...(isAdmin
          ? [
              {
                path: "/leave",
                label: "Requesting Manager",
                icon: <Plane size={20} />,
              },
            ]
          : []),
      ],
    },
    {
      title: "PAYROLL & C&B",
      items: [
        { path: "/payroll", label: "Payroll", icon: <DollarSign size={20} /> },
        { path: "/hr/reports", label: "Reports", icon: <FileText size={20} /> },
        {
          path: "hr/payroll-engine",
          label: "Payroll Engine",
          icon: <Landmark size={20} />,
        },
      ],
    },
    {
      title: "SYSTEM ADMIN",
      items: [
        {
          path: "/admin/user-management",
          label: "User Management",
          icon: <UserCog size={20} />,
        },
        {
          path: "/admin/system-admin",
          label: "Settings",
          icon: <Settings size={20} />,
        },
      ],
    },
  ];

  const { logout } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("role");
    logout();
    navigate("/login");
    console.log("logout");
  };

  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      {/* 1. LOGO AREA */}
      <div className="h-20 flex items-center">
        <div className="flex items-center gap-2 px-6">
          <img src={logoLNG} alt="LNG Logo" className="w-36" />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>

            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={`${group.title}-${item.path}-${item.label}`}
                  to={item.path}
                  className={({ isActive }) => `
                    relative flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
                    ${
                      isActive
                        ? "bg-blue-50 text-primary"
                        : "text-gray-500 hover:text-primary hover:bg-gray-50"
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md" />
                      )}
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors font-medium group"
        >
          <LogOut size={20} className="group-hover:text-red-600" />
          <span className="group-hover:text-red-600">Đăng xuất</span>
        </button>
      </div>

      <div className="p-4 text-xs text-center text-gray-400">© 2026 LNG Inc.</div>
    </div>
  );
};

export default Sidebar;
