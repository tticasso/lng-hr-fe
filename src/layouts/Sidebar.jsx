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
  console.log("ROLE :", role);
  
  const isAdmin = role === "ADMIN";
  const isHR = role === "HR";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";

  const menuGroups = [
    {
      title: "KHÔNG GIAN CÁ NHÂN",
      items: [
        { path: "/", label: "Tổng quan", icon: <Home size={20} /> },
        {
          path: "/timesheet",
          label: "Lịch làm việc",
          icon: <CalendarCheck2 size={20} />,
        },
        // Hiển thị "Yêu cầu của tôi" cho EMPLOYEE (không phải ADMIN, HR, MANAGER)
        ...(isEmployee
          ? [
              {
                path: "/leave",
                label: "Yêu cầu của tôi",
                icon: <Plane size={20} />,
              },
            ]
          : []),
      ],
    },
    // Hiển thị nhóm QUẢN LÝ NHÂN SỰ cho ADMIN, HR, MANAGER
    ...(isAdmin || isHR || isManager
      ? [
          {
            title: "QUẢN LÝ NHÂN SỰ",
            items: [
              // ADMIN và HR có đầy đủ menu
              ...(isAdmin || isHR
                ? [
                    {
                      path: "/hr/employees",
                      label: "Nhân viên",
                      icon: <Users size={20} />,
                    },
                    {
                      path: "/hr/attendance-admin",
                      label: "Quản lý chấm công",
                      icon: <Coins size={20} />,
                    },
                    {
                      path: "/hr/announcements",
                      label: "Thông báo",
                      icon: <SquareStar size={20} />,
                    },
                    {
                      path: "/hr/recruitment",
                      label: "Tuyển dụng",
                      icon: <BriefcaseBusiness size={20} />,
                    },
                    {
                      path: "/hr/boarding",
                      label: "On/Off Boarding",
                      icon: <Presentation size={20} />,
                    },
                  ]
                : []),
              // ADMIN, HR, MANAGER đều có "Quản lý yêu cầu"
              {
                path: "/leave",
                label: "Quản lý yêu cầu",
                icon: <Plane size={20} />,
              },
            ],
          },
        ]
      : []),
    {
      title: "TIỀN LƯƠNG & PHÚC LỢI",
      items: [
        { path: "/payroll", label: "Bảng lương", icon: <DollarSign size={20} /> },
        // Chỉ hiển thị 2 menu này cho ADMIN và HR
        ...(isAdmin || isHR
          ? [
              { path: "/hr/reports", label: "Báo cáo", icon: <FileText size={20} /> },
              {
                path: "/hr/payroll-engine",
                label: "Công cụ tính lương",
                icon: <Landmark size={20} />,
              },
            ]
          : []),
      ],
    },
    // Chỉ hiển thị nhóm QUẢN TRỊ HỆ THỐNG cho ADMIN (không có HR)
    ...(isAdmin
      ? [
          {
            title: "QUẢN TRỊ HỆ THỐNG",
            items: [
              {
                path: "/admin/user-management",
                label: "Quản lý người dùng",
                icon: <UserCog size={20} />,
              },
              {
                path: "/admin/system-admin",
                label: "Cài đặt hệ thống",
                icon: <Settings size={20} />,
              },
            ],
          },
        ]
      : []),
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

      <div className="p-4 text-xs text-center text-gray-400">
        © 2026 LNG Inc.
      </div>
    </div>
  );
};

export default Sidebar;
