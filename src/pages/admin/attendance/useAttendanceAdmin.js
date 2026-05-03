import { useEffect, useRef, useState } from "react";

import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import { attendancesAPI } from "../../../apis/attendancesAPI";
import { payrollAPI } from "../../../apis/payrollAPI";
import { departmentApi } from "../../../apis/departmentApi";
import {
  extractDateRangeFromGrid,
  getCurrentPeriod,
  getMonthYear,
  OT_TYPE_LABELS,
  parseAttendanceGrid,
} from "./attendanceUtils";

const buildExportRows = (employees) =>
  employees.map((emp, index) => ({
    STT: index + 1,
    "Mã nhân viên": emp.employeeCode || "",
    "Họ và tên": emp.fullName || "",
    "Phòng ban": emp.department || "",
    "Ngày công": emp.totalWorkDays?.toFixed(2) || "0.00",
    "Tổng giờ OT": emp.totalOTHours?.toFixed(2) || "0.00",
    "OT Ngày thường": Number(emp.otHours?.weekday || 0).toFixed(2),
    "OT Cuối tuần": Number(emp.otHours?.weekend || 0).toFixed(2),
    "OT Ngày lễ": Number(emp.otHours?.holiday || 0).toFixed(2),
    "OT Đêm ngày thường": Number(emp.otHours?.weekday_night || 0).toFixed(2),
    "OT Đêm cuối tuần": Number(emp.otHours?.weekend_night || 0).toFixed(2),
    "OT Đêm ngày lễ": Number(emp.otHours?.holiday_night || 0).toFixed(2),
    "Nghỉ phép": emp.paidLeaveDays || 0,
    "Đi muộn": emp.lateCount || 0,
    "Trạng thái":
      emp.hasError || emp.totalWorkDays === 0 ? "Error" : "Valid",
  }));

