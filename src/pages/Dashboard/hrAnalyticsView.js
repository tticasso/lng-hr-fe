const toNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const toPercent = (value, total) => {
  const safeTotal = toNumber(total);
  if (!safeTotal) return 0;
  return Math.round((toNumber(value) / safeTotal) * 100);
};

const chartPercent = (value, total) => Math.min(100, Math.max(0, toPercent(value, total)));

export const getWorkforceSnapshot = (hrOverview = {}) => {
  const employees = hrOverview?.employees || {};
  const active = toNumber(employees.active);
  const probation = toNumber(employees.probation);
  const onLeave = toNumber(employees.onLeave);

  return {
    active,
    probation,
    onLeave,
    totalTracked: active + probation + onLeave,
  };
};

export const getAttendanceHealth = (hrOverview = {}) => {
  const attendance = hrOverview?.attendance || {};
  const workforce = getWorkforceSnapshot(hrOverview);
  const expectedEmployees = workforce.totalTracked || toNumber(attendance.records);
  const present = toNumber(attendance.present);
  const absent = toNumber(attendance.absent);
  const late = toNumber(attendance.late);
  const onLeave = toNumber(attendance.onLeave);
  const missingCheckOuts = toNumber(attendance.missingCheckOuts);
  const anomalyTotal = absent + late + missingCheckOuts;
  const presentRate = toPercent(present, expectedEmployees);

  let statusLabel = "Ổn định";
  if (presentRate < 80 || anomalyTotal > 0) statusLabel = "Cần theo dõi";
  if (presentRate < 60) statusLabel = "Rủi ro cao";

  return {
    expectedEmployees,
    records: toNumber(attendance.records),
    present,
    absent,
    late,
    onLeave,
    missingCheckOuts,
    anomalyTotal,
    presentRate,
    absentRate: toPercent(absent, expectedEmployees),
    lateRate: toPercent(late, expectedEmployees),
    statusLabel,
  };
};

export const getRequestAnalytics = (hrRequestsSummary, fallback = {}) => {
  const summary = hrRequestsSummary?.summary;
  const pending = summary ? toNumber(summary.pending?.total) : toNumber(fallback.pendingCount);
  const approved = summary ? toNumber(summary.approved?.total) : toNumber(fallback.approvedCount);
  const rejected = summary ? toNumber(summary.rejected?.total) : toNumber(fallback.rejectedCount);
  const cancelled = summary ? toNumber(summary.cancelled?.total) : toNumber(fallback.cancelledCount);
  const total = pending + approved + rejected + cancelled;

  return {
    pending,
    approved,
    rejected,
    cancelled,
    total,
    recentCount: fallback.requests?.length || hrRequestsSummary?.requests?.length || 0,
    approvedRate: toPercent(approved, total),
    pendingRate: toPercent(pending, total),
  };
};

export const buildWorkforceComposition = (hrOverview = {}) => {
  const snapshot = getWorkforceSnapshot(hrOverview);
  const total = snapshot.totalTracked;

  return [
    {
      key: "active",
      label: "Chinh thuc",
      value: snapshot.active,
      percent: chartPercent(snapshot.active, total),
      color: "#0058be",
      className: "bg-blue-600",
    },
    {
      key: "probation",
      label: "Thu viec",
      value: snapshot.probation,
      percent: chartPercent(snapshot.probation, total),
      color: "#8b5cf6",
      className: "bg-violet-500",
    },
    {
      key: "onLeave",
      label: "Dang nghi",
      value: snapshot.onLeave,
      percent: chartPercent(snapshot.onLeave, total),
      color: "#10b981",
      className: "bg-emerald-500",
    },
  ];
};

export const buildAttendanceChartSeries = (hrOverview = {}) => {
  const health = getAttendanceHealth(hrOverview);
  const expected = health.expectedEmployees || health.records || 0;

  return [
    {
      key: "present",
      label: "Co mat",
      value: health.present,
      percent: chartPercent(health.present, expected),
      color: "#0058be",
      className: "bg-blue-600",
    },
    {
      key: "absent",
      label: "Vang",
      value: health.absent,
      percent: chartPercent(health.absent, expected),
      color: "#e11d48",
      className: "bg-rose-500",
    },
    {
      key: "late",
      label: "Di muon",
      value: health.late,
      percent: chartPercent(health.late, expected),
      color: "#f59e0b",
      className: "bg-amber-500",
    },
    {
      key: "missingCheckOuts",
      label: "Thieu out",
      value: health.missingCheckOuts,
      percent: chartPercent(health.missingCheckOuts, expected),
      color: "#0ea5e9",
      className: "bg-sky-500",
    },
  ];
};

export const buildRequestStatusSeries = (hrRequestsSummary, fallback = {}) => {
  const analytics = getRequestAnalytics(hrRequestsSummary, fallback);
  const total = analytics.total;

  return {
    total,
    segments: [
      {
        key: "pending",
        label: "Cho duyet",
        value: analytics.pending,
        percent: chartPercent(analytics.pending, total),
        color: "#f59e0b",
        className: "bg-amber-500",
      },
      {
        key: "approved",
        label: "Da duyet",
        value: analytics.approved,
        percent: chartPercent(analytics.approved, total),
        color: "#10b981",
        className: "bg-emerald-500",
      },
      {
        key: "rejected",
        label: "Tu choi",
        value: analytics.rejected,
        percent: chartPercent(analytics.rejected, total),
        color: "#e11d48",
        className: "bg-rose-500",
      },
      {
        key: "cancelled",
        label: "Da huy",
        value: analytics.cancelled,
        percent: chartPercent(analytics.cancelled, total),
        color: "#64748b",
        className: "bg-slate-500",
      },
    ],
  };
};

export const buildHRMetricCards = ({ hrOverview = {} } = {}) => {
  const workforce = getWorkforceSnapshot(hrOverview);
  const health = getAttendanceHealth(hrOverview);
  const approvals = hrOverview?.approvals || {};

  return [
    {
      key: "workforce",
      label: "Nhân sự theo dõi",
      value: workforce.totalTracked,
      detail: `${workforce.active} chính thức · ${workforce.probation} thử việc`,
      tone: "blue",
    },
    {
      key: "present",
      label: "Có mặt hôm nay",
      value: health.present,
      detail: `${health.presentRate}% tỷ lệ có mặt`,
      tone: "emerald",
    },
    {
      key: "absent",
      label: "Vắng mặt",
      value: health.absent,
      detail: `${health.onLeave} nghỉ phép`,
      tone: "rose",
    },
    {
      key: "late",
      label: "Đi muộn",
      value: health.late,
      detail: `${health.missingCheckOuts} thiếu check-out`,
      tone: "amber",
    },
    {
      key: "pending",
      label: "Đơn chờ duyệt",
      value: toNumber(approvals.totalPending),
      detail: `${toNumber(approvals.pendingLeaves)} nghỉ phép · ${toNumber(approvals.pendingOvertimes)} OT`,
      tone: "violet",
    },
    {
      key: "ot",
      label: "OT đã duyệt",
      value: toNumber(approvals.approvedOvertimesToday),
      detail: `Ngày ${hrOverview?.date || "--"}`,
      tone: "sky",
    },
  ];
};
