import test from "node:test";
import assert from "node:assert/strict";

import { buildBulkAttendancePayload } from "../src/components/modals/bulkAttendanceForm.js";

const formData = {
  dates: ["2026-07-01", "2026-07-02"],
  updateMode: "CHECK_OUT_ONLY",
  reasonType: "MANUAL_BULK",
  note: "Sửa giờ ra",
  checkIn: "08:00",
  checkOut: "17:30",
  status: "PRESENT",
  workDayValue: "1",
  employeeCodesText: "j2501, j2502\nj2503",
  excludeEmployeeCodesText: "",
  departmentIds: [],
  overwrite: false,
};

test("checkout-only bulk sends multiple dates without overwriting check-in or work value", () => {
  const payload = buildBulkAttendancePayload(formData, true);

  assert.deepEqual(payload.dates, ["2026-07-01", "2026-07-02"]);
  assert.deepEqual(payload.employeeCodes, ["J2501", "J2502", "J2503"]);
  assert.equal(payload.checkOut, "17:30");
  assert.equal(payload.overwrite, true);
  assert.equal(payload.dryRun, true);
  assert.equal("checkIn" in payload, false);
  assert.equal("status" in payload, false);
  assert.equal("workDayValue" in payload, false);
});

test("full bulk keeps the existing complete attendance payload", () => {
  const payload = buildBulkAttendancePayload({ ...formData, updateMode: "FULL" }, false);

  assert.equal(payload.checkIn, "08:00");
  assert.equal(payload.checkOut, "17:30");
  assert.equal(payload.status, "PRESENT");
  assert.equal(payload.workDayValue, 1);
  assert.equal(payload.overwrite, false);
});
