import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CalendarCheck,
  CalendarCheck2,
  CalendarMinus,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  FileSpreadsheet,
  FolderKanban,
  GitBranch,
  Home,
  Landmark,
  LogOut,
  Network,
  Plane,
  Settings,
  Timer,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import logoLNG from "../assets/LNG.png";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

const parseStoredRole = () => {
  const raw = localStorage.getItem("role");

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") return parsed;
    return parsed?.name || raw || "";
  } catch {
    return raw || "";
  }
};

const groupTitleClass =
  "mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400";

const itemBaseClass =
  "group relative flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-all duration-200";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isCollapsed, isMobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useSidebar();

  const role = parseStoredRole();
  const shouldCollapse = isCollapsed && !isMobileSidebarOpen;

  const isAdmin = role === "ADMIN";
  const isHR = role === "HR";
  const isManager = role === "MANAGER";
  const isLeader = role === "LEADER";
  const isEmployee = role === "EMPLOYEE";

  const [expandedDropdowns, setExpandedDropdowns] = useState({});

  const menuGroups = useMemo(
    () => [
      {
        title: "Cá nhân",
        items: [
          { path: "/", label: "Tổng quan", icon: Home },
          { path: "/timesheet", label: "Lịch làm việc", icon: CalendarCheck2 },
          { path: "/payroll", label: "Phiếu lương", icon: DollarSign },
        ],
      },
      ...(isAdmin || isHR || isManager || isLeader || isEmployee
        ? [
            {
              title: "Nhân sự",
              items: [
                {
                  type: "dropdown",
                  key: "organization",
                  label: "Cơ cấu",
                  icon: Building2,
                  children: [
                    {
                      path: "/department",
                      label: "Phòng ban",
                      icon: Network,
                      roles: ["ADMIN", "HR", "MANAGER", "LEADER", "EMPLOYEE"],
                    },
                    {
                      path: "/hr/teampages",
                      label: "Team",
                      icon: GitBranch,
                      roles: ["ADMIN", "HR", "MANAGER", "LEADER", "EMPLOYEE"],
                    },
                  ],
                },
                {
                  type: "dropdown",
                  key: "workspace",
                  label: "Nghiệp vụ HR",
                  icon: Users,
                  children: [
                    {
                      path: "/hr/employees",
                      label: "Nhân viên",
                      icon: User,
                      roles: ["ADMIN", "HR"],
                    },
                    {
                      path: "/hr/leavebalance",
                      label: "Công phép",
                      icon: CalendarCheck,
                      roles: ["ADMIN", "HR"],
                    },
                    {
                      path: "/holiday",
                      label: "Lịch nghỉ",
                      icon: Timer,
                      roles: ["ADMIN", "HR"],
                    },
                    {
                      path: "/hr/announcements",
                      label: "Thông báo",
                      icon: Bell,
                      roles: ["ADMIN", "HR"],
                    },
                  ],
                },
                {
                  type: "dropdown",
                  key: "requests",
                  label: "Đơn từ",
                  icon: Plane,
                  children: [
                    {
                      path: "/leave/my",
                      label: "Đơn nghỉ",
                      icon: CalendarMinus,
                      roles: ["ADMIN", "HR", "MANAGER", "LEADER", "EMPLOYEE"],
                    },
                    {
                      path: "/leave/approvals",
                      label: "Duyệt đơn nghỉ",
                      icon: ClipboardCheck,
                      roles: ["ADMIN", "HR", "MANAGER", "LEADER"],
                    },
                    {
                      path: "/ot/my",
                      label: "Đơn OT",
                      icon: Timer,
                      roles: ["ADMIN", "HR", "MANAGER", "LEADER", "EMPLOYEE"],
                    },
                    {
                      path: "/ot/approvals",
                      label: "Duyệt đơn OT",
                      icon: ClipboardCheck,
                      roles: ["ADMIN", "HR", "MANAGER", "LEADER"],
                    },
                  ],
                },
              ],
            },
          ]
        : []),
      ...(isAdmin || isHR
        ? [
            {
              title: "Tiền lương",
              items: [
                {
                  type: "dropdown",
                  key: "payroll",
                  label: "Vận hành lương",
                  icon: FolderKanban,
                  children: [
                    {
                      path: "/hr/attendance-admin",
                      label: "Chấm công",
                      icon: ClipboardCheck,
                    },
                    {
                      path: "/allpayroll",
                      label: "Bảng lương",
                      icon: FileSpreadsheet,
                    },
                    {
                      path: "/hr/payroll-engine",
                      label: "Tính lương",
                      icon: Landmark,
                    },
                  ],
                },
              ],
            },
          ]
        : []),
      ...(isAdmin
        ? [
            {
              title: "Hệ thống",
              items: [
                {
                  path: "/admin/user-management",
                  label: "Quản lý tài khoản",
                  icon: UserCog,
                },
                {
                  path: "/admin/system-admin",
                  label: "Cài đặt hệ thống",
                  icon: Settings,
                },
              ],
            },
          ]
        : []),
    ],
    [isAdmin, isEmployee, isHR, isLeader, isManager]
  );

  useEffect(() => {
    if (shouldCollapse) {
      setExpandedDropdowns({});
      return;
    }

    const nextExpanded = {};
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.type !== "dropdown") continue;
        const hasActiveChild = item.children.some((child) =>
          location.pathname.startsWith(child.path)
        );
        if (hasActiveChild) nextExpanded[item.key] = true;
      }
    }

    setExpandedDropdowns((prev) => ({ ...prev, ...nextExpanded }));
  }, [location.pathname, menuGroups, shouldCollapse]);

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  const toggleDropdown = (key) => {
    if (shouldCollapse) {
      toggleSidebar();
      return;
    }

    setExpandedDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderNavItem = (item, isChild = false) => {
    if (item.roles && !item.roles.includes(role)) return null;

    const Icon = item.icon;

    return (
      <NavLink
        key={`${item.path}-${item.label}`}
        to={item.path}
        onClick={closeMobileSidebar}
        title={shouldCollapse ? item.label : ""}
        className={({ isActive }) =>
          `${itemBaseClass} ${
            isActive
              ? "bg-blue-50 text-blue-700 shadow-sm"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          } ${shouldCollapse ? "justify-center px-0" : isChild ? "pl-9 pr-2.5" : "pr-3"}`
        }
      >
        {({ isActive }) => (
          <>
            {!shouldCollapse && isActive && (
              <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-blue-600" />
            )}
            <span
              className={`${
                shouldCollapse ? "" : "mr-3"
              } flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isActive ? "bg-white text-blue-700" : "text-slate-500 group-hover:text-slate-800"
              }`}
            >
              <Icon size={18} />
            </span>
            {!shouldCollapse && <span className="truncate">{item.label}</span>}
          </>
        )}
      </NavLink>
    );
  };

  const renderDropdown = (item) => {
    const visibleChildren = item.children.filter(
      (child) => !child.roles || child.roles.includes(role)
    );
    if (!visibleChildren.length) return null;

    const Icon = item.icon;
    const isExpanded = !!expandedDropdowns[item.key];
    const isActive = visibleChildren.some((child) =>
      location.pathname.startsWith(child.path)
    );

    return (
      <div key={item.key}>
        <button
          type="button"
          onClick={() => toggleDropdown(item.key)}
          title={shouldCollapse ? item.label : ""}
          className={`${itemBaseClass} w-full ${
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          } ${shouldCollapse ? "justify-center px-0" : "justify-between pr-3"}`}
        >
          <div className={`flex items-center ${shouldCollapse ? "" : "min-w-0"}`}>
            <span
              className={`${
                shouldCollapse ? "" : "mr-3"
              } flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isActive ? "bg-white text-blue-700" : "text-slate-500"
              }`}
            >
              <Icon size={18} />
            </span>
            {!shouldCollapse && <span className="truncate text-left">{item.label}</span>}
          </div>
          {!shouldCollapse &&
            (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>

        {!shouldCollapse && isExpanded && (
          <div className="mt-1 space-y-1">
            {visibleChildren.map((child) => renderNavItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:z-40 ${
          isCollapsed ? "lg:w-20" : "lg:w-60"
        } w-60 ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="relative border-b border-slate-100 px-4 py-5">
          <div className={`flex items-center ${shouldCollapse ? "justify-center" : "gap-3"}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-100">
              <img src={logoLNG} alt="LNG" className="h-8 w-8 object-contain" />
            </div>
            {!shouldCollapse && (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">LNG HRM</p>
                <p className="truncate text-sm text-slate-500">Quản trị nhân sự nội bộ</p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={closeMobileSidebar}
            aria-label="Đóng menu"
          >
            <X size={20} />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute bottom-24 right-3 z-20 hidden h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 lg:flex"
          title={shouldCollapse ? "Mở rộng menu" : "Thu gọn menu"}
        >
          <ChevronRight size={16} className={shouldCollapse ? "" : "rotate-180"} />
        </button>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-5">
            {menuGroups.map((group) => (
              <section key={group.title}>
                {!shouldCollapse && <h3 className={groupTitleClass}>{group.title}</h3>}
                <div className="space-y-1">
                  {group.items.map((item) =>
                    item.type === "dropdown" ? renderDropdown(item) : renderNavItem(item)
                  )}
                </div>
              </section>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={shouldCollapse ? "Đăng xuất" : ""}
            className={`${itemBaseClass} w-full ${
              shouldCollapse ? "justify-center px-0" : "pr-3"
            } bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700`}
          >
            <span
              className={`${
                shouldCollapse ? "" : "mr-3"
              } flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/80`}
            >
              <LogOut size={18} />
            </span>
            {!shouldCollapse && <span>Đăng xuất</span>}
          </button>

          {!shouldCollapse && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <Plane size={14} />
              <span className="truncate">© 2026 LNG Inc.</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
