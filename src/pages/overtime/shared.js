export const otTypeLabel = {
  WEEKDAY: "Ngày thường",
  WEEKEND: "Cuối tuần",
  HOLIDAY: "Ngày lễ",
};

export const statusLabel = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
};

export const actionButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors";

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