export const useAttendanceAdmin = () => {
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentPeriod());
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPeriodLocked, setIsPeriodLocked] = useState(false);
  const [allAttendanceData, setAllAttendanceData] = useState([]);
  const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const [selectedAttendanceLog, setSelectedAttendanceLog] = useState(null);
  const [openOTDetailId, setOpenOTDetailId] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  });

  const fileInputRef = useRef(null);

  const { month, year } = getMonthYear(selectedPeriod);
  const errorCount = filteredAttendanceData.filter(
    (emp) => emp.hasError || emp.totalWorkDays === 0,
  ).length;

  const handlePreviousPeriod = () => {
    const date = new Date(year, month - 2, 1);
    setSelectedPeriod(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const handleNextPeriod = () => {
    const date = new Date(year, month, 1);
    setSelectedPeriod(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  };

  const refreshAttendanceList = async (period = selectedPeriod) => {
    const { month: targetMonth, year: targetYear } = getMonthYear(period);
    const res = await attendancesAPI.getall(targetMonth, targetYear);
    const data = res.data?.data || res.data || [];
    setAllAttendanceData(data);
    return data;
  };

  const refreshEmployeeDetail = async (employee = selectedEmployee, period = selectedPeriod) => {
    if (!employee) return [];
    const { month: targetMonth, year: targetYear } = getMonthYear(period);
    const detailRes = await attendancesAPI.getbyid(
      targetMonth,
      targetYear,
      employee.employeeId,
    );
    const detail = detailRes.data.data || [];
    setEmployeeDetail(detail);
    return detail;
  };

  const handleOpenEditModal = (log) => {
    setSelectedAttendanceLog(log);
    setIsEditModalOpen(true);
  };

  const handleSaveAttendance = async (formData) => {
    try {
      const id = selectedAttendanceLog?._id;
      const payload = {
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        status: "PRESENT",
        note: formData.reason,
      };

      await attendancesAPI.updateAtendances(id, payload);
      toast.success("SỬA DỮ LIỆU CHẤM CÔNG THÀNH CÔNG");

      await refreshAttendanceList();
      if (selectedEmployee) {
        await refreshEmployeeDetail();
      }
    } catch (error) {
      toast.error("SỬA DỮ LIỆU CHẤM CÔNG THẤT BẠI");
      console.error("[ERROR] Error:", error);
    }
  };

  const handleEmployeeClick = async (employee) => {
    try {
      setSelectedEmployee(employee);
      setLoadingDetail(true);
      await refreshEmployeeDetail(employee);
    } catch (error) {
      console.error("[ERROR] Lỗi khi load chi tiết:", error);
      toast.error("Không thể tải chi tiết chấm công");
      setEmployeeDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        await refreshAttendanceList();
      } catch (error) {
        console.error("[ERROR] DỮ LIỆU CHẤM CÔNG có lỗi:", error);
        toast.error("Không thể tải dữ liệu chấm công");
        setAllAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedPeriod]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await departmentApi.getAll();
        const deptData = res.data?.data || res.data || [];
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (error) {
        console.error("Lỗi tải phòng ban:", error);
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    let result = [...allAttendanceData];

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(searchLower) ||
          emp.employeeCode?.toLowerCase().includes(searchLower),
      );
    }

    if (filters.department) {
      result = result.filter((emp) => (emp.department || "") === filters.department);
    }

    if (filters.status === "Error") {
      result = result.filter((emp) => emp.hasError || emp.totalWorkDays === 0);
    } else if (filters.status === "Valid") {
      result = result.filter((emp) => !emp.hasError && emp.totalWorkDays > 0);
    }

    setFilteredAttendanceData(result);
  }, [allAttendanceData, filters]);

  useEffect(() => {
    if (!openOTDetailId) return undefined;

    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-ot-popover]")) {
        setOpenOTDetailId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openOTDetailId]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      toast.info("Đang xử lý file Excel...");

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = wb.SheetNames?.[0];
      const ws = wb.Sheets?.[sheetName];

      if (!ws) {
        throw new Error("Không đọc được sheet trong file Excel.");
      }

      const grid = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: false,
        defval: "",
      });

      const dateInfo = extractDateRangeFromGrid(grid, selectedPeriod);
      const normalized = parseAttendanceGrid(grid, selectedPeriod);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fromDate", dateInfo.fromDate);
      formData.append("toDate", dateInfo.toDate);
      formData.append("month", dateInfo.month);
      formData.append("year", dateInfo.year);

      await attendancesAPI.import(formData);
      toast.success(`Import thành công ${normalized.length} bản ghi chấm công`);

      await refreshAttendanceList();
    } catch (err) {
      console.error("[IMPORT] [ERROR] Import failed:", err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Import thất bại. Vui lòng kiểm tra format file Excel.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleSyncData = async () => {
    try {
      await payrollAPI.syncdata({ month, year });
      toast.success("ĐỒNG BỘ THÀNH CÔNG");
    } catch (error) {
      toast.error("ĐỒNG BỘ THẤT BẠI");
      console.error("[ERROR] LỖI API:", error);
    }
  };

  const handleSyncHoliday = async () => {
    try {
      await payrollAPI.syncdata({ month, year });
      toast.success("ĐỒNG BỘ THÀNH CÔNG");
    } catch (error) {
      toast.error("ĐỒNG BỘ THẤT BẠI");
      console.error("[ERROR] LỖI API:", error);
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = buildExportRows(filteredAttendanceData);
      const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A4" });
      const currentDate = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      XLSX.utils.sheet_add_aoa(
        ws,
        [["LNG Group"], [`Bảng chấm công tháng ${month}/${year}`], [currentDate]],
        { origin: "A1" },
      );

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },
      ];

      const headerStyle = {
        font: { bold: true, sz: 16, color: { rgb: "1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      ["A1", "A2", "A3"].forEach((cell) => {
        if (ws[cell]) ws[cell].s = headerStyle;
      });

      const columnHeaderStyle = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      [
        "A4",
        "B4",
        "C4",
        "D4",
        "E4",
        "F4",
        "G4",
        "H4",
        "I4",
        "J4",
        "K4",
        "L4",
        "M4",
        "N4",
        "O4",
      ].forEach((cell) => {
        if (ws[cell]) ws[cell].s = columnHeaderStyle;
      });

      const dataCellStyle = {
        alignment: { vertical: "center", wrapText: false },
        border: {
          top: { style: "thin", color: { rgb: "D3D3D3" } },
          bottom: { style: "thin", color: { rgb: "D3D3D3" } },
          left: { style: "thin", color: { rgb: "D3D3D3" } },
          right: { style: "thin", color: { rgb: "D3D3D3" } },
        },
      };

      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = 4; R <= range.e.r; R += 1) {
        for (let C = 0; C <= 14; C += 1) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[cellAddress]) ws[cellAddress].s = dataCellStyle;
        }
      }

      ws["!cols"] = [
        { wch: 5 },
        { wch: 15 },
        { wch: 25 },
        { wch: 20 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
      ];

      ws["!rows"] = [{ hpt: 25 }, { hpt: 25 }, { hpt: 25 }, { hpt: 30 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Chấm công ${month}-${year}`);

      const fileName = `Bang_cham_cong_${month}_${year}_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`Đã xuất ${exportData.length} bản ghi chấm công ra file Excel`);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toast.error("Không thể xuất file Excel");
    }
  };

  return {
    OT_TYPE_LABELS,
    departments,
    employeeDetail,
    errorCount,
    fileInputRef,
    filteredAttendanceData,
    filters,
    handleEmployeeClick,
    handleExportExcel,
    handleFileChange,
    handleFilterChange,
    handleImportClick,
    handleNextPeriod,
    handleOpenEditModal,
    handlePreviousPeriod,
    handleSaveAttendance,
    handleSyncData,
    handleSyncHoliday,
    isEditModalOpen,
    isPeriodLocked,
    loading,
    loadingDetail,
    month,
    openOTDetailId,
    selectedAttendanceLog,
    selectedEmployee,
    setIsEditModalOpen,
    setIsPeriodLocked,
    setOpenOTDetailId,
    setSelectedEmployee,
    selectedPeriod,
    year,
  };
};
