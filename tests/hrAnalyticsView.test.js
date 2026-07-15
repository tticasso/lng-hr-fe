import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAttendanceInsightCards,
  buildAttendanceInsightTrendSeries,
  buildHRMetricCards,
  buildRequestStatusSeries,
  buildWorkforceComposition,
  getAttendanceHealth,
  getRequestAnalytics,
  getWorkforceSnapshot,
} from "../src/pages/Dashboard/hrAnalyticsView.js";

test("getWorkforceSnapshot derives tracked workforce from employee buckets", () => {
  const snapshot = getWorkforceSnapshot({
    employees: {
      active: 72,
      probation: 8,
      onLeave: 5,
    },
  });

  assert.equal(snapshot.totalTracked, 85);
  assert.equal(snapshot.active, 72);
  assert.equal(snapshot.probation, 8);
  assert.equal(snapshot.onLeave, 5);
});

test("buildAttendanceInsightCards exposes range anomaly totals", () => {
  const cards = buildAttendanceInsightCards({
    summary: {
      records: 40,
      late: 6,
      early: 4,
      missingCheckOuts: 2,
      noAttendanceRecords: 3,
      errors: 1,
    },
  });

  assert.deepEqual(
    cards.map((card) => card.key),
    ["records", "late", "early", "missingCheckOuts", "noAttendanceRecords", "errors"],
  );
  assert.deepEqual(
    cards.map((card) => card.label),
    ["Bản ghi", "Đi muộn", "Về sớm", "Thiếu check-out", "Không chấm công", "Lỗi"],
  );
  assert.equal(cards[0].detail, "0 có mặt");
  assert.equal(cards[3].detail, "0 thiếu check-in");
  assert.equal(cards[5].detail, "0 nghỉ phép");
  assert.equal(cards[1].value, 6);
  assert.equal(cards[4].value, 3);
});

test("buildAttendanceInsightTrendSeries maps daily rows for charts", () => {
  const series = buildAttendanceInsightTrendSeries({
    daily: [
      {
        date: "2026-07-14",
        label: "14/07",
        late: 2,
        early: 1,
        missingCheckOuts: 3,
        absentOrNoRecord: 4,
      },
    ],
  });

  assert.deepEqual(series[0], {
    date: "2026-07-14",
    label: "14/07",
    late: 2,
    early: 1,
    missingCheckOuts: 3,
    absentOrNoRecord: 4,
    maxValue: 4,
  });
});

test("buildWorkforceComposition returns chart-ready workforce segments", () => {
  const segments = buildWorkforceComposition({
    employees: { active: 72, probation: 8, onLeave: 5 },
  });

  assert.deepEqual(
    segments.map((segment) => segment.key),
    ["active", "probation", "onLeave"],
  );
  assert.deepEqual(
    segments.map((segment) => segment.label),
    ["Chính thức", "Thử việc", "Đang nghỉ"],
  );
  assert.equal(segments[0].value, 72);
  assert.equal(segments[0].percent, 85);
  assert.equal(segments[2].percent, 6);
});

test("buildRequestStatusSeries exposes request distribution for charts", () => {
  const series = buildRequestStatusSeries({
    summary: {
      pending: { total: 9 },
      approved: { total: 14 },
      rejected: { total: 2 },
      cancelled: { total: 1 },
    },
  });

  assert.equal(series.total, 26);
  assert.deepEqual(
    series.segments.map((segment) => segment.key),
    ["pending", "approved", "rejected", "cancelled"],
  );
  assert.deepEqual(
    series.segments.map((segment) => segment.label),
    ["Chờ duyệt", "Đã duyệt", "Từ chối", "Đã hủy"],
  );
  assert.equal(series.segments[1].percent, 54);
});

test("getAttendanceHealth calculates present rate and anomaly total", () => {
  const health = getAttendanceHealth({
    employees: {
      active: 72,
      probation: 8,
      onLeave: 5,
    },
    attendance: {
      present: 64,
      absent: 7,
      late: 4,
      missingCheckOuts: 3,
      records: 78,
      onLeave: 5,
    },
  });

  assert.equal(health.expectedEmployees, 85);
  assert.equal(health.presentRate, 75);
  assert.equal(health.anomalyTotal, 14);
  assert.equal(health.statusLabel, "Cần theo dõi");
});

test("getRequestAnalytics uses summary payload and falls back to request rows", () => {
  const fromSummary = getRequestAnalytics(
    {
      summary: {
        pending: { total: 9 },
        approved: { total: 14 },
        rejected: { total: 2 },
        cancelled: { total: 1 },
      },
    },
    {
      pendingCount: 1,
      approvedCount: 1,
      rejectedCount: 1,
      cancelledCount: 1,
      requests: [],
    },
  );

  assert.equal(fromSummary.total, 26);
  assert.equal(fromSummary.pending, 9);
  assert.equal(fromSummary.approvedRate, 54);

  const fallback = getRequestAnalytics(null, {
    pendingCount: 2,
    approvedCount: 3,
    rejectedCount: 1,
    cancelledCount: 0,
    requests: [{ id: "A" }, { id: "B" }],
  });

  assert.equal(fallback.total, 6);
  assert.equal(fallback.recentCount, 2);
  assert.equal(fallback.approvedRate, 50);
});

test("buildHRMetricCards keeps HR metrics separate from attendance metrics", () => {
  const cards = buildHRMetricCards({
    hrOverview: {
      date: "2026-06-20",
      employees: { active: 72, probation: 8, onLeave: 5 },
      attendance: {
        present: 64,
        absent: 7,
        late: 4,
        missingCheckOuts: 3,
        records: 78,
        onLeave: 5,
      },
      approvals: {
        totalPending: 9,
        pendingLeaves: 6,
        pendingOvertimes: 3,
        approvedOvertimesToday: 4,
      },
    },
  });

  assert.deepEqual(
    cards.map((card) => card.key),
    ["workforce", "pending", "ot"],
  );
  assert.deepEqual(
    cards.map((card) => card.label),
    ["Nhân sự theo dõi", "Đơn chờ duyệt", "OT đã duyệt"],
  );
  assert.equal(cards[0].value, 85);
  assert.equal(cards[1].detail, "6 nghỉ phép · 3 OT");
});
