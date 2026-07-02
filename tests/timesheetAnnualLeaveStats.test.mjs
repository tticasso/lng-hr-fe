import assert from "node:assert/strict";

import {
  formatLeaveDays,
  getAnnualLeaveHistoryRows,
} from "../src/pages/timeSheet/utils/leaveStats.js";

assert.equal(formatLeaveDays(-3), "-3.00 công");
assert.deepEqual(getAnnualLeaveHistoryRows(null), []);

assert.deepEqual(
  getAnnualLeaveHistoryRows({
    history: [
      {
        action: "LEAVE_DEDUCTION",
        amount: -1,
        reason: "Nghỉ phép ngày 01/07",
        date: "2026-07-02T09:00:00",
        user: { username: "hr-admin" },
      },
      {
        action: "MONTHLY_ACCRUAL",
        amount: 1,
        reason: "Cộng phép tháng 07/2026",
        date: "2026-07-01T09:00:00",
      },
    ],
  }),
  [
    {
      key: "LEAVE_DEDUCTION-2026-07-02T09:00:00-0",
      label: "Trừ phép",
      amount: -1,
      reason: "Nghỉ phép ngày 01/07",
      dateLabel: "02/07/2026 09:00",
      userLabel: "hr-admin",
      tone: "negative",
    },
    {
      key: "MONTHLY_ACCRUAL-2026-07-01T09:00:00-1",
      label: "Cộng phép tháng",
      amount: 1,
      reason: "Cộng phép tháng 07/2026",
      dateLabel: "01/07/2026 09:00",
      userLabel: "Hệ thống",
      tone: "positive",
    },
  ],
);
