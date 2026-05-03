export const getCurrentPayrollPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const statusOptions = [
  { value: "FINALIZED", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "DRAFT", label: "Xem trước" },
];

export const OT_TYPE_LABELS = {
  weekday: "OT ngày thường",
  weekend: "OT cuối tuần",
  holiday: "OT ngày lễ",
  weekday_night: "OT đêm ngày thường",
  weekend_night: "OT đêm cuối tuần",
  holiday_night: "OT đêm ngày lễ",
};

export const ALLOWANCE_TYPE_LABELS = {
  lunch: "Phụ cấp ăn trưa",
  fuel: "Phụ cấp xăng xe",
  responsibility: "Phụ cấp trách nhiệm",
  other: "Phụ cấp khác",
};

export const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);

export const formatHours = (amount) => `${Number(amount || 0).toFixed(2)}h`;

export const getPayrollStatusLabel = (status) => {
  switch (status) {
    case "FINALIZED":
      return "Chưa thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "DRAFT":
      return "Xem trước";
    default:
      return status || "--";
  }
};

export const getPayrollStatusBadgeClass = (status) => {
  switch (status) {
    case "FINALIZED":
      return "bg-blue-100 text-blue-700";
    case "PAID":
      return "bg-green-100 text-green-700";
    case "DRAFT":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export const getOtBreakdownItems = (row) =>
  Object.entries(row?.otHours || {})
    .map(([key, value]) => ({
      key,
      label: OT_TYPE_LABELS[key] || key,
      value: Number(value || 0),
    }))
    .filter((item) => item.value > 0);

export const getAllowanceBreakdownItems = (row) =>
  Object.entries(row?.allowanceBreakdown || {})
    .map(([key, value]) => ({
      key,
      label: ALLOWANCE_TYPE_LABELS[key] || key,
      value: Number(value || 0),
    }))
    .filter((item) => item.value > 0);
