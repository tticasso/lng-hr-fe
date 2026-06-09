import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { employeeApi } from "../../../apis/employeeApi";
import { payrollAPI } from "../../../apis/payrollAPI";
import { useAuth } from "../../../context/AuthContext";
import { hasPermission } from "../../../utils/authPermissions";
import { formatEmployeeCode } from "../../../utils/employeeDisplay";
import { ACCESS } from "../../../config/accessControl";
import {
  ALLOWANCE_TYPE_LABELS,
  formatMoney,
  getAdjustmentBreakdownItems,
  getAllowanceBreakdownItems,
  getCurrentPayrollPeriod,
  getLeaveBreakdownItems,
  getPayrollStatusLabel,
  getSalaryPeriodBreakdownItems,
  OT_TYPE_LABELS,
} from "./payrollOverviewUtils";

const getEmployeeId = (employee) => employee?._id || employee?.id || employee;

export const usePayrollOverview = () => {
  const { user } = useAuth();
  const canRunPayroll = hasPermission(user, ACCESS.PAYROLL_ENGINE[0]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentPayrollPeriod());
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendingBulkEmails, setSendingBulkEmails] = useState(false);
  const [finalizingAndSending, setFinalizingAndSending] = useState(false);
  const [deletingPayrollPeriod, setDeletingPayrollPeriod] = useState(false);
  const [adjustmentModalPayroll, setAdjustmentModalPayroll] = useState(null);
  const [detailModalPayroll, setDetailModalPayroll] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  });

  const fetchPayrollData = useMemo(() => async () => {
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
  }, [selectedMonth]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

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

  const selectedPayrollItems = useMemo(
    () => payrollData.filter((item) => selectedRows.includes(item._id)),
    [payrollData, selectedRows],
  );

  const summary = useMemo(
    () => ({
      totalPayrolls: filteredData.length,
      totalGross: filteredData.reduce((sum, item) => sum + (item.grossIncome || 0), 0),
      totalNet: filteredData.reduce((sum, item) => sum + (item.netIncome || 0), 0),
      totalDeduction: filteredData.reduce(
        (sum, item) => sum + (item.totalDeduction || item.insurance?.total || 0),
        0,
      ),
      emailReadyCount: payrollData.filter((item) =>
        ["FINALIZED", "PAID"].includes(item.status),
      ).length,
      draftCount: payrollData.filter((item) => item.status === "DRAFT").length,
      finalizedCount: payrollData.filter((item) => item.status === "FINALIZED").length,
      paidCount: payrollData.filter((item) => item.status === "PAID").length,
    }),
    [filteredData, payrollData],
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
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để thanh toán bảng lương.");
      return;
    }

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
      console.error("[ERROR] Error marking payroll as paid:", error);
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

const handleReopenPayroll = async (payroll) => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để mở lại phiếu lương.");
      return;
    }

    if (!payroll?._id) return;

    const employeeName = payroll.employeeId?.fullName || payroll.employeeId?.employeeCode || "nhân viên này";
    if (
      !window.confirm(
        `Mở lại phiếu lương của ${employeeName} về DRAFT? Trạng thái email sẽ được reset để có thể gửi lại sau khi chốt lại.`,
      )
    ) {
      return;
    }

    try {
      await payrollAPI.reopen(payroll._id);
      toast.success("Đã mở lại phiếu lương về DRAFT");
      await fetchPayrollData();
      setSelectedRows((prev) => prev.filter((id) => id !== payroll._id));
    } catch (error) {
      toast.error(error.normalizedMessage || "Mở lại phiếu lương thất bại");
    }
  };

  const handleOpenAdjustments = (payroll) => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để điều chỉnh bảng lương.");
      return;
    }
    setAdjustmentModalPayroll(payroll);
  };

  const handleOpenBulkAdjustments = () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để điều chỉnh bảng lương.");
      return;
    }

    if (selectedRows.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một bản lương để điều chỉnh hàng loạt.");
      return;
    }

    setAdjustmentModalPayroll({ __bulk: true });
  };

  const handleCloseAdjustments = () => {
    setAdjustmentModalPayroll(null);
  };

  const handleOpenDetails = async (payroll) => {
    setDetailModalPayroll(payroll);

    const employee = payroll?.employeeId;
    const employeeId = getEmployeeId(employee);
    const hasEmployeeDates =
      employee && typeof employee === "object" &&
      (employee.startDate || employee.probationEndDate || employee.endDate);

    if (!employeeId || hasEmployeeDates) return;

    try {
      const res = await employeeApi.getById(employeeId);
      const responseBody = res.data || {};
      const employeeDetail = responseBody.data || responseBody;

      if (!employeeDetail?._id && !employeeDetail?.id) return;

      const enrichedPayroll = {
        ...payroll,
        employeeId: {
          ...(typeof employee === "object" ? employee : {}),
          ...employeeDetail,
        },
      };

      setDetailModalPayroll(enrichedPayroll);
      setPayrollData((prev) =>
        prev.map((item) => (item._id === payroll._id ? enrichedPayroll : item)),
      );
    } catch (error) {
      console.error("[ERROR] Error fetching employee detail for payroll modal:", error);
    }
  };

  const handleCloseDetails = () => {
    setDetailModalPayroll(null);
  };

  const handleSendPayrollEmailsBulk = async () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để gửi email phiếu lương hàng loạt.");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const emailReadyCount = payrollData.filter((item) =>
      ["FINALIZED", "PAID"].includes(item.status),
    ).length;

    if (emailReadyCount === 0) {
      toast.warning("Kỳ lương này chưa có bản lương đã chốt hoặc đã thanh toán.");
      return;
    }

    if (
      !window.confirm(
        `Gửi email phiếu lương tháng ${month}/${year} cho ${emailReadyCount} nhân viên?`,
      )
    ) {
      return;
    }

    try {
      setSendingBulkEmails(true);
      const res = await payrollAPI.sendEmailsBulk({
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      });
      const result = res.data?.data || {};
      const alreadySentCount = Number(result.skippedAlreadySent || 0);
      const skippedCount =
        Number(result.skippedNoEmployee || 0) +
        Number(result.skippedNoEmail || 0) +
        Number(result.skippedInvalidEmail || 0) +
        alreadySentCount;

      if (res.data?.status === "partial_success") {
        toast.warning(
          `Đã gửi mới ${result.sent || 0}/${result.total || 0} email. Đã gửi trước đó: ${alreadySentCount}. Lỗi: ${result.failed || 0}, bỏ qua: ${skippedCount}.`,
        );
      } else {
        toast.success(
          `Đã gửi mới ${result.sent || 0}/${result.total || 0} email. Đã gửi trước đó: ${alreadySentCount}.`,
        );
      }
    } catch (error) {
      toast.error(error.normalizedMessage || "Gửi email phiếu lương hàng loạt thất bại");
    } finally {
      setSendingBulkEmails(false);
    }
  };

  const handleFinalizeAndSendPayrollEmails = async () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để chốt và gửi email phiếu lương.");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const draftCount = payrollData.filter((item) => item.status === "DRAFT").length;

    if (draftCount === 0) {
      toast.warning("Kỳ lương này không còn phiếu DRAFT để chốt. Bạn có thể dùng nút Gửi phiếu đã chốt.");
      return;
    }

    if (
      !window.confirm(
        `Chốt ${draftCount} phiếu lương tháng ${month}/${year} và gửi email cho nhân viên?`,
      )
    ) {
      return;
    }

    try {
      setFinalizingAndSending(true);
      const payload = {
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      };

      await payrollAPI.finalize(payload);
      toast.success("Đã chốt kỳ lương thành công");

      const res = await payrollAPI.sendEmailsBulk(payload);
      const result = res.data?.data || {};
      const alreadySentCount = Number(result.skippedAlreadySent || 0);
      const skippedCount =
        Number(result.skippedNoEmployee || 0) +
        Number(result.skippedNoEmail || 0) +
        Number(result.skippedInvalidEmail || 0) +
        alreadySentCount;

      if (res.data?.status === "partial_success") {
        toast.warning(
          `Đã gửi mới ${result.sent || 0}/${result.total || 0} email. Đã gửi trước đó: ${alreadySentCount}. Lỗi: ${result.failed || 0}, bỏ qua: ${skippedCount}.`,
        );
      } else {
        toast.success(
          `Đã gửi mới ${result.sent || 0}/${result.total || 0} email. Đã gửi trước đó: ${alreadySentCount}.`,
        );
      }

      await fetchPayrollData();
      setSelectedRows([]);
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Chốt lương và gửi email thất bại");
    } finally {
      setFinalizingAndSending(false);
    }
  };

  const handleDeletePayrollPeriod = async () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để xoá dữ liệu bảng lương.");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const periodLabel = `${month}/${year}`;
    const draftCount = payrollData.filter((item) => item.status === "DRAFT").length;
    const finalizedCount = payrollData.filter((item) => item.status === "FINALIZED").length;
    const paidCount = payrollData.filter((item) => item.status === "PAID").length;
    const totalCount = draftCount + finalizedCount + paidCount;

    if (totalCount === 0) {
      toast.warning("Kỳ lương này không có dữ liệu để xoá.");
      return;
    }

    const payload = {
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };

    if (draftCount > 0) {
      payload.status = "DRAFT";

      if (
        !window.confirm(
          `Xoá ${draftCount} phiếu lương DRAFT tháng ${periodLabel}? Các phiếu đã chốt/đã thanh toán sẽ không bị xoá.`,
        )
      ) {
        return;
      }
    } else {
      const confirmText = window.prompt(
        `Kỳ ${periodLabel} không còn DRAFT. Thao tác này sẽ xoá ${finalizedCount} phiếu đã chốt và ${paidCount} phiếu đã thanh toán. Nhập XOA để xác nhận.`,
      );

      if (confirmText !== "XOA") {
        toast.info("Đã huỷ xoá dữ liệu bảng lương.");
        return;
      }

      payload.force = true;
    }

    try {
      setDeletingPayrollPeriod(true);
      const res = await payrollAPI.deletePeriod(payload);
      const result = res.data?.data || {};

      toast.success(`Đã xoá ${result.deleted || 0} phiếu lương tháng ${periodLabel}.`);
      await fetchPayrollData();
      setSelectedRows([]);
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Xoá dữ liệu bảng lương thất bại");
    } finally {
      setDeletingPayrollPeriod(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const otKeys = Object.keys(OT_TYPE_LABELS);
      const allowanceKeys = Object.keys(ALLOWANCE_TYPE_LABELS);

      const exportData = filteredData.map((item, index) => {
        const leaveDetails = getLeaveBreakdownItems(item);
        const totalLeaveDays = leaveDetails.reduce(
          (sum, detail) => sum + Number(detail.days || 0),
          0,
        );
        const totalLeaveAmount = leaveDetails.reduce(
          (sum, detail) => sum + Number(detail.value || 0),
          0,
        );
        const salaryPeriodDetails = getSalaryPeriodBreakdownItems(item);
        const probationSalary = salaryPeriodDetails.find((detail) => detail.key === "probation");
        const officialSalary = salaryPeriodDetails.find((detail) => detail.key === "official");

        return {
          "Số thứ tự": index + 1,
          "Mã nhân viên": formatEmployeeCode(item.employeeId?.employeeCode, ""),
          "Họ và tên": item.employeeId?.fullName || "",
          "Phòng ban": item.departmentId?.name || "",
          "Lương cơ bản": item.baseSalary || 0,
          "Lương theo ngày": item.dailyRate || 0,
          "Lương theo giờ": Number(item.dailyRate || 0) / 8,
          "Công chuẩn": item.standardWorkDays || 0,
          "Công tính lương": item.actualWorkDays || 0,
          "Công thử việc": probationSalary?.workDays || 0,
          "Đơn giá thử việc": probationSalary?.dailyRate || 0,
          "Tiền công thử việc": probationSalary?.value || 0,
          "Công chính thức": officialSalary?.workDays || 0,
          "Đơn giá chính thức": officialSalary?.dailyRate || 0,
          "Tiền công chính thức": officialSalary?.value || 0,
          "Chi tiết lương theo giai đoạn": salaryPeriodDetails
            .map((detail) => `${detail.label}: ${detail.formulaText} = ${formatMoney(detail.value)}`)
            .join(" | "),
          "Nghỉ phép hưởng lương": item.paidLeaveDays || 0,
          "Tổng ngày nghỉ": Number(totalLeaveDays.toFixed(2)),
          "Tổng tiền nghỉ": Math.round(totalLeaveAmount),
          "Tổng giờ OT": Object.values(item.otHours || {}).reduce(
            (sum, value) => sum + Number(value || 0),
            0,
          ),
          ...Object.fromEntries(
            otKeys.map((key) => {
              const label = OT_TYPE_LABELS[key];
              return [`${label} - Giờ`, Number(item.otHours?.[key] || 0)];
            }),
          ),
          "Tiền OT": item.otPay || 0,
          ...Object.fromEntries(
            allowanceKeys.map((key) => [
              ALLOWANCE_TYPE_LABELS[key],
              Number(item.allowanceBreakdown?.[key] || 0),
            ]),
          ),
          "Tổng phụ cấp": item.totalAllowance || 0,
          "Chi tiết phụ cấp": getAllowanceBreakdownItems(item)
            .map((detail) => `${detail.label}: ${formatMoney(detail.value)}`)
            .join(" | "),
          "Tổng điều chỉnh cộng": item.totalAdjustmentEarnings || 0,
          "Tổng điều chỉnh trừ": item.totalAdjustmentDeductions || 0,
          "Chi tiết điều chỉnh": getAdjustmentBreakdownItems(item)
            .map((detail) => `${detail.label}: ${formatMoney(detail.value)}`)
            .join(" | "),
          "BHXH": item.insurance?.bhxh || 0,
          "BHYT": item.insurance?.bhyt || 0,
          "BHTN": item.insurance?.bhtn || 0,
          "Tổng khấu trừ": item.totalDeduction || item.insurance?.total || 0,
          "Tổng thu nhập": item.grossIncome || 0,
          "Thực nhận": item.netIncome || 0,
          "Trạng thái": getPayrollStatusLabel(item.status),
        };
      });

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
    canRunPayroll,
    fetchPayrollData,
    filteredData,
    filters,
    formatMoney,
    handleExportExcel,
    handleFilterChange,
    handlePayment,
    handleSelectAll,
    handleSelectRow,
    handleSendPayrollEmailsBulk,
    handleFinalizeAndSendPayrollEmails,
    handleDeletePayrollPeriod,
    handleSendPayrollEmail,
    handleReopenPayroll,
    handleOpenAdjustments,
    handleOpenBulkAdjustments,
    handleCloseAdjustments,
    handleOpenDetails,
    handleCloseDetails,
    isAllSelected,
    isSomeSelected,
    loading,
    sendingBulkEmails,
    finalizingAndSending,
    deletingPayrollPeriod,
    adjustmentModalPayroll,
    detailModalPayroll,
    selectedPayrollItems,
    selectedMonth,
    selectedRows,
    setSelectedMonth,
    summary,
  };
};
