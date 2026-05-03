export const OT_TYPE_LABELS = {
  weekday: "Ngày thường",
  weekend: "Cuối tuần",
  holiday: "Ngày lễ",
  weekday_night: "Đêm ngày thường",
  weekend_night: "Đêm cuối tuần",
  holiday_night: "Đêm ngày lễ",
};

export const getCurrentPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const getMonthYear = (period) => {
  const [year, month] = period.split("-");
  return { month: parseInt(month, 10), year: parseInt(year, 10) };
};

export const ddmmyyyyToISO = (s) => {
  const [dd, mm, yyyy] = String(s).split("/");
  const d = String(dd).padStart(2, "0");
  const m = String(mm).padStart(2, "0");
  const y = String(yyyy);
  return `${y}-${m}-${d}`;
};

export const toISODate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const toIntSafe = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};

export const normalizeTimeOrFlag = (v) => {
  const s = String(v ?? "").trim();
  if (!s) return { value: "", flag: "" };

  if (/^v$/i.test(s)) return { value: "", flag: "V" };

  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const hh = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(2, "0");
    const mm = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(2, "0");
    return { value: `${hh}:${mm}`, flag: "" };
  }

  const m2 = s.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (m2) {
    const hh = String(Math.min(23, Math.max(0, Number(m2[1])))).padStart(2, "0");
    const mm = String(Math.min(59, Math.max(0, Number(m2[2])))).padStart(2, "0");
    return { value: `${hh}:${mm}`, flag: "" };
  }

  return { value: "", flag: `RAW:${s}` };
};

export const resolveDateISO = ({
  startDateISO,
  dayNumber,
  offsetIndex,
  fallbackPeriodYYYYMM,
}) => {
  if (startDateISO && /^\d{4}-\d{2}-\d{2}$/.test(startDateISO)) {
    const dt = new Date(`${startDateISO}T00:00:00`);
    if (!Number.isNaN(dt.getTime())) {
      dt.setDate(dt.getDate() + (offsetIndex || 0));
      return toISODate(dt);
    }
  }

  if (/^\d{4}-\d{2}$/.test(fallbackPeriodYYYYMM)) {
    const dd = String(dayNumber).padStart(2, "0");
    return `${fallbackPeriodYYYYMM}-${dd}`;
  }

  return null;
};

export const findColIndex = (row, keywords) => {
  const lower = row.map((c) =>
    String(c || "")
      .toLowerCase()
      .trim(),
  );

  for (let i = 0; i < lower.length; i += 1) {
    const cell = lower[i];
    if (!cell) continue;
    if (keywords.some((k) => cell === k || cell.includes(k))) return i;
  }

  return -1;
};

export const findHeaderRowIndex = (grid) => {
  const max = Math.min(grid.length, 60);
  for (let i = 0; i < max; i += 1) {
    const row = grid[i] || [];
    const rowLower = row.map((c) =>
      String(c || "")
        .toLowerCase()
        .trim(),
    );

    const hasSTT = rowLower.some((c) => c === "stt" || c.includes("stt"));
    const hasEmpCode = rowLower.some(
      (c) =>
        c.includes("mã nhân viên") ||
        c.includes("ma nhan vien") ||
        c.includes("mã nv") ||
        c.includes("ma nv"),
    );

    if (hasSTT && hasEmpCode) return i;
  }

  return -1;
};

export const findDayRowIndex = (grid, headerRowIndex) => {
  const start = headerRowIndex;
  const end = Math.min(grid.length - 1, headerRowIndex + 20);

  for (let i = start; i <= end; i += 1) {
    const row = grid[i] || [];
    const countDay = row.reduce((acc, v) => {
      const n = toIntSafe(v);
      if (Number.isFinite(n) && n >= 1 && n <= 31) return acc + 1;
      return acc;
    }, 0);

    if (countDay >= 1) return i;
  }

  return -1;
};

export const extractDayColumns = (dayRow) => {
  const cols = [];
  for (let c = 0; c < dayRow.length; c += 1) {
    const n = toIntSafe(dayRow[c]);
    if (Number.isFinite(n) && n >= 1 && n <= 31) {
      cols.push({ colIndex: c, dayNumber: n, offsetIndex: 0 });
    }
  }
  return cols;
};

export const extractStartDateISO = (grid, fallbackPeriodYYYYMM) => {
  const max = Math.min(grid.length, 40);
  const regex =
    /từ\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4}).*đến\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;

  for (let i = 0; i < max; i += 1) {
    const row = grid[i] || [];
    const joined = row.map((c) => String(c || "")).join(" ");
    const m = joined.match(regex);
    if (m?.[1]) return ddmmyyyyToISO(m[1]);
  }

  if (/^\d{4}-\d{2}$/.test(fallbackPeriodYYYYMM)) {
    return `${fallbackPeriodYYYYMM}-01`;
  }

  return null;
};

