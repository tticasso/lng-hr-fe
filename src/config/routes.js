export const ROUTES = {
  DASHBOARD: "/",
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
  PROFILE: "/profile",
  TIMESHEET: "/timesheet",
  REQUESTS: "/requests",

  MY_PAYSLIP: "/payrolls/my",
  PAYROLLS: "/payrolls",
  PAYROLL_ENGINE: "/payrolls/engine",

  DEPARTMENTS: "/organization/departments",
  TEAMS: "/organization/teams",

  EMPLOYEES: "/hr/employees",
  employeeDetail: (id) => `/hr/employees/${id}`,
  ATTENDANCE: "/hr/attendance",
  LEAVE_BALANCES: "/hr/leave-balances",
  HOLIDAYS: "/hr/holidays",
  ANNOUNCEMENTS: "/hr/announcements",
  RECRUITMENT: "/hr/recruitment",
  BOARDING: "/hr/boarding",
  TRAINING: "/hr/training",

  LEAVE: "/requests/leave",
  LEAVE_APPROVALS: "/requests/leave/approvals",
  OVERTIME: "/requests/overtime",
  OVERTIME_APPROVALS: "/requests/overtime/approvals",

  NOTIFICATIONS: "/notifications",

  SYSTEM_ACCOUNTS: "/system/accounts",
  SYSTEM_ACCOUNT_REGISTER: "/system/accounts/register",
  SYSTEM_SETTINGS: "/system/settings",
};

export const routePath = (route) => route.replace(/^\//, "");
