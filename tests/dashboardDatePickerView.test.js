import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";

import {
  DASHBOARD_DATE_PICKER_FORMAT,
  fromDashboardPickerDate,
  isAfterDashboardMaxDate,
  toDashboardPickerDate,
} from "../src/pages/Dashboard/dashboardDatePickerView.js";

test("dashboard date picker helpers preserve YYYY-MM-DD state values", () => {
  const value = toDashboardPickerDate("2026-07-15");

  assert.equal(DASHBOARD_DATE_PICKER_FORMAT, "DD/MM/YYYY");
  assert.equal(value.format(DASHBOARD_DATE_PICKER_FORMAT), "15/07/2026");
  assert.equal(fromDashboardPickerDate(value), "2026-07-15");
});

test("dashboard date picker disables dates after maxDate", () => {
  assert.equal(isAfterDashboardMaxDate(dayjs("2026-07-16"), "2026-07-15"), true);
  assert.equal(isAfterDashboardMaxDate(dayjs("2026-07-15"), "2026-07-15"), false);
  assert.equal(isAfterDashboardMaxDate(null, "2026-07-15"), false);
});
