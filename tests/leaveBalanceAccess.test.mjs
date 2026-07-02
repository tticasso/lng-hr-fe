import test from "node:test";
import assert from "node:assert/strict";

import { ACCESS } from "../src/config/accessControl.js";
import {
  getLeaveBalanceReadMode,
  LEAVE_BALANCE_READ_MODES,
  LEAVE_BALANCE_WRITE_PERMISSION,
} from "../src/pages/leavebalance/leaveBalanceAccess.js";

const canAccess = (permissions) => (permission) => permissions.includes(permission);

test("leave balance page access includes own leave balance permission", () => {
  assert.equal(ACCESS.LEAVE_BALANCE.includes("READ_MY_LEAVE_BALANCE"), true);
  assert.equal(ACCESS.LEAVE_BALANCE.at(-1), LEAVE_BALANCE_WRITE_PERMISSION);
});

test("own-only leave balance users read from my leave balance endpoint", () => {
  assert.equal(
    getLeaveBalanceReadMode(canAccess(["READ_MY_LEAVE_BALANCE"])),
    LEAVE_BALANCE_READ_MODES.MINE,
  );
});

test("directory leave balance permissions keep list endpoint mode", () => {
  assert.equal(
    getLeaveBalanceReadMode(canAccess(["READ_LEAVE_BALANCES"])),
    LEAVE_BALANCE_READ_MODES.DIRECTORY,
  );
});
