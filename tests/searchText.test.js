import test from "node:test";
import assert from "node:assert/strict";

import { matchesSearchText, normalizeSearchText } from "../src/utils/searchText.js";

test("normalizeSearchText removes Vietnamese accents and lowercases text", () => {
  assert.equal(normalizeSearchText("Nguyễn Thị Ngọc Hà"), "nguyen thi ngoc ha");
  assert.equal(normalizeSearchText("Hà"), "ha");
  assert.equal(normalizeSearchText("ĐẶNG"), "dang");
});

test("matchesSearchText matches accented Vietnamese text with plain input", () => {
  assert.equal(matchesSearchText("Nguyễn Thị Ngọc Hà", "ha"), true);
  assert.equal(matchesSearchText("Nguyễn Thị Ngọc Hà", "Hà"), true);
  assert.equal(matchesSearchText("Nguyễn Thị Ngọc Hà", "nguyen ha"), true);
});

test("matchesSearchText searches across multiple fields", () => {
  assert.equal(matchesSearchText(["Nguyễn Thị Ngọc Hà", "NV001"], "ngoc nv"), true);
  assert.equal(matchesSearchText(["Nguyễn Thị Ngọc Hà", "Kế toán"], "sales"), false);
});