export const extractDateRangeFromGrid = (grid, fallbackPeriodYYYYMM) => {
  const max = Math.min(grid.length, 40);
  const regex =
    /từ\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4}).*đến\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;

  let fromDate = null;
  let toDate = null;

  for (let i = 0; i < max; i += 1) {
    const row = grid[i] || [];
    const joined = row.map((c) => String(c || "")).join(" ");
    const m = joined.match(regex);
    if (m?.[1] && m?.[2]) {
      fromDate = ddmmyyyyToISO(m[1]);
      toDate = ddmmyyyyToISO(m[2]);
      break;
    }
  }

  if (!fromDate || !toDate) {
    if (/^\d{4}-\d{2}$/.test(fallbackPeriodYYYYMM)) {
      const [year, month] = fallbackPeriodYYYYMM.split("-");
      const lastDay = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
      fromDate = `${fallbackPeriodYYYYMM}-01`;
      toDate = `${fallbackPeriodYYYYMM}-${String(lastDay).padStart(2, "0")}`;
    }
  }

  const [year, month] = (fromDate || `${fallbackPeriodYYYYMM}-01`).split("-");

  return {
    fromDate: fromDate || `${fallbackPeriodYYYYMM}-01`,
    toDate: toDate || `${fallbackPeriodYYYYMM}-31`,
    month: parseInt(month, 10),
    year: parseInt(year, 10),
  };
};

export const detectContext = (grid, fallbackPeriodYYYYMM) => {
  const headerRowIndex = findHeaderRowIndex(grid);

  if (headerRowIndex === -1) {
    return {
      headerRowIndex: -1,
      sttCol: -1,
      empCodeCol: -1,
      empNameCol: -1,
      deptCol: -1,
      dayRowIndex: -1,
      dayColumns: [],
      startDate: null,
    };
  }

  const headerRow = grid[headerRowIndex] || [];
  const sttCol = findColIndex(headerRow, ["stt"]);
  const empCodeCol = findColIndex(headerRow, [
    "mã nhân viên",
    "ma nhan vien",
    "mã nv",
    "ma nv",
  ]);
  const empNameCol = findColIndex(headerRow, [
    "tên nhân viên",
    "ten nhan vien",
    "họ tên",
    "ho ten",
  ]);
  const deptCol = findColIndex(headerRow, [
    "bộ phận",
    "bo phan",
    "phòng ban",
    "phong ban",
  ]);
  const dayRowIndex = findDayRowIndex(grid, headerRowIndex);
  const dayRow = grid[dayRowIndex] || [];
  const dayColumns = extractDayColumns(dayRow);

  dayColumns.forEach((d, idx) => {
    d.offsetIndex = idx;
  });

  const startDate = extractStartDateISO(grid, fallbackPeriodYYYYMM);

  return {
    headerRowIndex,
    sttCol: sttCol === -1 ? 0 : sttCol,
    empCodeCol: empCodeCol === -1 ? 1 : empCodeCol,
    empNameCol: empNameCol === -1 ? 2 : empNameCol,
    deptCol: deptCol === -1 ? 3 : deptCol,
    dayRowIndex,
    dayColumns,
    startDate,
  };
};

export const parseAttendanceGrid = (grid, fallbackPeriodYYYYMM) => {
  if (!Array.isArray(grid) || grid.length === 0) {
    return [];
  }

  const ctx = detectContext(grid, fallbackPeriodYYYYMM);
  const {
    headerRowIndex,
    sttCol,
    empCodeCol,
    empNameCol,
    deptCol,
    dayRowIndex,
    dayColumns,
    startDate,
  } = ctx;

  if (headerRowIndex === -1 || dayRowIndex === -1 || !dayColumns.length) {
    throw new Error(
      "Không nhận diện được cấu trúc file (header/ngày). Vui lòng kiểm tra template chấm công.",
    );
  }

  const records = [];
  const startScan = dayRowIndex + 1;

  for (let r = startScan; r < grid.length; r += 1) {
    const row = grid[r] || [];
    const sttVal = row?.[sttCol];
    const sttNum = toIntSafe(sttVal);

    if (!Number.isFinite(sttNum)) {
      const rowText = (row || []).join(" ").toLowerCase();
      if (
        rowText.includes("tổng") ||
        rowText.includes("ký") ||
        rowText.includes("xác nhận")
      ) {
        break;
      }
      continue;
    }

    const rowIn = row;
    const rowOut = grid[r + 1] || [];
    const employeeCode = String(rowIn?.[empCodeCol] || "").trim();
    const employeeName = String(rowIn?.[empNameCol] || "").trim();
    const department = String(rowIn?.[deptCol] || "").trim();
    const baseInfo = { employeeCode, employeeName, department };

    for (let i = 0; i < dayColumns.length; i += 1) {
      const { colIndex, dayNumber, offsetIndex } = dayColumns[i];
      const inRaw = rowIn?.[colIndex];
      const outRaw = rowOut?.[colIndex];
      const inNorm = normalizeTimeOrFlag(inRaw);
      const outNorm = normalizeTimeOrFlag(outRaw);

      if (!inNorm.value && !outNorm.value && !inNorm.flag && !outNorm.flag) {
        continue;
      }

      const dateISO = resolveDateISO({
        startDateISO: startDate,
        dayNumber,
        offsetIndex,
        fallbackPeriodYYYYMM,
      });

      records.push({
        ...baseInfo,
        date: dateISO,
        checkIn: inNorm.value || null,
        checkOut: outNorm.value || null,
        note: [inNorm.flag, outNorm.flag].filter(Boolean).join(",") || null,
        raw: {
          in: inRaw ?? "",
          out: outRaw ?? "",
        },
      });
    }

    r += 1;
  }

  return records;
};
