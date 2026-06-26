import test from "node:test";
import assert from "node:assert/strict";

import { ACCESS } from "../src/config/accessControl.js";
import { hasAnyPermission, isSuperAdmin } from "../src/utils/authPermissions.js";

test("ADMIN role name alone is not a super admin bypass", () => {
  assert.equal(isSuperAdmin({ role: { name: "ADMIN", permissions: [] } }), false);
});

test("MANAGE_SYSTEM permission is the only super admin bypass", () => {
  assert.equal(isSuperAdmin({ permissionNames: ["MANAGE_SYSTEM"] }), true);
  assert.equal(hasAnyPermission({ permissionNames: ["MANAGE_SYSTEM"] }, ACCESS.PAYROLL_ENGINE), true);
});

test("personal access constants match backend self-service permissions", () => {
  assert.deepEqual(ACCESS.PROFILE, ["READ_MY_PROFILE"]);
  assert.deepEqual(ACCESS.TIMESHEET, ["READ_MY_ATTENDANCE"]);
  assert.deepEqual(ACCESS.MY_PAYSLIP, ["READ_MY_PAYSLIP"]);
  assert.deepEqual(ACCESS.MY_LEAVE, ["READ_MY_LEAVE"]);
  assert.deepEqual(ACCESS.MY_OT, ["READ_MY_OT"]);
});
