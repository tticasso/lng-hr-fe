const toDays = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const HISTORY_ACTION_LABELS = {
  INITIAL_SETUP: "Khởi tạo",
  MONTHLY_ACCRUAL: "Cộng phép tháng",
  LEAVE_DEDUCTION: "Trừ phép",
  MANUAL_ADJUSTMENT: "Điều chỉnh thủ công",
  ANNUAL_RESET: "Reset năm",
  CARRY_OVER: "Chuyển phép",
  CARRY_OVER_RESET: "Reset phép chuyển",
  LEAVE_CANCEL_REFUND: "Hoàn phép do huỷ đơn",
};

export const formatLeaveDays = (value) => `${toDays(value).toFixed(2)} công`;

const formatHistoryDateTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const pad = (number) => String(number).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getHistoryTone = (amount) => {
  if (Number(amount) > 0) return "positive";
  if (Number(amount) < 0) return "negative";
  return "neutral";
};

export const getAnnualLeaveHistoryRows = (leaveBalance, limit = 5) =>
  [...(leaveBalance?.history || [])]
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, limit)
    .map((item, index) => {
      const amount = toDays(item.amount);

      return {
        key: item._id || `${item.action}-${item.date}-${index}`,
        label: HISTORY_ACTION_LABELS[item.action] || item.action || "Cập nhật",
        amount,
        reason: item.reason || "--",
        dateLabel: formatHistoryDateTime(item.date),
        userLabel: item.user?.username || "Hệ thống",
        tone: getHistoryTone(amount),
      };
    });
