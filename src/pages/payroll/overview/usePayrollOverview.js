import { useEffect, useMemo, useState } from "react";

import { toast } from "react-toastify";

import { employeeApi } from "../../../apis/employeeApi";
import { payrollAPI } from "../../../apis/payrollAPI";
import { useAuth } from "../../../context/AuthContext";
import { hasPermission } from "../../../utils/authPermissions";
import { formatEmployeeCode } from "../../../utils/employeeDisplay";
import { matchesSearchText } from "../../../utils/searchText";
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
import {
  buildPayrollQueryParams,
  buildSelectedPayrollPayload,
  getSelectedPayrollsByStatus,
} from "./payrollOverviewQuery";

const getEmployeeId = (employee) => employee?._id || employee?.id || employee;

const payrollEmailJobToResponse = (job) => {
  if (job?.status === "FAILED") {
    const error = new Error(job.errorMessage || "Gửi email phiếu lương hàng loạt thất bại");
    error.normalizedMessage = error.message;
    throw error;
  }

  return {
    data: {
      status: job?.status === "COMPLETED" ? "success" : "partial_success",
      data: job?.summary || {},
    },
  };
};

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
  const [payrollActionConfirm, setPayrollActionConfirm] = useState(null);
  const [confirmingPayrollAction, setConfirmingPayrollAction] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    employeeId: "",
    department: "",
    status: "",
    employeeStatus: "",
  });

  const fetchPayrollData = useMemo(() => async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split("-");
      const res = await payrollAPI.getall(month, year, buildPayrollQueryParams(filters));
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
  }, [selectedMonth, filters.employeeId]);

  useEffect(() => {
    fetchPayrollData();
  }, [fetchPayrollData]);

  useEffect(() => {
    if (filters.employeeId) return;

    setEmployeeOptions(
      payrollData
        .map((item) => item.employeeId)
        .filter((employee) => employee?._id || employee?.id),
    );
  }, [filters.employeeId, payrollData]);

  const filteredData = useMemo(() => {
    let result = [...payrollData];

    if (filters.search.trim()) {
      result = result.filter(
        (item) =>
          matchesSearchText(
            [item.employeeId?.fullName, item.employeeId?.employeeCode, item.departmentId?.name],
            filters.search,
          ),
      );
    }

    if (filters.department) {
      result = result.filter((item) => item.departmentId?.name === filters.department);
    }

    if (filters.status) {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters.employeeStatus) {
      result = result.filter(
        (item) => (item.employeeId?.status || item.employeeStatus) === filters.employeeStatus,
      );
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

  const employees = employeeOptions;

  const getPeriodParts = () => {
    const [year, month] = selectedMonth.split("-");
    return {
      year,
      month,
      monthNumber: parseInt(month, 10),
      yearNumber: parseInt(year, 10),
      label: `${month}/${year}`,
    };
  };

  const handleClosePayrollActionConfirm = () => {
    if (!confirmingPayrollAction) setPayrollActionConfirm(null);
  };

  const handleConfirmPayrollAction = async () => {
    if (!payrollActionConfirm?.onConfirm) return;

    try {
      setConfirmingPayrollAction(true);
      await payrollActionConfirm.onConfirm();
      setPayrollActionConfirm(null);
    } catch (error) {
      console.error("[ERROR] Error running payroll action:", error);
    } finally {
      setConfirmingPayrollAction(false);
    }
  };

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
    if (name === "employeeId") setSelectedRows([]);
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

    const finalizedPayrolls = getSelectedPayrollsByStatus(payrollData, selectedRows, ["FINALIZED"]);
    const finalizedIds = finalizedPayrolls.map((item) => item._id);

    if (finalizedIds.length === 0) {
      toast.warning("Chỉ có thể thanh toán phiếu lương đã chốt.");
      return;
    }

    const payload = buildSelectedPayrollPayload(selectedMonth, finalizedIds);
    const ignoredCount = selectedRows.length - finalizedIds.length;

    setPayrollActionConfirm({
      title: "Xác nhận thanh toán lương",
      description: `Thanh toán ${finalizedIds.length} phiếu lương đã chốt.`,
      confirmLabel: "Thanh toán",
      items: finalizedPayrolls,
      summary: [
        { label: "Được thanh toán", value: finalizedIds.length },
        { label: "Bỏ qua", value: ignoredCount },
      ],
      warning: ignoredCount > 0 ? "Các phiếu chưa chốt sẽ không được thanh toán." : "",
      onConfirm: async () => {
        try {
          await payrollAPI.markpaid(payload);
          toast.success("Thanh toán thành công");
          await fetchPayrollData();
          setSelectedRows([]);
        } catch (error) {
          toast.error("Thanh toán thất bại");
          throw error;
        }
      },
    });
  };

  const handleFinalizeSelectedPayrolls = async () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để chốt bảng lương.");
      return;
    }

    const draftPayrolls = getSelectedPayrollsByStatus(payrollData, selectedRows, ["DRAFT"]);
    const draftIds = draftPayrolls.map((item) => item._id);
    if (draftIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một phiếu DRAFT để chốt.");
      return;
    }

    const { label: periodLabel } = getPeriodParts();
    const ignoredCount = selectedRows.length - draftIds.length;

    setPayrollActionConfirm({
      title: "Xác nhận chốt lương",
      description: `Chốt ${draftIds.length} phiếu lương kỳ ${periodLabel}.`,
      confirmLabel: "Chốt lương",
      items: draftPayrolls,
      summary: [
        { label: "Sẽ chốt", value: draftIds.length },
        { label: "Bỏ qua", value: ignoredCount },
      ],
      warning: ignoredCount > 0 ? "Các phiếu không ở trạng thái DRAFT sẽ không được chốt lại." : "",
      onConfirm: async () => {
        try {
          setFinalizingAndSending(true);
          await payrollAPI.finalize(buildSelectedPayrollPayload(selectedMonth, draftIds));
          toast.success(`Đã chốt ${draftIds.length} phiếu lương`);
          await fetchPayrollData();
          setSelectedRows([]);
        } catch (error) {
          toast.error(error.normalizedMessage || error.response?.data?.message || "Chốt lương thất bại");
          throw error;
        } finally {
          setFinalizingAndSending(false);
        }
      },
    });
  };

  const handleSendPayrollEmail = async (payrollId) => {
    const payroll = payrollData.find((item) => item._id === payrollId);

    setPayrollActionConfirm({
      title: "Xác nhận gửi phiếu lương",
      description: "Gửi email phiếu lương cho nhân viên này.",
      confirmLabel: "Gửi email",
      items: payroll ? [payroll] : [],
      summary: [{ label: "Số phiếu", value: 1 }],
      onConfirm: async () => {
        try {
          await payrollAPI.sendEmail(payrollId);
          toast.success("Đã gửi email phiếu lương");
        } catch (error) {
          toast.error(error.normalizedMessage || "Gửi email phiếu lương thất bại");
          throw error;
        }
      },
    });
  };

