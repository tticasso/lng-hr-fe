export const leaveTypeLabel = {
  ANNUAL: "Nghỉ phép năm",
  UNPAID: "Nghỉ không lương",
  SICK: "Nghỉ ốm / bệnh",
  MATERNITY: "Nghỉ thai sản",
};

export const statusLabel = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors";

export const menuButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700";

export const normalizeStatus = (status) => {
  if (status === "CANCELED") return "CANCELLED";
  return status;
};

export const formatDate = (isoString) => {
  if (!isoString) return "--";
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateRange = (fromDate, toDate) => {
  const from = formatDate(fromDate);
  const to = formatDate(toDate);
  if (from === "--" && to === "--") return "--";
  if (from === to || to === "--") return from;
  if (from === "--") return to;
  return `${from} - ${to}`;
};

export const buildPageList = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
};

export const getEntityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

export const getStoredRole = () => {
  const raw = localStorage.getItem("role");
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export const hasRole = (role, target) => {
  if (typeof role === "string") return role === target;
  if (Array.isArray(role)) return role.includes(target);
  if (role?.name) return role.name === target;
  return false;
};

export const getRoleFlags = (role) => {
  const isAdmin = hasRole(role, "ADMIN");
  const isHR = hasRole(role, "HR");
  const isManager = hasRole(role, "MANAGER");
  const isLeader = hasRole(role, "LEADER");

  return {
    isAdmin,
    isHR,
    isManager,
    isLeader,
    canApprove: isAdmin || isHR || isManager || isLeader,
    isSuperApprover: isAdmin || isHR,
  };
};
