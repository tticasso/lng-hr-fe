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
      label: "Chính thức",
      value: snapshot.active,
      percent: chartPercent(snapshot.active, total),
      color: "#0058be",
      className: "bg-blue-600",
    },
    {
      key: "probation",
      label: "Thử việc",
      value: snapshot.probation,
      percent: chartPercent(snapshot.probation, total),
      color: "#8b5cf6",
      className: "bg-violet-500",
    },
    {
      key: "onLeave",
      label: "Đang nghỉ",
      value: snapshot.onLeave,
      percent: chartPercent(snapshot.onLeave, total),
      color: "#10b981",
      className: "bg-emerald-500",
    },
  ];
};

export const buildAttendanceInsightCards = (attendanceInsights = {}) => {
  const summary = attendanceInsights?.summary || {};

  return [
    {
      key: "records",
      label: "Bản ghi",
      value: toNumber(summary.records),
      detail: `${toNumber(summary.present)} có mặt`,
      tone: "blue",
    },
    {
      key: "late",
      label: "Đi muộn",
      value: toNumber(summary.late),
      detail: `${toNumber(summary.totalLateMinutes)} phút`,
      tone: "amber",
    },
    {
      key: "early",
      label: "Về sớm",
      value: toNumber(summary.early),
      detail: `${toNumber(summary.totalEarlyMinutes)} phút`,
      tone: "sky",
    },
    {
      key: "missingCheckOuts",
      label: "Thiếu check-out",
      value: toNumber(summary.missingCheckOuts),
      detail: `${toNumber(summary.missingCheckIn)} thiếu check-in`,
      tone: "violet",
    },
    {
      key: "noAttendanceRecords",
      label: "Không chấm công",
      value: toNumber(summary.noAttendanceRecords),
      detail: `${toNumber(summary.absentRecords)} vắng mặt`,
      tone: "rose",
    },
    {
      key: "errors",
      label: "Lỗi",
      value: toNumber(summary.errors),
      detail: `${toNumber(summary.onLeave)} nghỉ phép`,
      tone: "slate",
    },
  ];
};

export const buildAttendanceInsightTrendSeries = (attendanceInsights = {}) => (
  (attendanceInsights?.daily || []).map((item) => {
    const late = toNumber(item.late);
    const early = toNumber(item.early);
    const missingCheckOuts = toNumber(item.missingCheckOuts);
    const absentOrNoRecord = toNumber(item.absentOrNoRecord);

    return {
      date: item.date,
      label: item.label || item.date,
      late,
      early,
      missingCheckOuts,
      absentOrNoRecord,
      maxValue: Math.max(late, early, missingCheckOuts, absentOrNoRecord),
    };
  })
);

export const buildRequestStatusSeries = (hrRequestsSummary, fallback = {}) => {
  const analytics = getRequestAnalytics(hrRequestsSummary, fallback);
  const total = analytics.total;

  return {
    total,
    segments: [
      {
        key: "pending",
        label: "Chờ duyệt",
        value: analytics.pending,
        percent: chartPercent(analytics.pending, total),
        color: "#f59e0b",
        className: "bg-amber-500",
      },
      {
        key: "approved",
        label: "Đã duyệt",
        value: analytics.approved,
        percent: chartPercent(analytics.approved, total),
        color: "#10b981",
        className: "bg-emerald-500",
      },
      {
        key: "rejected",
        label: "Từ chối",
        value: analytics.rejected,
        percent: chartPercent(analytics.rejected, total),
        color: "#e11d48",
        className: "bg-rose-500",
      },
      {
        key: "cancelled",
        label: "Đã hủy",
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
  ].filter((card) => !["present", "absent", "late"].includes(card.key));
};
