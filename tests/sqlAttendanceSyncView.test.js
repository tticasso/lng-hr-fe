import test from "node:test";
import assert from "node:assert/strict";

import {
  formatSyncDateTime,
  getSyncStatusTone,
  normalizeSyncPayload,
} from "../src/pages/admin/attendance/sqlAttendanceSyncView.js";

test("normalizeSyncPayload unwraps API response data", () => {
  assert.deepEqual(
    normalizeSyncPayload({
      data: {
        data: {
          status: "SUCCESS",
          operations: 3,
          skippedEmployees: ["J9999"],
        },
      },
    }),
    {
      status: "SUCCESS",
      operations: 3,
      skippedEmployees: ["J9999"],
    },
  );
});

test("getSyncStatusTone maps status to display tone", () => {
  assert.equal(getSyncStatusTone("SUCCESS"), "success");
  assert.equal(getSyncStatusTone("FAILED"), "error");
  assert.equal(getSyncStatusTone("anything"), "default");
});

test("formatSyncDateTime returns a stable fallback for empty values", () => {
  assert.equal(formatSyncDateTime(null), "--");
});
