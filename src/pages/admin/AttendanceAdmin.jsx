import React, { useEffect, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  Upload,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Edit,
  X,
  Save,
  Paperclip,
  Lock,
  Unlock,
} from "lucide-react";

import * as XLSX from "xlsx";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { toast } from "react-toastify";
import { attendancesAPI } from "../../apis/attendancesAPI";

const AttendanceAdmin = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2026-02"); // Mặc định tháng hiện tại
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPeriodLocked, setIsPeriodLocked] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [employeeDetail, setEmployeeDetail] = useState(null); // Chi tiết chấm công theo ngày

  // =========================
  // IMPORT EXCEL: UI HOOKS
  // =========================
  const fileInputRef = useRef(null);

  // Parse month và year từ selectedPeriod (format: "YYYY-MM")
  const getMonthYear = (period) => {
    const [year, month] = period.split("-");
    return { month: parseInt(month, 10), year: parseInt(year, 10) };
  };
  // =========================
  // HANDLE CLICK EMPLOYEE - CALL API CHI TIẾT
  // =========================
  const handleEmployeeClick = async (employee) => {
    try {
      setSelectedEmployee(employee);
      setLoadingDetail(true);
      
      const { month, year } = getMonthYear(selectedPeriod);
      
      console.log("CHECK : ", employee);
      console.log(`🔍 Fetching detail for employee: ${employee.employeeCode} (${month}/${year})`);
      
      const res = await attendancesAPI.getbyid(month, year, employee.employeeId);
      console.log("✅ DỮ LIỆU API CHI TIẾT:", res.data.data);
      
      // Set dữ liệu vào state
      setEmployeeDetail(res.data.data || []);
      
      // toast.success(`Đã tải chi tiết chấm công cho ${employee.fullName}`);
    } catch (error) {
      console.error("❌ Lỗi khi load chi tiết:", error);
      toast.error("Không thể tải chi tiết chấm công");
      setEmployeeDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Call API khi selectedPeriod thay đổi
  useEffect(() => {
    const callAPIattendances = async () => {
      try {
        setLoading(true);
        const { month, year } = getMonthYear(selectedPeriod);
        
        console.log(`📅 Fetching attendance data for: ${month}/${year}`);
        const res = await attendancesAPI.getall(month, year);
        
        console.log("✅ DỮ LIỆU CHẤM CÔNG:", res.data);
        setAttendanceData(res.data?.data || res.data || []);
        
        toast.success(`Đã tải dữ liệu chấm công tháng ${month}/${year}`);
      } catch (error) {
        console.error("❌ DỮ LIỆU CHẤM CÔNG có lỗi:", error);
        toast.error("Không thể tải dữ liệu chấm công");
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };
    
    callAPIattendances();
  }, [selectedPeriod])

  const handleImportClick = () => {
    // Không thay UI: chỉ trigger input file ẩn
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      toast.info("Đang xử lý file Excel...");
      
      // Parse Excel để lấy fromDate và toDate
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });

      const sheetName = wb.SheetNames?.[0];
      const ws = wb.Sheets?.[sheetName];
      if (!ws) throw new Error("Không đọc được sheet trong file Excel.");

      const grid = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        defval: "",
      });

      // Extract fromDate và toDate từ Excel
      const dateInfo = extractDateRangeFromGrid(grid, selectedPeriod);
      
      console.log("[IMPORT] Date info extracted:", dateInfo);

      // Chuẩn bị FormData để gửi API
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fromDate", dateInfo.fromDate); // YYYY-MM-DD
      formData.append("toDate", dateInfo.toDate);     // YYYY-MM-DD
      formData.append("month", dateInfo.month);       // 1-12
      formData.append("year", dateInfo.year);         // YYYY

      console.log("[IMPORT] Sending to API:", {
        fileName: file.name,
        fromDate: dateInfo.fromDate,
        toDate: dateInfo.toDate,
        month: dateInfo.month,
        year: dateInfo.year,
      });
      console.log("Detected records:", normalized.length);
      // console.table(normalized.slice(0, 50)); // xem nhanh 50 dòng đầu
      console.log("Full JSON:", normalized);
      console.groupEnd();

      // alert(
      //   `Đọc file thành công.\nTổng records chuẩn hoá: ${normalized.length}\nMở console để xem dữ liệu.`
      // );
      toast.success(
        `Import thành công`
      );
    } catch (err) {
      console.error("[IMPORT ATTENDANCE] Failed:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Import thất bại. Vui lòng kiểm tra format file Excel.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // =========================
  // IMPORT EXCEL: PARSER CORE
  // =========================
  const parseAttendanceGrid = (grid, fallbackPeriodYYYYMM) => {
    if (!Array.isArray(grid) || grid.length === 0) return [];

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
        "Không nhận diện được cấu trúc file (header/ngày). Vui lòng kiểm tra template chấm công."
      );
    }

    const records = [];
    const startScan = dayRowIndex + 1;

    for (let r = startScan; r < grid.length; r++) {
      const row = grid[r] || [];
      const sttVal = row?.[sttCol];

      // Dòng bắt đầu nhân viên: STT là số
      const sttNum = toIntSafe(sttVal);
      if (!Number.isFinite(sttNum)) {
        // Heuristic dừng: nếu vào vùng chữ ký/tổng kết (tuỳ template)
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

      // Nếu không có mã NV thì vẫn log nhưng gắn warning (tuỳ bạn)
      // Ở bước DB sẽ cần mapping/validate
      const baseInfo = {
        employeeCode,
        employeeName,
        department,
      };

      // Với mỗi cột ngày: lấy vào/ra
      for (let i = 0; i < dayColumns.length; i++) {
        const { colIndex, dayNumber, offsetIndex } = dayColumns[i];

        const inRaw = rowIn?.[colIndex];
        const outRaw = rowOut?.[colIndex];

        const inNorm = normalizeTimeOrFlag(inRaw);
        const outNorm = normalizeTimeOrFlag(outRaw);

        // Nếu cả hai rỗng thì bỏ qua (giảm noise)
        if (!inNorm.value && !outNorm.value && !inNorm.flag && !outNorm.flag)
          continue;

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

      // Nhảy qua dòng "Ra" vì đã dùng r+1
      r += 1;
    }

    return records;
  };

  const detectContext = (grid, fallbackPeriodYYYYMM) => {
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

    // Tìm dòng ngày (1..31)
    const dayRowIndex = findDayRowIndex(grid, headerRowIndex);
    const dayRow = grid[dayRowIndex] || [];
    const dayColumns = extractDayColumns(dayRow);

    // Gắn offsetIndex để resolve date theo startDate + offset (ổn cho template có 1..31 liên tiếp)
    dayColumns.forEach((d, idx) => (d.offsetIndex = idx));

    const startDate = extractStartDateISO(grid, fallbackPeriodYYYYMM);

    return {
      headerRowIndex,
      sttCol: sttCol === -1 ? 0 : sttCol,
      empCodeCol: empCodeCol === -1 ? 1 : empCodeCol,
      empNameCol: empNameCol === -1 ? 2 : empNameCol,
      deptCol: deptCol === -1 ? 3 : deptCol,
      dayRowIndex,
      dayColumns,
      startDate, // ISO YYYY-MM-DD hoặc null
    };
  };

  const findHeaderRowIndex = (grid) => {
    // Quét 0..50 dòng đầu để tìm dòng có "STT" và "Mã nhân viên"
    const max = Math.min(grid.length, 60);
    for (let i = 0; i < max; i++) {
      const row = grid[i] || [];
      const rowLower = row.map((c) =>
        String(c || "")
          .toLowerCase()
          .trim()
      );

      const hasSTT = rowLower.some((c) => c === "stt" || c.includes("stt"));
      const hasEmpCode = rowLower.some(
        (c) =>
          c.includes("mã nhân viên") ||
          c.includes("ma nhan vien") ||
          c.includes("mã nv") ||
          c.includes("ma nv")
      );

      if (hasSTT && hasEmpCode) return i;
    }
    return -1;
  };

  const findDayRowIndex = (grid, headerRowIndex) => {
    // Thường nằm gần header, quét thêm 1..12 dòng sau header
    const start = headerRowIndex;
    const end = Math.min(grid.length - 1, headerRowIndex + 20);

    for (let i = start; i <= end; i++) {
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

  const extractDayColumns = (dayRow) => {
    const cols = [];
    for (let c = 0; c < dayRow.length; c++) {
      const n = toIntSafe(dayRow[c]);
      if (Number.isFinite(n) && n >= 1 && n <= 31) {
        cols.push({ colIndex: c, dayNumber: n, offsetIndex: 0 });
      }
    }
    return cols;
  };

  const findColIndex = (row, keywords) => {
    const lower = row.map((c) =>
      String(c || "")
        .toLowerCase()
        .trim()
    );
    for (let i = 0; i < lower.length; i++) {
      const cell = lower[i];
      if (!cell) continue;
      if (keywords.some((k) => cell === k || cell.includes(k))) return i;
    }
    return -1;
  };

  const extractStartDateISO = (grid, fallbackPeriodYYYYMM) => {
    // Tìm text kiểu: "Từ ngày 17/12/2025 đến ngày 17/12/2025"
    const max = Math.min(grid.length, 40);
    const regex =
      /từ\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4}).*đến\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;

    for (let i = 0; i < max; i++) {
      const row = grid[i] || [];
      const joined = row.map((c) => String(c || "")).join(" ");
      const m = joined.match(regex);
      if (m?.[1]) {
        return ddmmyyyyToISO(m[1]);
      }
    }

    // Fallback: dùng selectedPeriod (YYYY-MM) và lấy ngày 01
    if (/^\d{4}-\d{2}$/.test(fallbackPeriodYYYYMM)) {
      return `${fallbackPeriodYYYYMM}-01`;
    }
    return null;
  };

  // =========================
  // HELPER: EXTRACT DATE RANGE FROM EXCEL (for API)
  // =========================
  const extractDateRangeFromGrid = (grid, fallbackPeriodYYYYMM) => {
    // Tìm text kiểu: "Từ ngày 17/12/2025 đến ngày 17/12/2025"
    const max = Math.min(grid.length, 40);
    const regex =
      /từ\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4}).*đến\s*ngày\s*(\d{1,2}\/\d{1,2}\/\d{4})/i;

    let fromDate = null;
    let toDate = null;

    for (let i = 0; i < max; i++) {
      const row = grid[i] || [];
      const joined = row.map((c) => String(c || "")).join(" ");
      const m = joined.match(regex);
      if (m?.[1] && m?.[2]) {
        fromDate = ddmmyyyyToISO(m[1]); // YYYY-MM-DD
        toDate = ddmmyyyyToISO(m[2]);   // YYYY-MM-DD
        break;
      }
    }

    // Fallback: dùng selectedPeriod (YYYY-MM)
    if (!fromDate || !toDate) {
      if (/^\d{4}-\d{2}$/.test(fallbackPeriodYYYYMM)) {
        const [year, month] = fallbackPeriodYYYYMM.split("-");
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
        fromDate = `${fallbackPeriodYYYYMM}-01`;
        toDate = `${fallbackPeriodYYYYMM}-${String(lastDay).padStart(2, "0")}`;
      }
    }

    // Extract month và year từ fromDate
    const [year, month] = (fromDate || fallbackPeriodYYYYMM + "-01").split("-");

    return {
      fromDate: fromDate || `${fallbackPeriodYYYYMM}-01`,
      toDate: toDate || `${fallbackPeriodYYYYMM}-31`,
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };
  };

  const resolveDateISO = ({
    startDateISO,
    dayNumber,
    offsetIndex,
    fallbackPeriodYYYYMM,
  }) => {
    // Ưu tiên: nếu có startDateISO thì date = startDateISO + offsetIndex ngày
    if (startDateISO && /^\d{4}-\d{2}-\d{2}$/.test(startDateISO)) {
      const dt = new Date(`${startDateISO}T00:00:00`);
      if (!Number.isNaN(dt.getTime())) {
        dt.setDate(dt.getDate() + (offsetIndex || 0));
        return toISODate(dt);
      }
    }

    // Fallback: ghép theo selectedPeriod + dayNumber
    if (/^\d{4}-\d{2}$/.test(fallbackPeriodYYYYMM)) {
      const dd = String(dayNumber).padStart(2, "0");
      return `${fallbackPeriodYYYYMM}-${dd}`;
    }

    // Nếu bất khả kháng
    return null;
  };

  const ddmmyyyyToISO = (s) => {
    const [dd, mm, yyyy] = String(s).split("/");
    const d = String(dd).padStart(2, "0");
    const m = String(mm).padStart(2, "0");
    const y = String(yyyy);
    return `${y}-${m}-${d}`;
  };

  const toISODate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const toIntSafe = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return NaN;
    // Nếu cell là "17" hoặc "17.0"
    const n = Number(s);
    return Number.isFinite(n) ? Math.trunc(n) : NaN;
  };

  const normalizeTimeOrFlag = (v) => {
    const s = String(v ?? "").trim();
    if (!s) return { value: "", flag: "" };

    // Flag dạng "V" (đi làm nhưng không có giờ cụ thể)
    if (/^v$/i.test(s)) return { value: "", flag: "V" };

    // Time dạng "7:53" hoặc "07:53"
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
      const hh = String(Math.min(23, Math.max(0, Number(m[1])))).padStart(
        2,
        "0"
      );
      const mm = String(Math.min(59, Math.max(0, Number(m[2])))).padStart(
        2,
        "0"
      );
      return { value: `${hh}:${mm}`, flag: "" };
    }

    // Một số file có thể trả "07:53:00" -> cắt
    const m2 = s.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
    if (m2) {
      const hh = String(Math.min(23, Math.max(0, Number(m2[1])))).padStart(
        2,
        "0"
      );
      const mm = String(Math.min(59, Math.max(0, Number(m2[2])))).padStart(
        2,
        "0"
      );
      return { value: `${hh}:${mm}`, flag: "" };
    }

    // Giữ lại dạng khác để debug
    return { value: "", flag: `RAW:${s}` };
  };

  // =========================
  // DỮ LIỆU UI DEMO (GIỮ NGUYÊN)
  // =========================
  const attendanceSummary = [
    {
      id: "EMP089",
      name: "Nguyễn Văn An",
      dept: "Product",
      workDays: 22,
      otHours: 3.5,
      leaveDays: 0,
      lateCount: 0,
      hasError: false,
      status: "Valid",
      avatar: "NA",
    },
    {
      id: "EMP090",
      name: "Lê Thị Hoa",
      dept: "Design",
      workDays: 21,
      otHours: 0,
      leaveDays: 1,
      lateCount: 3,
      hasError: false,
      status: "Warning",
      avatar: "LH",
    },
    {
      id: "EMP091",
      name: "Phạm Văn Dũng",
      dept: "Sales",
      workDays: 18,
      otHours: 10,
      leaveDays: 0,
      lateCount: 1,
      hasError: true,
      status: "Error",
      avatar: "PD",
    },
    {
      id: "EMP102",
      name: "Hoàng Thị G",
      dept: "Marketing",
      workDays: 20,
      otHours: 0,
      leaveDays: 2,
      lateCount: 0,
      hasError: false,
      status: "Valid",
      avatar: "HG",
    },
  ];

  // =========================
  // RENDER
  // =========================
  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* Input file ẩn để import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* --- HEADER: TOOLBAR --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Quản trị Chấm công
            {isPeriodLocked ? (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                <Lock size={10} /> Đã khóa sổ
              </span>
            ) : (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                <Unlock size={10} /> Đang mở
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500">
            Tổng hợp dữ liệu công, tăng ca và nghỉ phép
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Period Selector */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
            <CalendarIcon size={16} className="text-gray-500 mr-2" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
            >
              <option value="2026-01">Tháng 1/2026</option>
              <option value="2026-02">Tháng 2/2026</option>
              <option value="2026-03">Tháng 3/2026</option>
              <option value="2026-04">Tháng 4/2026</option>
              <option value="2026-05">Tháng 5/2026</option>
              <option value="2026-06">Tháng 6/2026</option>
              <option value="2026-07">Tháng 7/2026</option>
              <option value="2026-08">Tháng 8/2026</option>
              <option value="2026-09">Tháng 9/2026</option>
              <option value="2026-10">Tháng 10/2026</option>
              <option value="2026-11">Tháng 11/2026</option>
              <option value="2026-12">Tháng 12/2026</option>
              <option value="2025-01">Tháng 1/2025</option>
              <option value="2025-02">Tháng 2/2025</option>
              <option value="2025-03">Tháng 3/2025</option>
              <option value="2025-04">Tháng 4/2025</option>
              <option value="2025-05">Tháng 5/2025</option>
              <option value="2025-06">Tháng 6/2025</option>
              <option value="2025-07">Tháng 7/2025</option>
              <option value="2025-08">Tháng 8/2025</option>
              <option value="2025-09">Tháng 9/2025</option>
              <option value="2025-10">Tháng 10/2025</option>
              <option value="2025-11">Tháng 11/2025</option>
              <option value="2025-12">Tháng 12/2025</option>
            </select>
          </div>

          {/* Import button: thêm onClick */}
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handleImportClick}
          >
            <Upload size={16} /> Import dữ liệu
          </Button>

          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={16} /> Xuất Excel
          </Button>

          <Button
            className={`w-48 flex items-center gap-2 text-white shadow-md ${isPeriodLocked
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
            onClick={() => setIsPeriodLocked(!isPeriodLocked)}
          >
            {isPeriodLocked ? <Unlock size={16} /> : <Lock size={16} />}
            {isPeriodLocked ? "Mở khóa sổ" : "Khóa sổ công"}
          </Button>
        </div>
      </div>

      {/* --- FILTERS & TABLE --- */}
      <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200 shadow-sm">
        {/* Filter Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-3 flex-1">
            <div className="relative max-w-sm w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Tìm tên hoặc mã nhân viên..."
                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Tất cả phòng ban</option>
              <option>Product</option>
              <option>Sales</option>
            </select>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Tất cả trạng thái</option>
              <option>Có lỗi (Missing)</option>
              <option>Đi muộn</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle size={16} className="text-red-500" />
            <span>
              Tìm thấy <strong>1</strong> nhân viên có lỗi chấm công
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Đang tải dữ liệu chấm công...</p>
              </div>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-gray-400">
                <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Không có dữ liệu chấm công</p>
                <p className="text-xs mt-1">Vui lòng import dữ liệu hoặc chọn kỳ khác</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white text-gray-500 font-bold border-b border-gray-200 uppercase text-xs sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-4 w-14 text-center">#</th>
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4">Phòng ban</th>
                  <th className="p-4 text-center">Ngày công</th>
                  <th className="p-4 text-center">OT (Giờ)</th>
                  <th className="p-4 text-center">Nghỉ phép</th>
                  <th className="p-4 text-center">Đi muộn</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {attendanceData.map((emp, index) => {
                  // Generate avatar từ fullName
                  const avatar = emp.fullName?.substring(0, 2).toUpperCase() || "??";
                  
                  return (
                    <tr
                      key={emp.employeeId || emp._id || index}
                      onClick={() => handleEmployeeClick(emp)}
                      className={`
                               cursor-pointer transition-colors group
                               ${emp.hasError
                          ? "bg-red-50/60 hover:bg-red-100/50"
                          : "hover:bg-blue-50/50"
                        }
                               ${selectedEmployee?.employeeId === emp.employeeId
                          ? " bg-blue-50"
                          : ""
                        }
                            `}
                    >
                      <td className="p-4 text-center text-gray-400 font-mono text-xs">
                        {index + 1}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            {avatar}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{emp.fullName || "--"}</p>
                            <p className="text-xs text-gray-500 font-mono">
                              {emp.employeeCode || "--"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{emp.department || "--"}</td>
                      <td className="p-4 text-center font-medium">
                        {emp.totalWorkDays?.toFixed(2) || 0}
                      </td>
                      <td className="p-4 text-center text-orange-600 font-medium">
                        {emp.totalOTHours?.toFixed(2) || 0}
                      </td>
                      <td className="p-4 text-center text-purple-600 font-medium">
                        {emp.paidLeaveDays || 0}
                      </td>
                      <td className="p-4 text-center text-red-600 font-medium">
                        {emp.lateCount || 0}
                      </td>
                      <td className="p-4 text-center">
                        {emp.hasError || emp.totalWorkDays === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">
                            <AlertCircle size={12} /> Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                            <CheckCircle2 size={12} /> Valid
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <MoreHorizontal
                          size={16}
                          className="text-gray-400 group-hover:text-blue-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* --- SIDE PANEL: DETAIL & EDIT --- */}
      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                  {selectedEmployee.fullName?.substring(0, 2).toUpperCase() || "??"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {selectedEmployee.fullName || "--"}
                  </h2>
                  <p className="text-sm text-gray-500 font-mono">
                    {selectedEmployee.employeeCode || "--"} • {selectedEmployee.department || "--"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Stats */}
            <div className="grid grid-cols-3 border-b border-gray-100">
              <div className="p-4 text-center border-r border-gray-100">
                <p className="text-xs text-gray-500 uppercase">Ngày công</p>
                <p className="text-xl font-bold text-blue-600">
                  {selectedEmployee.totalWorkDays?.toFixed(2) || 0}
                </p>
              </div>
              <div className="p-4 text-center border-r border-gray-100">
                <p className="text-xs text-gray-500 uppercase">Giờ OT</p>
                <p className="text-xl font-bold text-orange-600">
                  {selectedEmployee.totalOTHours?.toFixed(2) || 0}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500 uppercase">Đi muộn</p>
                <p className="text-xl font-bold text-red-600">
                  {selectedEmployee.lateCount || 0}
                </p>
              </div>
            </div>

            {/* Daily Logs Table */}
            <div className="flex-1 overflow-y-auto p-0">
              {loadingDetail ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-gray-500">Đang tải chi tiết chấm công...</p>
                  </div>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                  <tr>
                    <th className="p-4 text-gray-500 font-medium">Ngày</th>
                    <th className="p-4 text-gray-500 font-medium text-center">
                      Vào
                    </th>
                    <th className="p-4 text-gray-500 font-medium text-center">
                      Ra
                    </th>
                    <th className="p-4 text-gray-500 font-medium">
                      Trạng thái
                    </th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employeeDetail && employeeDetail.length > 0 ? (
                    employeeDetail.map((log, idx) => {
                      // Format date
                      const dateObj = new Date(log.date);
                      const formattedDate = dateObj.toLocaleDateString('vi-VN');
                      
                      // Determine status display
                      let statusBadge;
                      if (!log.checkOut) {
                        statusBadge = (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
                            Thiếu ra
                          </span>
                        );
                      } else if (log.lateMinutes > 0) {
                        statusBadge = (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">
                            Muộn {log.lateMinutes}p
                          </span>
                        );
                      } else if (log.status === "LEAVE") {
                        statusBadge = (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                            Nghỉ phép
                          </span>
                        );
                      } else if (log.status === "ABSENT") {
                        statusBadge = (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
                            Vắng
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="text-xs text-green-600 font-medium">
                            Bình thường
                          </span>
                        );
                      }
                      
                      return (
                        <tr key={log._id || idx} className="hover:bg-gray-50 group">
                          <td className="p-4 font-medium text-gray-800">
                            {formattedDate}
                          </td>
                          <td className="p-4 text-center font-mono text-gray-600">
                            {log.checkIn || "--:--"}
                          </td>
                          <td
                            className={`p-4 text-center font-mono font-bold ${
                              !log.checkOut ? "text-red-500" : "text-gray-600"
                            }`}
                          >
                            {log.checkOut || "--:--"}
                          </td>
                          <td className="p-4">
                            {statusBadge}
                            {log.deductedBlocks > 0 && (
                              <span className="ml-2 text-xs text-red-500">
                                (-{log.deductedBlocks} block)
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setIsEditModalOpen(true)}
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded transition"
                              title="Sửa công"
                            >
                              <Edit size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">
                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Không có dữ liệu chấm công</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL (POPUP) --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">
                Hiệu chỉnh dữ liệu công
              </h3>
              <button onClick={() => setIsEditModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giờ vào (Mới)
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="08:30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Giờ ra (Mới)
                  </label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg p-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="17:30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do điều chỉnh <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nhập lý do (VD: Quên chấm công, Máy hỏng...)"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đính kèm minh chứng
                </label>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition">
                  <Paperclip size={16} className="mr-2" />{" "}
                  <span className="text-xs">Upload ảnh/file</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Hủy
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Save size={16} /> Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAdmin;
