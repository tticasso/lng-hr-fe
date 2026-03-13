import React, { useState } from "react";
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
  FileSpreadsheet,
  CalendarCheck,
  Timer,
  UserSquare,
  CalendarMinus,
  ChevronDown,
  ChevronRight,
  Building2,
  ClipboardCheck,
  Network,
  UserPlus,
  UserPlus2,
  Group,
  GitBranch,
  User,
  Menu,
  X,
} from "lucide-react";
import logoLNG from "../assets/LNG.png";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import TeamPages from "../pages/teamPages/TeamPages";

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  console.log("ROLE :", role);
  const NOTIFICATION_AVATAR = "https://res.cloudinary.com/drnzb64by/image/upload/v1773214517/z7609441220202_ae9c723f392d90214ab47b178bcafdcd_simbbv.jpg";
  const NOTIFICATION_AVATAR2 = "https://res.cloudinary.com/dplhdyxgl/image/upload/v1772177306/logo_j0iody.jpg";

  const [expandedDropdowns, setExpandedDropdowns] = useState({});
  const { isCollapsed, toggleSidebar } = useSidebar();

  const isAdmin = role === "ADMIN";
  const isHR = role === "HR";
  const isManager = role === "MANAGER";
  const isEmployee = role === "EMPLOYEE";
  const isLEADER = role === "LEADER";

  const toggleDropdown = (key) => {
    if (isCollapsed) {
      toggleSidebar();
    }
    setExpandedDropdowns(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Đóng tất cả dropdown khi sidebar thu gọn
  React.useEffect(() => {
    if (isCollapsed) {
      setExpandedDropdowns({});
    }
  }, [isCollapsed]);
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
      ],
    },
    // Hiển thị nhóm QUẢN LÝ NHÂN SỰ cho ADMIN, HR, MANAGER, LEADER
    ...(isAdmin || isHR || isManager || isLEADER
      ? [
        {
          title: "QUẢN LÝ NHÂN SỰ",
          items: [
            // Dropdown Phòng ban
            {
              type: "dropdown",
              key: "department",
              label: "Phòng ban",
              icon: <Building2 size={20} />,
              children: [
                {
                  path: "/department",
                  label: "Quản lý phòng ban",
                  icon: <Network size={20} />,
                  roles: ["ADMIN", "HR"]
                },
                {
                  path: "/hr/teampages",
                  label: "Quản lý Team",
                  icon: <GitBranch size={20} />,
                  roles: ["ADMIN", "HR", "MANAGER"]
                },
              ]
            },
            // Dropdown Nhân sự
            {
              type: "dropdown",
              key: "hr",
              label: "Nhân sự",
              icon: <Users size={20} />,
              children: [
                {
                  path: "/hr/employees",
                  label: "Nhân viên",
                  icon: <User size={20} />,
                  roles: ["ADMIN", "HR"]
                },
                {
                  path: "/hr/leavebalance",
                  label: "Quản lý số dư phép",
                  icon: <CalendarCheck size={20} />,
                  roles: ["ADMIN", "HR"]
                },
              ]
            },
            // Menu đơn
            {
              path: "/holiday",
              label: "Quản lý thời gian",
              icon: <Timer size={20} />,
              roles: ["ADMIN", "HR"]
            },
            {
              path: "/hr/announcements",
              label: "Thông báo",
              icon: <SquareStar size={20} />,
              roles: ["ADMIN", "HR"]
            },
            {
              path: "/leave",
              label: "Quản lý yêu cầu",
              icon: <Plane size={20} />,
              roles: ["ADMIN", "HR", "MANAGER", "LEADER"]
            },
          ],
        },
      ]
      : []),
    {
      title: "TIỀN LƯƠNG & PHÚC LỢI",
      items: [
        {
          path: "/payroll",
          label: "Bảng lương",
          icon: <DollarSign size={20} />
        },
        // Menu cho ADMIN và HR
        ...(isAdmin || isHR
          ? [
            {
              path: "/hr/attendance-admin",
              label: "Quản lý chấm công",
              icon: <ClipboardCheck size={20} />,
            },
            {
              path: "/allpayroll",
              label: "Bảng lương theo tháng",
              icon: <FileSpreadsheet size={20} />,
            },
            {
              path: "/hr/payroll-engine",
              label: "Công cụ tính lương",
              icon: <Landmark size={20} />,
            },


          ]
          : []),
      ],
    },
    // Chỉ hiển thị nhóm QUẢN TRỊ HỆ THỐNG cho ADMIN
    ...(isAdmin
      ? [
        {
          title: "QUẢN TRỊ HỆ THỐNG",
          items: [
            {
              path: "/admin/user-management",
              label: "Quản lý tài khoản",
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
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 transition-[width] duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header with Logo */}
      <div className="h-20 flex items-center justify-center px-4 border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <img src={NOTIFICATION_AVATAR} alt="LNG Logo" className="w-36" />
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
            <img src={NOTIFICATION_AVATAR2} alt="LNG Logo" className="w-30" />
          </div>
        )}
      </div>

      {/* Toggle Button - Modern circular design */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-5 top-[85%] -translate-y-1/2 z-50 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95 group border border-gray-200"
        title={isCollapsed ? "Mở rộng menu" : "Thu gọn menu"}
      >
        <ChevronRight
          size={20}
          className={`text-gray-600 transition-transform duration-300 group-hover:text-gray-800 group-hover:scale-110 ${isCollapsed ? '' : 'rotate-180'}`}
        />
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
        {menuGroups.map((group, index) => (
          <div key={index}>
            {!isCollapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </h3>
            )}

            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                // Kiểm tra quyền truy cập cho item đơn
                if (item.roles && !item.roles.includes(role)) {
                  return null;
                }

                // Render dropdown
                if (item.type === "dropdown") {
                  const isExpanded = expandedDropdowns[item.key];
                  const hasVisibleChildren = item.children.some(child =>
                    !child.roles || child.roles.includes(role)
                  );

                  if (!hasVisibleChildren) return null;

                  return (
                    <div key={`${group.title}-${item.key}`}>
                      <button
                        onClick={() => toggleDropdown(item.key)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm text-gray-500 hover:text-primary hover:bg-gray-50 ${isCollapsed ? 'justify-center' : ''}`}
                        title={isCollapsed ? item.label : ''}
                      >
                        <div className="flex items-center">
                          <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                          {!isCollapsed && <span>{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )
                        )}
                      </button>

                      {isExpanded && !isCollapsed && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child, childIndex) => {
                            // Kiểm tra quyền truy cập cho child
                            if (child.roles && !child.roles.includes(role)) {
                              return null;
                            }

                            return (
                              <NavLink
                                key={`${item.key}-${child.path}-${child.label}`}
                                to={child.path}
                                className={({ isActive }) => `
                                  relative flex items-center px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm
                                  ${isActive
                                    ? "bg-blue-50 text-primary"
                                    : "text-gray-500 hover:text-primary hover:bg-gray-50"
                                  }
                                `}
                              >
                                {({ isActive }) => (
                                  <>
                                    {isActive && (
                                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-md" />
                                    )}
                                    <span className="mr-3">{child.icon}</span>
                                    <span>{child.label}</span>
                                  </>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Render menu item thường
                return (
                  <NavLink
                    key={`${group.title}-${item.path}-${item.label}`}
                    to={item.path}
                    className={({ isActive }) => `
                      relative flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm
                      ${isActive
                        ? "bg-blue-50 text-primary"
                        : "text-gray-500 hover:text-primary hover:bg-gray-50"
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.label : ''}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !isCollapsed && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-md" />
                        )}
                        <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors font-medium group ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? "Đăng xuất" : ''}
        >
          <LogOut size={20} className="group-hover:text-red-600" />
          {!isCollapsed && <span className="group-hover:text-red-600">Đăng xuất</span>}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 text-xs text-center text-gray-400">
          © 2026 LNG Inc.
        </div>
      )}
    </div>
  );
};

export default Sidebar;
