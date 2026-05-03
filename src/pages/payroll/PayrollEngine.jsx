import React, { useState, useEffect } from "react";
import {
  Calculator,
  Calendar,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Send,
  Lock,
  DollarSign,
  Search,
  AlertCircle,
  Loader2,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MonthYearPicker from "../../components/common/MonthYearPicker";
import { payrollAPI } from "../../apis/payrollAPI";
import { toast } from "react-toastify";
import { employeeApi } from "../../apis/employeeApi";
import {
  formatHours,
  getAllowanceBreakdownItems,
  getOtBreakdownItems,
} from "./overview/payrollOverviewUtils";

const PayrollEngine = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }); // State lưu tháng đã chọn (default: tháng hiện tại)
  const [payrollData, setPayrollData] = useState([]); // State lưu dữ liệu lương từ API
  const [loadingData, setLoadingData] = useState(false); // Loading cho việc fetch data tab 2
  const [selectedRows, setSelectedRows] = useState([]); // State lưu các hàng được chọn
  const [searchQuery, setSearchQuery] = useState(""); // State cho search
  const [totalUser, setTotalUser] = useState();


  useEffect(() => {
    const fech = async () => {
      try {
        const res = await employeeApi.getAll();
        console.log("API RES :", res.data.pagination.totalRecords)
        setTotalUser(res.data.pagination.totalRecords)  
      } catch (error) {
        console.log("API ERROR :", error)
      }
    }
    fech()
  }, [])


  const summary = {
    totalEmployees: 125,
    totalGross: 4500000000,
    totalDeductions: 500000000,
    totalNet: 4000000000,
    payDate: "10/01/2026",
  };

  // Helper format tiền
  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Tính ngày chi trả (tháng +1)
  const calculatePayDate = (monthString) => {
    if (!monthString) return "10/01/2026";

    const [year, month] = monthString.split("-").map(Number);
    const payMonth = month === 12 ? 1 : month + 1;
    const payYear = month === 12 ? year + 1 : year;

    return `10/${String(payMonth).padStart(2, "0")}/${payYear}`;
  };

  // Handler khi thay đổi tháng
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  // Handler chọn/bỏ chọn một hàng
  const handleSelectRow = (rowId) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((id) => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };

  // Handler chọn/bỏ chọn tất cả
  const handleSelectAll = () => {
    if (selectedRows.length === payrollData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(payrollData.map((row) => row._id));
    }
  };

  // Check xem tất cả có được chọn không
  const isAllSelected = payrollData.length > 0 && selectedRows.length === payrollData.length;
  const isSomeSelected = selectedRows.length > 0 && selectedRows.length < payrollData.length;

  // Filter data dựa trên search query
  const filteredPayrollData = payrollData.filter((row) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const fullName = row.employeeId?.fullName?.toLowerCase() || "";
    const employeeCode = row.employeeId?.employeeCode?.toLowerCase() || "";
    const department = row.departmentId?.name?.toLowerCase() || "";

    return (
      fullName.includes(searchLower) ||
      employeeCode.includes(searchLower) ||
      department.includes(searchLower)
    );
  });

  // useEffect: Gọi API khi chuyển sang tab 2
  useEffect(() => {
    if (currentStep === 2) {
      const fetchPayrollData = async () => {
        try {
          setLoadingData(true);

          const [year, month] = selectedMonth.split("-");

          const res = await payrollAPI.getall(month, year);
          console.log("Payroll data loaded successfully:", res);

          // Extract data từ response
          const apiData = res.data?.data?.data || res.data?.data || [];
          setPayrollData(apiData);
          setSelectedRows([]); // Reset selected rows khi load data mới

          toast.success("Tải dữ liệu lương thành công");
          console.log("Mapped payroll data:", apiData);
        } catch (error) {
          console.error("Error fetching payroll data:", error);
          toast.error("Không thể tải dữ liệu lương. Vui lòng thử lại.");
          setPayrollData([]);
        } finally {
          setLoadingData(false);
        }
      };

      fetchPayrollData();
    }
  }, [currentStep, selectedMonth]); // Chạy lại khi currentStep hoặc selectedMonth thay đổi

  // Xử lý chuyển bước
  const handleNext = async () => {
    if (currentStep === 1) {
      // Log ra ngày đã chọn (không phải ngày chi trả)
      console.log("Tháng/Năm đã chọn:", selectedMonth);

      // Parse để log chi tiết hơn
      const [year, month] = selectedMonth.split("-");
      console.log(`Kỳ lương: Tháng ${month}/${year}`);

      try {
        setIsProcessing(true);

        const payload = {
          month: parseInt(month, 10),
          year: parseInt(year, 10),
        };

        console.log("Gửi payload tính lương:", payload);

        const res = await payrollAPI.calcalculate(payload);

        console.log("API Response:", res);
        toast.success("Tính lương thành công!");

        // Chỉ chuyển tab khi API thành công
        setCurrentStep((prev) => prev + 1);
      } catch (error) {
        console.error("Lỗi API:", error);
        toast.error(error.response?.data?.message || "Tính lương thất bại. Vui lòng thử lại.");
      } finally {
        setIsProcessing(false);
      }
      return; // Dừng ở đây, không chạy code bên dưới
    }

    // Tab 2: Chỉ chuyển sang tab 3 mà không gọi API
    if (currentStep === 2) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (currentStep < 3) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep((prev) => prev + 1);
      }, 800);
    }
  };

  const handleCalculateBatch = async () => {
    const [year, month] = selectedMonth.split("-");
    const payload = {
      month: parseInt(month, 10),
      year: parseInt(year, 10),
    };

    if (!window.confirm(`Tính lương batch cho tháng ${month}/${year}?`)) return;

    try {
      setIsProcessing(true);
      const res = await payrollAPI.calculateBatch(payload);
      console.log("Batch payroll response:", res);
      toast.success("Tính lương batch thành công");
      setCurrentStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Tính lương batch thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // Handle finalize payroll (nút "Chốt kỳ lương & Lưu")
  const handleFinalize = async () => {
    try {
      setIsProcessing(true);

      const [year, month] = selectedMonth.split("-");

      const payload = {
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      };

      console.log("Gửi payload finalize:", payload);

      const res = await payrollAPI.finalize(payload);
      console.log("API finalize SUCCESS:", res);

      toast.success(`Đã chốt kỳ lương thành công!`);

      // TODO: Có thể redirect về trang khác hoặc reset form
      // navigate('/payroll/all');
    } catch (error) {
      console.error("Lỗi API finalize:", error);
      toast.error(error.response?.data?.message || "Chốt kỳ lương thất bại. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col gap-3 lg:h-[calc(100vh-100px)] lg:gap-4">
      {/* Loading Overlay khi call API */}
      {isProcessing && currentStep === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <Loader2 size={48} className="animate-spin text-blue-600" />
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">Đang tính toán lương...</p>
              <p className="text-sm text-gray-500 mt-1">Vui lòng đợi trong giây lát</p>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="shrink-0">
        {/* <h1 className="text-xl font-bold text-gray-800">Công cụ tính lương (Not yet active)</h1> */}
        <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
          Công cụ tính lương
          {/* <span className="text-red-500"> (Not yet active)</span> */}
        </h1>
        <p className="text-sm text-gray-500">
          Hệ thống tính toán và chốt lương tự động
        </p>
      </div>

      {/* --- STEPPER --- */}
      <div className="mb-4 flex items-center justify-center overflow-x-auto pb-1 shrink-0">
        <div className="flex items-center w-full max-w-3xl">
          <StepIndicator
            step={1}
            current={currentStep}
            label="Cấu hình kỳ lương"
            icon={<Calendar size={18} />}
          />
          <StepConnector active={currentStep >= 2} />
          <StepIndicator
            step={2}
            current={currentStep}
            label="Review số liệu"
            icon={<FileText size={18} />}
          />
          <StepConnector active={currentStep >= 3} />
          <StepIndicator
            step={3}
            current={currentStep}
            label="Chốt & Gửi"
            icon={<Send size={18} />}
          />
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 overflow-hidden">
        <Card className="h-full flex flex-col p-0 overflow-hidden border border-gray-200 shadow-sm">
          {/* STEP 1: CONFIGURATION */}
          {currentStep === 1 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-8 max-w-2xl mx-auto w-full space-y-8 flex-1 overflow-y-auto">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Bắt đầu kỳ tính lương mới
                  </h2>
                  <p className="text-gray-500">
                    Vui lòng chọn thông tin kỳ lương để hệ thống tổng hợp dữ liệu.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tháng / Năm
                    </label>
                    <MonthYearPicker
                      value={selectedMonth}
                      onChange={handleMonthChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chu kỳ lương
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option className="rounded-lg">
                        Theo Tháng (Monthly)
                      </option>
                      {/* <option>Theo Tuần (Weekly)</option> */}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-2">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-white p-2.5 text-blue-600 shadow-sm">
                      <Users size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nhân sự hiện có
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {totalUser}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-white p-2.5 text-green-600 shadow-sm">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Ngày chi trả
                      </p>
                      <p className="text-xl font-bold text-gray-800">
                        {calculatePayDate(selectedMonth)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCalculateBatch}
                    disabled={isProcessing}
                    className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Calculator size={18} className="mr-2" />
                    Tính lương batch
                  </Button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Review Toolbar */}
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertCircle size={16} className="text-blue-500" />
                    Hiển thị <strong>{filteredPayrollData.length}</strong> / {payrollData.length} bản lương
                  </div>
                </div>
                <div className="relative w-full md:w-auto">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm nhân viên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 md:w-auto"
                  />
                </div>
                <Button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white md:self-auto"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <>
                      Tiếp theo <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Data Table - Giới hạn chiều cao */}
              <div className="flex-1 overflow-auto">
                {loadingData ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 size={40} className="animate-spin text-blue-600" />
                      <p className="text-sm text-gray-500">Đang tải dữ liệu lương...</p>
                    </div>
                  </div>
                ) : payrollData.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-400">
                      <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Không có dữ liệu lương</p>
                      <p className="text-xs mt-1">Vui lòng thử lại</p>
                    </div>
                  </div>
                ) : filteredPayrollData.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-400">
                      <Search size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Không tìm thấy kết quả</p>
                      <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                  </div>
                ) : (
                  <table className="hidden w-full text-left text-xs md:table">
                    <thead className="bg-white border-b border-gray-200 text-[10px] uppercase text-gray-500 font-semibold sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-2">Nhân viên</th>
                        <th className="p-2">Phòng ban</th>
                        <th className="p-2 text-right">Lương cơ bản</th>
                        <th className="p-2 text-right text-orange-600">Lương OT</th>
                        <th className="p-2 text-right text-green-600">Phụ cấp</th>
                        <th className="p-2 text-right text-red-600">Khấu trừ</th>
                        <th className="p-2 text-right bg-blue-50/50">Thực nhận</th>
                        <th className="p-2 text-center">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPayrollData.map((row) => {
                        const otBreakdown = getOtBreakdownItems(row);
                        const allowanceBreakdown = getAllowanceBreakdownItems(row);
                        return (
                          <tr
                            key={row._id}
                            className="align-top hover:bg-gray-50 group transition-colors"
                          >
                            <td className="p-2 font-medium text-gray-800">
                              {row.employeeId?.fullName || "--"} <br />
                              <span className="text-[10px] text-gray-400 font-normal">
                                {row.employeeId?.employeeCode || "--"}
                              </span>
                            </td>
                            <td className="p-2 text-gray-600">
                              {row.departmentId?.name || "--"}
                            </td>
                            <td className="p-2 text-right font-mono text-gray-600">
                              {formatMoney(row.baseSalary || 0)}
                            </td>
                            <td className="p-2">
                              <div className="text-right font-mono text-gray-600">
                                {formatMoney(row.otPay || 0)}
                              </div>
                              <BreakdownList items={otBreakdown} formatter={formatHours} />
                            </td>
                            <td className="p-2">
                              <div className="text-right font-mono text-gray-600">
                                {formatMoney(row.totalAllowance || 0)}
                              </div>
                              <BreakdownList items={allowanceBreakdown} formatter={formatMoney} />
                            </td>
                            <td className="p-2 text-right font-mono text-gray-600">
                              -{formatMoney(row.totalDeduction || 0)}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-blue-700 bg-blue-50/30 group-hover:bg-blue-100/30 text-sm">
                              {formatMoney(row.netIncome || 0)}
                            </td>
                            <td className="p-2 text-center">
                              {row.status === "DRAFT" ? (
                                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  <AlertCircle size={10} /> Xem trước
                                </span>
                              ) : row.status === "FINALIZED" ? (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  <CheckCircle2 size={10} /> Hoàn thành
                                </span>
                              ) : (
                                <CheckCircle2
                                  size={14}
                                  className="text-green-500 mx-auto"
                                />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {!loadingData && filteredPayrollData.length > 0 && (
                  <div className="space-y-3 p-3 md:hidden">
                    {filteredPayrollData.map((row) => {
                      const otBreakdown = getOtBreakdownItems(row);
                      const allowanceBreakdown = getAllowanceBreakdownItems(row);
                      return (
                      <article key={row._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800">{row.employeeId?.fullName || "--"}</p>
                            <p className="text-xs text-gray-500">{row.employeeId?.employeeCode || "--"}</p>
                            <p className="mt-1 text-sm text-gray-600">{row.departmentId?.name || "--"}</p>
                          </div>
                          {row.status === "DRAFT" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold text-yellow-700">
                              Xem trước
                            </span>
                          ) : row.status === "FINALIZED" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold text-green-700">
                              Hoàn thành
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs uppercase text-gray-400">Lương cơ bản</p>
                            <p className="font-medium text-gray-700">{formatMoney(row.baseSalary || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-400">Thực nhận</p>
                            <p className="font-bold text-blue-700">{formatMoney(row.netIncome || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-400">OT</p>
                            <p className="font-medium text-orange-600">{formatMoney(row.otPay || 0)}</p>
                            <BreakdownList items={otBreakdown} formatter={formatHours} align="left" />
                          </div>
                          <div>
                            <p className="text-xs uppercase text-gray-400">Khấu trừ</p>
                            <p className="font-medium text-red-600">-{formatMoney(row.totalDeduction || 0)}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-xs uppercase text-gray-400">Phụ cấp</p>
                            <p className="font-medium text-green-600">{formatMoney(row.totalAllowance || 0)}</p>
                            <BreakdownList items={allowanceBreakdown} formatter={formatMoney} align="left" />
                          </div>
                        </div>
                      </article>
                    )})}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: FINALIZE */}
          {currentStep === 3 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Sẵn sàng chốt lương
                  </h2>
                  <p className="text-gray-500">
                    Vui lòng kiểm tra lại các chỉ số tổng quan trước khi phát
                    hành phiếu lương.
                  </p>
                </div>

                {/* Big Stats Grid */}
                {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SummaryStat
                    label="Tổng quỹ lương (Total Cost)"
                    value={formatMoney(summary.totalGross)}
                    icon={<DollarSign size={20} />}
                    theme="blue"
                  />
                  <SummaryStat
                    label="Tổng thực nhận (Total Net)"
                    value={formatMoney(summary.totalNet)}
                    icon={<Users size={20} />}
                    theme="green"
                  />
                  <SummaryStat
                    label="Tổng khấu trừ (Thuế/BH)"
                    value={formatMoney(summary.totalDeductions)}
                    icon={<FileText size={20} />}
                    theme="orange"
                  />
                </div> */}

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm">
                    Checklist an toàn
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-green-500" /> Đã
                      đối chiếu chấm công đầy đủ ({totalUser-1} nhân viên).
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-green-500" /> Đã
                      cập nhật các khoản thưởng/phạt phát sinh.
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-green-500" /> Đã
                      tính toán Thuế TNCN & Bảo hiểm theo luật mới nhất.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER: NAVIGATION BUTTONS */}
          <div className="flex shrink-0 flex-col gap-3 border-t border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 1 || isProcessing}
              className={
                currentStep === 1 ? "opacity-0 pointer-events-none" : ""
              }
            >
              <ArrowLeft size={18} className="mr-2" /> Quay lại
            </Button>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              {currentStep === 3 ? (
                <>
                  <Button
                    variant="secondary"
                    className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Send size={18} className="mr-2" /> Gửi phiếu lương (Email)
                  </Button>
                  <Button
                    onClick={handleFinalize}
                    disabled={isProcessing}
                    className="text-white shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        <span>Đang xử lý...</span>
                      </div>
                    ) : (
                      <>
                        <Lock size={18} className="mr-2" /> Chốt kỳ lương & Lưu
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className={`bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] disabled:opacity-70 disabled:cursor-not-allowed ${
                    currentStep === 2 ? "hidden" : ""
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                        <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <>
                      Tiếp theo <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const BreakdownList = ({ items, formatter, align = "right" }) => {
  if (!items.length) {
    return <p className={`mt-1 text-[10px] text-gray-400 ${align === "right" ? "text-right" : ""}`}>Không có</p>;
  }

  return (
    <div className={`mt-1 space-y-1 text-[10px] text-gray-500 ${align === "right" ? "text-right" : ""}`}>
      {items.map((item) => (
        <div key={item.key} className="flex items-start justify-between gap-2">
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <span className="shrink-0 font-mono font-medium text-gray-700">
            {formatter(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const StepIndicator = ({ step, current, label }) => {
  const isActive = current >= step;
  const isCurrent = current === step;
  return (
    <div
      className={`flex items-center gap-2 ${isActive ? "text-blue-600" : "text-gray-400"
        }`}
    >
      <div
        className={`
        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
        ${isCurrent
            ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-110"
            : isActive
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-400"
          }
      `}
      >
        {isActive && !isCurrent ? <CheckCircle2 size={16} /> : step}
      </div>
      <span
        className={`text-sm font-medium hidden sm:block ${isCurrent ? "text-gray-800" : ""
          }`}
      >
        {label}
      </span>
    </div>
  );
};

const StepConnector = ({ active }) => (
  <div
    className={`flex-1 h-0.5 mx-4 ${active ? "bg-blue-200" : "bg-gray-200"}`}
  ></div>
);

const SummaryStat = ({ label, value, icon, theme }) => {
  const themes = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-4 mb-3">
        <div className={`p-3 rounded-lg ${themes[theme]}`}>{icon}</div>
        <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-gray-800 font-mono tracking-tight">
        {value}
      </p>
    </div>
  );
};

export default PayrollEngine;

