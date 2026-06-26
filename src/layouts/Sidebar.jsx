import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import logoLNG from "../assets/LNG-sm.webp";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useSidebar } from "../context/SidebarContext";
import { hasAnyPermission } from "../utils/authPermissions";
import { getApprovalBadgeCount } from "../utils/approvalBadge";
import { ACCESS, ACCESS_GROUPS } from "../config/accessControl";
import { ROUTES } from "../config/routes";

const groupTitleClass =
  "mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400";

const itemBaseClass =
  "group relative flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-all duration-200";

const normalizeMenuPath = (path) => {
  if (!path) return "";
  const cleanPath = path.split(/[?#]/)[0].replace(/\/+$/, "");
  return cleanPath || "/";
};

const isPathMatch = (pathname, path) => {
  const currentPath = normalizeMenuPath(pathname);
  const targetPath = normalizeMenuPath(path);

  if (targetPath === "/") return currentPath === "/";
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const { approvalCounts } = useNotification();
  const { isCollapsed, isMobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useSidebar();

  const canAccess = (permissions = []) => hasAnyPermission(user, permissions);
  const shouldCollapse = isCollapsed && !isMobileSidebarOpen;

  const canSeeOrganization = canAccess(ACCESS_GROUPS.ORGANIZATION);
  const canSeeHRWorkspace = canAccess(ACCESS_GROUPS.HR_WORKSPACE);
  const canApproveRequests = canAccess(ACCESS_GROUPS.REQUEST_APPROVALS);
  const canSeePersonalRequests = canAccess([...ACCESS.MY_LEAVE, ...ACCESS.MY_OT]);
  const canSeePayrollOps = canAccess(ACCESS_GROUPS.PAYROLL_OPS);
  const canSeeSystem = canAccess(ACCESS_GROUPS.SYSTEM);

  const [expandedDropdowns, setExpandedDropdowns] = useState({});

  const menuGroups = useMemo(
    () => [
      {
        title: "Cá nhân",
        items: [
          { path: ROUTES.DASHBOARD, label: "Tổng quan", icon: Home },
          { path: ROUTES.TIMESHEET, label: "Lịch làm việc", icon: CalendarCheck2, permissions: ACCESS.TIMESHEET },
          { path: ROUTES.MY_PAYSLIP, label: "Phiếu lương", icon: DollarSign, permissions: ACCESS.MY_PAYSLIP },
        ],
      },
      ...(canSeeOrganization || canSeeHRWorkspace || canApproveRequests || canSeePersonalRequests
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
                      path: ROUTES.DEPARTMENTS,
                      label: "Phòng ban",
                      icon: Network,
                      permissions: ACCESS.DEPARTMENTS,
                    },
                    {
                      path: ROUTES.TEAMS,
                      label: "Team",
                      icon: GitBranch,
                      permissions: ACCESS.TEAM_PAGES,
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
                      path: ROUTES.EMPLOYEES,
                      label: "Nhân viên",
                      icon: User,
                      permissions: ACCESS.EMPLOYEES,
                      scopeKey: "EMPLOYEES",
                    },
                    {
                      path: ROUTES.LEAVE_BALANCES,
                      label: "Công phép",
                      icon: CalendarCheck,
                      permissions: ACCESS.LEAVE_BALANCE,
                      scopeKey: "LEAVE_BALANCES",
                    },
                    {
                      path: ROUTES.HOLIDAYS,
                      label: "Lịch nghỉ",
                      icon: Timer,
                      permissions: ACCESS.HOLIDAYS,
                    },
                    {
                      path: ROUTES.ANNOUNCEMENTS,
                      label: "Thông báo",
                      icon: Bell,
                      permissions: ACCESS.ANNOUNCEMENTS,
                    },
                  ],
                },
                {
                  type: "dropdown",
                  key: "requests",
                  label: "Đơn từ",
                  icon: Plane,
                  badgeKeys: ["leave", "ot"],
                  children: [
                    {
                      path: ROUTES.LEAVE,
                      label: "Đơn nghỉ",
                      icon: CalendarMinus,
                      permissions: ACCESS.MY_LEAVE,
                    },
                    {
                      path: ROUTES.LEAVE_APPROVALS,
                      label: "Duyệt đơn nghỉ",
                      icon: ClipboardCheck,
                      permissions: ACCESS.LEAVE_APPROVALS,
                      badgeKey: "leave",
                    },
                    {
                      path: ROUTES.OVERTIME,
                      label: "Đơn OT",
                      icon: Timer,
                      permissions: ACCESS.MY_OT,
                    },
                    {
                      path: ROUTES.OVERTIME_APPROVALS,
                      label: "Duyệt đơn OT",
                      icon: ClipboardCheck,
                      permissions: ACCESS.OT_APPROVALS,
                      badgeKey: "ot",
                    },
                  ],
                },
              ],
            },
          ]
        : []),
      ...(canSeePayrollOps
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
                      path: ROUTES.ATTENDANCE,
                      label: "Chấm công",
                      icon: ClipboardCheck,
                      permissions: ACCESS.ATTENDANCE_ADMIN,
                      scopeKey: "ATTENDANCE",
                    },
                    {
                      path: ROUTES.PAYROLLS,
                      label: "Bảng lương",
                      icon: FileSpreadsheet,
                      permissions: ACCESS.PAYROLL_LIST,
                      scopeKey: "PAYROLLS",
                    },
                    {
                      path: ROUTES.PAYROLL_ENGINE,
                      label: "Tính lương",
                      icon: Landmark,
                      permissions: ACCESS.PAYROLL_ENGINE,
                    },
                  ],
                },
              ],
            },
          ]
        : []),
      ...(canSeeSystem
        ? [
            {
              title: "Hệ thống",
              items: [
                {
                  path: ROUTES.SYSTEM_ACCOUNTS,
                  label: "Quản lý tài khoản",
                  icon: UserCog,
                  permissions: ACCESS.USER_MANAGEMENT,
                },
                {
                  path: ROUTES.SYSTEM_SETTINGS,
                  label: "Cài đặt hệ thống",
                  icon: Settings,
                  permissions: ACCESS.SYSTEM_ADMIN,
                },
              ],
            },
          ]
        : []),
    ],
    [canApproveRequests, canSeeHRWorkspace, canSeeOrganization, canSeePayrollOps, canSeePersonalRequests, canSeeSystem],
  );

  const visibleMenuPaths = useMemo(() => {
    const paths = [];

    const addPathIfVisible = (item) => {
      if (!item.path) return;
      if (item.permissions && !hasAnyPermission(user, item.permissions)) return;
      paths.push(normalizeMenuPath(item.path));
    };

    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.type === "dropdown") {
          item.children.forEach(addPathIfVisible);
        } else {
          addPathIfVisible(item);
        }
      }
    }

    return [...new Set(paths)].sort((a, b) => b.length - a.length);
  }, [menuGroups, user]);

  const isMenuItemActive = useCallback((path) => {
    const targetPath = normalizeMenuPath(path);

    if (!isPathMatch(location.pathname, targetPath)) return false;

    const moreSpecificActivePath = visibleMenuPaths.find(
      (candidatePath) =>
        candidatePath !== targetPath &&
        candidatePath.startsWith(`${targetPath}/`) &&
        isPathMatch(location.pathname, candidatePath),
    );

    return !moreSpecificActivePath;
  }, [location.pathname, visibleMenuPaths]);

  useEffect(() => {
    if (shouldCollapse) {
      setExpandedDropdowns({});
      return;
    }

    const nextExpanded = {};
    for (const group of menuGroups) {
      for (const item of group.items) {
        if (item.type !== "dropdown") continue;
        const hasActiveChild = item.children.some((child) => isMenuItemActive(child.path));
        if (hasActiveChild) nextExpanded[item.key] = true;
      }
    }

    setExpandedDropdowns((prev) => ({ ...prev, ...nextExpanded }));
  }, [isMenuItemActive, menuGroups, shouldCollapse]);

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
    navigate(ROUTES.LOGIN);
  };

  const getBadgeCount = (item) => {
    return getApprovalBadgeCount(item, approvalCounts);
  };

  const renderBadge = (count, compact = false) => {
    if (!count) return null;
    const label = count > 99 ? "99+" : String(count);

    return (
      <span
        className={`${
          compact
            ? "absolute right-1 top-1 h-4 min-w-4 px-1 text-[10px]"
            : "ml-auto h-5 min-w-[20px] px-1.5 text-[11px]"
        } inline-flex items-center justify-center rounded-full bg-red-500 font-semibold text-white ring-2 ring-white`}
      >
        {label}
      </span>
    );
  };

  const renderNavItem = (item, isChild = false) => {
    const hasPermissionAccess = !item.permissions || canAccess(item.permissions);
    if (!hasPermissionAccess) return null;

    const Icon = item.icon;
    const isActive = isMenuItemActive(item.path);
    const badgeCount = getBadgeCount(item);

    return (
      <Link
        key={`${item.path}-${item.label}`}
        to={item.path}
        onClick={closeMobileSidebar}
        title={shouldCollapse ? item.label : ""}
        className={`${itemBaseClass} ${
          isActive
            ? "bg-blue-50 text-blue-700 shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        } ${shouldCollapse ? "justify-center px-0" : isChild ? "pl-9 pr-2.5" : "pr-3"}`}
      >
        {!shouldCollapse && isActive && (
          <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-blue-600" />
        )}
        <span
          className={`${
            shouldCollapse ? "" : "mr-3"
          } relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isActive ? "bg-white text-blue-700" : "text-slate-500 group-hover:text-slate-800"
          }`}
        >
          <Icon size={18} />
          {shouldCollapse && renderBadge(badgeCount, true)}
        </span>
        {!shouldCollapse && (
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate">{item.label}</span>
            {renderBadge(badgeCount)}
          </span>
        )}
      </Link>
    );
  };

  const renderDropdown = (item) => {
    const visibleChildren = item.children.filter(
      (child) => !child.permissions || canAccess(child.permissions),
    );
    if (!visibleChildren.length) return null;

    const Icon = item.icon;
    const isExpanded = !!expandedDropdowns[item.key];
    const isActive = visibleChildren.some((child) => isMenuItemActive(child.path));
    const badgeCount = getBadgeCount(item);

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
              } relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                isActive ? "bg-white text-blue-700" : "text-slate-500"
              }`}
            >
              <Icon size={18} />
              {shouldCollapse && renderBadge(badgeCount, true)}
            </span>
            {!shouldCollapse && (
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-left">{item.label}</span>
                {renderBadge(badgeCount)}
              </span>
            )}
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
                    item.type === "dropdown" ? renderDropdown(item) : renderNavItem(item),
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
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
