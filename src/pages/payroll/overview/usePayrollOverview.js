import { useEffect, useMemo, useState } from "react";

import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import { payrollAPI } from "../../../apis/payrollAPI";
import {
  ALLOWANCE_TYPE_LABELS,
  formatMoney,
  getAllowanceBreakdownItems,
  getCurrentPayrollPeriod,
  getOtBreakdownItems,
  getPayrollStatusLabel,
  OT_TYPE_LABELS,
} from "./payrollOverviewUtils";

export const usePayrollOverview = () => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentPayrollPeriod());
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  });

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-");
      const res = await payrollAPI.getall(month, year);
      const apiData = res.data?.data?.data || res.data?.data || [];
      setPayrollData(apiData);
      toast.success("Tải dữ liệu lương thành công");
    } catch (error) {
      console.error("[ERROR] Error fetching payroll data:", error);
      toast.error("Không thể tải dữ liệu lương. Vui lòng thử lại.");
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  const filteredData = useMemo(() => {
    let result = [...payrollData];

    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.employeeId?.fullName?.toLowerCase().includes(searchLower) ||
          item.employeeId?.employeeCode?.toLowerCase().includes(searchLower) ||
          item.departmentId?.name?.toLowerCase().includes(searchLower),
      );
    }

    if (filters.department) {
      result = result.filter((item) => item.departmentId?.name === filters.department);
    }

    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    return result;
  }, [payrollData, filters]);

  const departments = useMemo(() => {
    const deptSet = new Set();
    payrollData.forEach((item) => {
      if (item.departmentId?.name) deptSet.add(item.departmentId.name);
    });
    return Array.from(deptSet);
  }, [payrollData]);

  const summary = useMemo(
    () => ({
      totalEmployees: filteredData.length,
      totalGross: filteredData.reduce((sum, item) => sum + (item.grossIncome || 0), 0),
      totalNet: filteredData.reduce((sum, item) => sum + (item.netIncome || 0), 0),
      totalDeduction: filteredData.reduce(
        (sum, item) => sum + (item.insurance?.total || 0),
        0,
      ),
    }),
    [filteredData],
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectRow = (rowId) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    );
  };

  const isAllSelected =
    filteredData.length > 0 && selectedRows.length === filteredData.length;
  const isSomeSelected =
    selectedRows.length > 0 && selectedRows.length < filteredData.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
      return;
    }
    setSelectedRows(filteredData.map((row) => row._id));
  };

  const handlePayment = async () => {
    if (selectedRows.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bản lương để thanh toán.");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const payload = isAllSelected
      ? { month: parseInt(month, 10), year: parseInt(year, 10) }
      : {
          month: parseInt(month, 10),
          year: parseInt(year, 10),
          payrollIds: selectedRows,
        };

    try {
      await payrollAPI.markpaid(payload);
      toast.success("Thanh toán thành công");
      await fetchPayrollData();
      setSelectedRows([]);
    } catch (error) {
      toast.error("Thanh toán thất bại");
    }
  };

  const handleSendPayrollEmail = async (payrollId) => {
    if (!window.confirm("Gửi email phiếu lương cho nhân viên này?")) return;

    try {
      await payrollAPI.sendEmail(payrollId);
      toast.success("Đã gửi email phiếu lương");
    } catch (error) {
      toast.error(error.normalizedMessage || "Gửi email phiếu lương thất bại");
    }
  };

  const handleExportExcel = () => {
    try {
      const otKeys = Object.keys(OT_TYPE_LABELS);
      const allowanceKeys = Object.keys(ALLOWANCE_TYPE_LABELS);

      const exportData = filteredData.map((item, index) => ({
        "Số thứ tự": index + 1,
        "Mã nhân viên": item.employeeId?.employeeCode || "",
        "Họ và tên": item.employeeId?.fullName || "",
        "Phòng ban": item.departmentId?.name || "",
        "Lương cơ bản": item.baseSalary || 0,
        "Công chuẩn": item.standardWorkDays || 0,
        "Công thực tế": item.actualWorkDays || 0,
        "Nghỉ phép hưởng lương": item.paidLeaveDays || 0,
        "Tổng giờ OT": Object.values(item.otHours || {}).reduce(
          (sum, value) => sum + Number(value || 0),
          0,
        ),
        ...Object.fromEntries(
          otKeys.map((key) => [
            `${OT_TYPE_LABELS[key]} (giờ)`,
            Number(item.otHours?.[key] || 0),
          ]),
        ),
        "Tiền OT": item.otPay || 0,
        ...Object.fromEntries(
          allowanceKeys.map((key) => [
            ALLOWANCE_TYPE_LABELS[key],
            Number(item.allowanceBreakdown?.[key] || 0),
          ]),
        ),
        "Tổng phụ cấp": item.totalAllowance || 0,
        "Chi tiết OT": getOtBreakdownItems(item)
          .map((detail) => `${detail.label}: ${detail.value.toFixed(2)}h`)
          .join(" | "),
        "Chi tiết phụ cấp": getAllowanceBreakdownItems(item)
          .map((detail) => `${detail.label}: ${formatMoney(detail.value)}`)
          .join(" | "),
        "BHXH": item.insurance?.bhxh || 0,
        "BHYT": item.insurance?.bhyt || 0,
        "BHTN": item.insurance?.bhtn || 0,
        "Khấu trừ bảo hiểm": item.insurance?.total || item.totalDeduction || 0,
        "Tổng thu nhập": item.grossIncome || 0,
        "Thực nhận": item.netIncome || 0,
        "Trạng thái": getPayrollStatusLabel(item.status),
      }));

      const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A4" });
      const [year, month] = selectedMonth.split("-");
      const lastColumnIndex = Math.max(Object.keys(exportData[0] || {}).length - 1, 0);

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          ["Tập đoàn LNG"],
          [`Bảng lương tháng ${month}/${year}`],
          [new Date().toLocaleDateString("vi-VN")],
        ],
        { origin: "A1" },
      );

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: lastColumnIndex } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: lastColumnIndex } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: lastColumnIndex } },
      ];

      ws["!cols"] = Object.keys(exportData[0] || {}).map((key) => ({
        wch: key.includes("Chi tiết") ? 40 : key.includes("Họ và tên") ? 24 : 16,
      }));

      const headerStyle = {
        font: { bold: true, sz: 16, color: { rgb: "1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      ["A1", "A2", "A3"].forEach((cell) => {
        if (ws[cell]) ws[cell].s = headerStyle;
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bảng lương");
      XLSX.writeFile(wb, `Bang_luong_${month}_${year}.xlsx`);

      toast.success(`Đã xuất ${exportData.length} bản lương ra Excel`);
    } catch (error) {
      console.error("Lỗi xuất file:", error);
      toast.error("Không thể xuất file Excel");
    }
  };

  return {
    departments,
    fetchPayrollData,
    filteredData,
    filters,
    formatMoney,
    handleExportExcel,
    handleFilterChange,
    handlePayment,
    handleSelectAll,
    handleSelectRow,
    handleSendPayrollEmail,
    isAllSelected,
    isSomeSelected,
    loading,
    selectedMonth,
    selectedRows,
    setSelectedMonth,
    summary,
  };
};
