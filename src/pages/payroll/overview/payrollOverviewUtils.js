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

export const ADJUSTMENT_TYPE_LABELS = {
  EARNING: "Điều chỉnh cộng",
  ALLOWANCE: "Phụ cấp bổ sung",
  DEDUCTION: "Khấu trừ khác",
};

export const ADJUSTMENT_CODE_LABELS = {
  BONUS: "Thưởng",
  PENALTY: "Phạt",
  ADVANCE: "Tạm ứng",
  ARREARS: "Truy lĩnh",
  OTHER: "Khác",
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
export const formatPercent = (amount) => `${(Number(amount || 0) * 100).toFixed(0)}%`;

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

export const getSalaryPeriodBreakdownItems = (row) => {
  const breakdown = row?.salaryPeriodBreakdown || {};
  const baseDailyRate = Number(breakdown.baseDailyRate || row?.baseSalary / (row?.standardWorkDays || 1) || 0);
  const fallbackDailyRate = Number(row?.dailyRate || 0);
  const fallbackAmount = Number(row?.salaryFromWork || 0);
  const fallbackDays = Number(row?.actualWorkDays || 0);
  const fallbackMultiplier = Number(row?.salaryMultiplier || 1);
  const hasSavedBreakdown =
    Number(breakdown.probation?.workDays || 0) > 0 ||
    Number(breakdown.official?.workDays || 0) > 0 ||
    Number(breakdown.totalAmount || 0) > 0;

  const rawItems = hasSavedBreakdown
    ? [
        {
          key: "probation",
          label: "Công thử việc",
          workDays: Number(breakdown.probation?.workDays || 0),
          multiplier: Number(breakdown.probation?.multiplier || 0.85),
          dailyRate: Number(breakdown.probation?.dailyRate || baseDailyRate * 0.85),
          value: Number(breakdown.probation?.amount || 0),
        },
        {
          key: "official",
          label: "Công chính thức",
          workDays: Number(breakdown.official?.workDays || 0),
          multiplier: Number(breakdown.official?.multiplier || 1),
          dailyRate: Number(breakdown.official?.dailyRate || baseDailyRate),
          value: Number(breakdown.official?.amount || 0),
        },
      ]
    : [
        {
          key: fallbackMultiplier < 1 ? "probation" : "official",
          label: fallbackMultiplier < 1 ? "Công theo hệ số thử việc" : "Công chính thức",
          workDays: fallbackDays,
          multiplier: fallbackMultiplier,
          dailyRate: fallbackDailyRate,
          value: fallbackAmount,
        },
      ];

  return rawItems
    .map((item) => ({
      ...item,
      value: Math.round(Number(item.value || 0)),
      formulaText: `${formatDays(item.workDays)} x ${formatMoney(item.dailyRate)} x ${formatPercent(item.multiplier)}`,
    }))
    .filter((item) => item.workDays > 0 || item.value > 0);
};

export const getAdjustmentBreakdownItems = (row) =>
  (row?.adjustmentBreakdown || [])
    .map((item, index) => {
      const type = item.type || "";
      const amount = Number(item.amount || 0);
      const sign = type === "DEDUCTION" ? -1 : 1;

      return {
        key: item.adjustmentId || `${item.code || "ADJ"}-${index}`,
        label: item.name || ADJUSTMENT_CODE_LABELS[item.code] || item.code || "Điều chỉnh",
        value: sign * amount,
        rawAmount: amount,
        type,
        code: item.code,
        note: item.note,
        formulaText: ADJUSTMENT_TYPE_LABELS[type] || type,
      };
    })
    .filter((item) => item.rawAmount > 0);

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
