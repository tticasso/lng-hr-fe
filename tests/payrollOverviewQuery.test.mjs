import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPayrollQueryParams,
  buildSelectedPayrollPayload,
  getSelectedPayrollsByStatus,
  getSelectedDraftPayrollIds,
} from "../src/pages/payroll/overview/payrollOverviewQuery.js";

test("payroll query includes selected employeeId", () => {
  assert.deepEqual(
    buildPayrollQueryParams({ employeeId: "emp-1", status: "DRAFT" }),
    { limit: 1000, employeeId: "emp-1" },
  );
});

test("payroll query omits empty employeeId", () => {
  assert.deepEqual(buildPayrollQueryParams({ employeeId: "" }), { limit: 1000 });
});

test("payroll query requests enough rows for period-level actions", () => {
  assert.deepEqual(buildPayrollQueryParams({}), { limit: 1000 });
});

test("selected payroll payload sends ids instead of falling back to period", () => {
  assert.deepEqual(
    buildSelectedPayrollPayload("2026-06", ["p1", "p2"]),
    { month: 6, year: 2026, payrollIds: ["p1", "p2"] },
  );
});

test("selected draft ids only include selected DRAFT payrolls", () => {
  assert.deepEqual(
    getSelectedDraftPayrollIds(
      [
        { _id: "draft-1", status: "DRAFT" },
        { _id: "finalized-1", status: "FINALIZED" },
        { _id: "draft-2", status: "DRAFT" },
      ],
      ["draft-2", "finalized-1"],
    ),
    ["draft-2"],
  );
});

test("selected payrolls by status keep only matching selected rows", () => {
  assert.deepEqual(
    getSelectedPayrollsByStatus(
      [
        { _id: "draft-1", status: "DRAFT" },
        { _id: "finalized-1", status: "FINALIZED" },
        { _id: "paid-1", status: "PAID" },
      ],
      ["paid-1", "draft-1"],
      ["FINALIZED", "PAID"],
    ).map((item) => item._id),
    ["paid-1"],
  );
});
