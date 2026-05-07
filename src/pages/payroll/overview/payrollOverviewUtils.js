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

export const OT_TYPE_MULTIPLIERS = {
  weekday: 1.5,
  weekend: 2,
  holiday: 3,
  weekday_night: 1.8,
  weekend_night: 2.4,
  holiday_night: 3.9,
};

export const ALLOWANCE_TYPE_LABELS = {
  lunch: "Phụ cấp ăn trưa",
  fuel: "Phụ cấp xăng xe",
  responsibility: "Phụ cấp trách nhiệm",
  other: "Phụ cấp khác",
};

export const LEAVE_TYPE_LABELS = {
  annual: "Nghỉ phép năm",
  sick: "Nghỉ ốm",
  maternity: "Nghỉ thai sản",
  paternity: "Nghỉ vợ sinh",
  bereavement: "Nghỉ tang",
  wedding: "Nghỉ kết hôn",
  unpaid: "Nghỉ không lương",
  personal_paid: "Nghỉ việc riêng có lương",
  personal_unpaid: "Nghỉ việc riêng không lương",
};

export const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);

export const formatHours = (amount) => `${Number(amount || 0).toFixed(2)}h`;
export const formatDays = (amount) => `${Number(amount || 0).toFixed(2)} ngày`;

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

export const getOtPayBreakdownItems = (row) => {
  const otHours = row?.otHours || {};
  const otPayBreakdown = row?.otPayBreakdown || {};
  const hourlyRate = Number(row?.dailyRate || 0) / 8;

  return Object.keys(OT_TYPE_LABELS)
    .map((key) => {
      const hours = Number(otHours[key] || 0);
      const multiplier = OT_TYPE_MULTIPLIERS[key] || 0;
      const savedAmount = otPayBreakdown[key];
      const fallbackAmount = hours * multiplier * hourlyRate;
      const amount = savedAmount === undefined || savedAmount === null
        ? fallbackAmount
        : Number(savedAmount || 0);

      return {
        key,
        label: OT_TYPE_LABELS[key] || key,
        value: Math.round(amount),
        hours,
        multiplier,
        hourlyRate,
        formulaText: `${formatHours(hours)} x ${multiplier.toFixed(2)} x ${formatMoney(hourlyRate)}`,
      };
    })
    .filter((item) => item.hours > 0 || item.value > 0);
};

export const getAllowanceBreakdownItems = (row) =>
  Object.entries(row?.allowanceBreakdown || {})
    .map(([key, value]) => ({
      key,
      label: ALLOWANCE_TYPE_LABELS[key] || key,
      value: Number(value || 0),
    }))
    .filter((item) => item.value > 0);

export const getLeaveBreakdownItems = (row) => {
  const dailyRate = Number(row?.dailyRate || 0);

  return Object.keys(LEAVE_TYPE_LABELS)
    .map((key) => {
      const detail = row?.leaveBreakdown?.[key] || {};
      const days = Number(detail.days || 0);
      const paidDays = Number(detail.paidDays || 0);
      const unpaidDays = Number(detail.unpaidDays || 0);
      const paidAmount = Number(detail.paidAmount || paidDays * dailyRate || 0);
      const unpaidDeduction = Number(detail.unpaidDeduction || unpaidDays * dailyRate || 0);
      const netAmount = detail.netAmount !== undefined && detail.netAmount !== null
        ? Number(detail.netAmount || 0)
        : paidAmount - unpaidDeduction;

      return {
        key,
        label: LEAVE_TYPE_LABELS[key],
        value: netAmount,
        days,
        paidDays,
        unpaidDays,
        paidAmount: Math.round(paidAmount),
        unpaidDeduction: Math.round(unpaidDeduction),
        netAmount: Math.round(netAmount),
        formulaText: `${formatDays(days)} | Có lương ${formatDays(paidDays)} x ${formatMoney(dailyRate)} | Không lương ${formatDays(unpaidDays)} x ${formatMoney(dailyRate)}`,
      };
    })
    .filter((item) => item.days > 0 || item.paidAmount > 0 || item.unpaidDeduction > 0);
};
