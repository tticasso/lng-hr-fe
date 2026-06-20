import test from "node:test";
import assert from "node:assert/strict";

import { getApprovalBadgeCount } from "../src/utils/approvalBadge.js";

test("approval badge count sums multiple badge keys for a parent menu", () => {
  assert.equal(
    getApprovalBadgeCount(
      { badgeKeys: ["leave", "ot"] },
      { leave: 2, ot: 3 },
    ),
    5,
  );
});

test("approval badge count keeps single child badge behavior", () => {
  assert.equal(
    getApprovalBadgeCount(
      { badgeKey: "leave" },
      { leave: 4, ot: 8 },
    ),
    4,
  );
});