const handleReopenPayroll = async (payroll) => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để mở lại phiếu lương.");
      return;
    }

    if (!payroll?._id) return;

    const employeeName = payroll.employeeId?.fullName || payroll.employeeId?.employeeCode || "nhân viên này";
    setPayrollActionConfirm({
      title: "Xác nhận mở lại phiếu lương",
      description: `Mở lại phiếu lương của ${employeeName} về DRAFT.`,
      confirmLabel: "Mở lại",
      tone: "warning",
      items: [payroll],
      summary: [{ label: "Số phiếu", value: 1 }],
      warning: "Trạng thái email sẽ được reset để có thể gửi lại sau khi chốt lại.",
      onConfirm: async () => {
        try {
          await payrollAPI.reopen(payroll._id);
          toast.success("Đã mở lại phiếu lương về DRAFT");
          await fetchPayrollData();
          setSelectedRows((prev) => prev.filter((id) => id !== payroll._id));
        } catch (error) {
          toast.error(error.normalizedMessage || "Mở lại phiếu lương thất bại");
          throw error;
        }
      },
    });
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

  const waitForPayrollEmailJobResult = async (res) => {
    const jobId = res.data?.data?.jobId;
    if (!jobId) return res;

    toast.info("Đã bắt đầu gửi email phiếu lương. Hệ thống sẽ tự cập nhật khi hoàn tất.");
    const job = await payrollAPI.pollPayrollEmailJob(jobId);
    return payrollEmailJobToResponse(job);
  };

  const handleSendPayrollEmailsBulk = async () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để gửi email phiếu lương hàng loạt.");
      return;
    }

    const { monthNumber, yearNumber, label: periodLabel } = getPeriodParts();
    const emailReadyPayrolls = selectedRows.length > 0
      ? getSelectedPayrollsByStatus(payrollData, selectedRows, ["FINALIZED", "PAID"])
      : payrollData.filter((item) => ["FINALIZED", "PAID"].includes(item.status));
    const selectedEmailReadyIds = emailReadyPayrolls.map((item) => item._id);
    const emailReadyCount = emailReadyPayrolls.length;

    if (emailReadyCount === 0) {
      toast.warning("Kỳ lương này chưa có bản lương đã chốt hoặc đã thanh toán.");
      return;
    }

    const ignoredCount = selectedRows.length > 0 ? selectedRows.length - emailReadyCount : 0;

    setPayrollActionConfirm({
      title: "Xác nhận gửi email phiếu lương",
      description: `Gửi email phiếu lương kỳ ${periodLabel} cho ${emailReadyCount} nhân viên.`,
      confirmLabel: "Gửi email",
      items: emailReadyPayrolls,
      summary: [
        { label: "Sẽ gửi", value: emailReadyCount },
        { label: "Bỏ qua", value: ignoredCount },
      ],
      warning: ignoredCount > 0 ? "Các phiếu chưa chốt sẽ không được gửi email." : "",
      onConfirm: async () => {
        try {
          setSendingBulkEmails(true);
          if (selectedRows.length > 0) {
            await Promise.all(selectedEmailReadyIds.map((payrollId) => payrollAPI.sendEmail(payrollId)));
            toast.success(`Đã gửi email cho ${selectedEmailReadyIds.length} phiếu lương đã chọn.`);
            await fetchPayrollData();
            return;
          }

          const res = await waitForPayrollEmailJobResult(await payrollAPI.sendEmailsBulk({
            month: monthNumber,
            year: yearNumber,
          }));
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
        } catch (error) {
          toast.error(error.normalizedMessage || "Gửi email phiếu lương hàng loạt thất bại");
          throw error;
        } finally {
          setSendingBulkEmails(false);
        }
      },
    });
  };

  const handleFinalizeAndSendPayrollEmails = async () => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để chốt và gửi email phiếu lương.");
      return;
    }

    const { monthNumber, yearNumber, label: periodLabel } = getPeriodParts();
    const draftPayrolls = selectedRows.length > 0
      ? getSelectedPayrollsByStatus(payrollData, selectedRows, ["DRAFT"])
      : payrollData.filter((item) => item.status === "DRAFT");
    const selectedSendablePayrolls = getSelectedPayrollsByStatus(
      payrollData,
      selectedRows,
      ["FINALIZED", "PAID"],
    );
    const selectedDraftIds = draftPayrolls.map((item) => item._id);
    const selectedSendableIds = selectedSendablePayrolls.map((item) => item._id);
    const draftCount = draftPayrolls.length;

    if (draftCount === 0) {
      toast.warning("Kỳ lương này không còn phiếu DRAFT để chốt. Bạn có thể dùng nút Gửi phiếu đã chốt.");
      return;
    }

    const periodSendablePayrolls = payrollData.filter((item) => ["FINALIZED", "PAID"].includes(item.status));
    const idsToSend = [...new Set([...selectedDraftIds, ...selectedSendableIds])];
    const previewPayrolls = selectedRows.length > 0
      ? [...draftPayrolls, ...selectedSendablePayrolls]
      : [...draftPayrolls, ...periodSendablePayrolls];
    const sendCount = selectedRows.length > 0 ? idsToSend.length : previewPayrolls.length;

    setPayrollActionConfirm({
      title: "Xác nhận chốt và gửi phiếu lương",
      description: `Chốt ${draftCount} phiếu lương kỳ ${periodLabel} và gửi email cho ${sendCount} nhân viên.`,
      confirmLabel: "Chốt & gửi",
      items: previewPayrolls,
      summary: [
        { label: "Sẽ chốt", value: draftCount },
        { label: "Sẽ gửi", value: sendCount },
      ],
      warning: selectedRows.length > 0 && selectedRows.length > previewPayrolls.length
        ? "Các phiếu đã chọn nhưng không ở trạng thái DRAFT/FINALIZED/PAID sẽ được bỏ qua."
        : "",
      onConfirm: async () => {
        try {
          setFinalizingAndSending(true);
          const payload = selectedRows.length > 0
            ? buildSelectedPayrollPayload(selectedMonth, selectedDraftIds)
            : {
                month: monthNumber,
                year: yearNumber,
              };

          await payrollAPI.finalize(payload);
          toast.success("Đã chốt kỳ lương thành công");

          if (selectedRows.length > 0) {
            await Promise.all(idsToSend.map((payrollId) => payrollAPI.sendEmail(payrollId)));
            toast.success(`Đã gửi email cho ${idsToSend.length} phiếu lương đã chọn.`);
            await fetchPayrollData();
            setSelectedRows([]);
            return;
          }

          const res = await waitForPayrollEmailJobResult(await payrollAPI.sendEmailsBulk(payload));
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
          throw error;
        } finally {
          setFinalizingAndSending(false);
        }
      },
    });
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

      setPayrollActionConfirm({
        title: "Xác nhận xoá dữ liệu lương DRAFT",
        description: `Xoá ${draftCount} phiếu lương DRAFT tháng ${periodLabel}.`,
        confirmLabel: "Xoá DRAFT",
        tone: "danger",
        items: payrollData.filter((item) => item.status === "DRAFT"),
        summary: [
          { label: "DRAFT", value: draftCount },
          { label: "Đã chốt", value: finalizedCount },
          { label: "Đã thanh toán", value: paidCount },
        ],
        warning: "Các phiếu đã chốt/đã thanh toán sẽ không bị xoá.",
        onConfirm: async () => {
          try {
            setDeletingPayrollPeriod(true);
            const res = await payrollAPI.deletePeriod(payload);
            const result = res.data?.data || {};

            toast.success(`Đã xoá ${result.deleted || 0} phiếu lương tháng ${periodLabel}.`);
            await fetchPayrollData();
            setSelectedRows([]);
          } catch (error) {
            toast.error(error.normalizedMessage || error.response?.data?.message || "Xoá dữ liệu bảng lương thất bại");
            throw error;
          } finally {
            setDeletingPayrollPeriod(false);
          }
        },
      });
      return;
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
    employees,
    canRunPayroll,
    fetchPayrollData,
    filteredData,
    filters,
    formatMoney,
    handleExportExcel,
    handleFilterChange,
    handlePayment,
    handleFinalizeSelectedPayrolls,
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
    handleClosePayrollActionConfirm,
    handleConfirmPayrollAction,
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
    payrollActionConfirm,
    confirmingPayrollAction,
    selectedPayrollItems,
    selectedMonth,
    selectedRows,
    setSelectedMonth,
    summary,
  };
};
