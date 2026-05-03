import React, { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download,
  HelpCircle,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  Printer,
  Loader2,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import logo from "../../assets/logo.png";
import { payrollAPI } from "../../apis/payrollAPI";
import { employeeApi } from "../../apis/employeeApi";
import { toast } from "react-toastify";
import { message } from "antd";

const OT_TYPE_LABELS = {
  weekday: "OT ngày thường",
  weekend: "OT cuối tuần",
  holiday: "OT ngày lễ",
  weekday_night: "OT đêm ngày thường",
  weekend_night: "OT đêm cuối tuần",
  holiday_night: "OT đêm ngày lễ",
};

const ALLOWANCE_TYPE_LABELS = {
  lunch: "Phụ cấp ăn trưa",
  fuel: "Phụ cấp xăng xe",
  other: "Phụ cấp khác",
  responsibility: "Phụ cấp trách nhiệm",
};

const MyPayslip = () => {
  const contentRef = useRef(null);

  // State
  const [loading, setLoading] = useState(true);
  const [payrollList, setPayrollList] = useState([]);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch payroll list
        const payrollRes = await payrollAPI.getbyme();
        const payrolls = payrollRes.data?.data || [];

        if (payrolls.length > 0) {
          setPayrollList(payrolls);
          setSelectedPayroll(payrolls[0]); // Select first by default

          // 2. Fetch employee detail để lấy thông tin thiếu
          const empRes = await employeeApi.getMe();
          const empData = empRes.data?.data?.employee || empRes.data?.employee;
          setEmployeeDetail(empData);
        }

        console.log("Payroll data:", payrolls);
      } catch (error) {
        console.error("Error fetching payroll:", error);
        toast.error("Không thể tải dữ liệu phiếu lương");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadPdf = async () => {
    // Custom loading toast với màu sắc đơn giản
    const loadingToastId = toast.loading(
      <div className="flex items-center gap-3">
        {/* <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div> */}
        <div>
          <p className="font-medium text-gray-800">Đang tạo PDF...</p>
          <p className="text-xs text-gray-600">Vui lòng chờ trong giây lát</p>
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
        closeButton: false,
        style: {
          background: "#ffffff",
          color: "#374151",
          borderRadius: "8px",
          padding: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid #e5e7eb"
        }
      }
    );

    const element = contentRef.current;
    if (!element || !selectedPayroll) {
      toast.dismiss(loadingToastId);
      return;
    }

    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = "none";
    element.style.backgroundColor = "#ffffff";

    try {
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = 210;
      const pdfHeight = 297;
      const marginX = 10;
      const marginY = 10;
      const imgWidth = pdfWidth - 2 * marginX;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = marginY;

      pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - marginY * 2;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + marginY;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", marginX, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - marginY * 2;
      }

      pdf.save(`PhieuLuong_${selectedPayroll.month}-${selectedPayroll.year}.pdf`);
      
      // Dismiss loading toast và hiển thị success toast đơn giản
      toast.dismiss(loadingToastId);
      toast.success(
        <div className="flex items-center gap-3">
          {/* <div className="flex-shrink-0 w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 size={18} className="text-green-600" />
          </div> */}
          <div>
            <p className="font-medium text-gray-800">Tải PDF thành công!</p>
            <p className="text-xs text-gray-600">File đã được lưu vào máy tính</p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#ffffff",
            color: "#374151",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #d1fae5"
          }
        }
      );
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
      
      // Dismiss loading toast và hiển thị error toast đơn giản
      toast.dismiss(loadingToastId);
      toast.error(
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-red-50 rounded-full flex items-center justify-center">
            <FileText size={18} className="text-red-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">Không thể xuất PDF</p>
            <p className="text-xs text-gray-600">Vui lòng thử lại sau</p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          style: {
            background: "#ffffff",
            color: "#374151",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #fecaca"
          }
        }
      );
    } finally {
      element.style.boxShadow = originalShadow;
      element.style.backgroundColor = "";
    }
  };

  // Helper format tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Helper format date
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Generate periods list from payroll data
  const periods = payrollList.map((payroll, index) => ({
    id: payroll._id,
    month: payroll.month.toString(),
    year: payroll.year.toString(),
    status: payroll.status === "PAID" ? "Paid" : "Not Paid",
    label: `Tháng ${payroll.month}/${payroll.year}`,
    date: formatDate(payroll.updatedAt),
    rawData: payroll,
  }));

  const buildPayslipData = () => {
    if (!selectedPayroll) {
      return null;
    }

    const otBreakdown = Object.entries(selectedPayroll.otHours || {})
      .map(([key, hours]) => ({
        key,
        label: OT_TYPE_LABELS[key] || key,
        valueText: `${Number(hours || 0).toFixed(2)}h`,
        sortValue: Number(hours || 0),
      }))
      .filter((item) => item.sortValue > 0);

    const allowanceBreakdown = Object.entries(
      selectedPayroll.allowanceBreakdown || {},
    )
      .map(([key, value]) => ({
        key,
        label: ALLOWANCE_TYPE_LABELS[key] || key,
        valueText: formatCurrency(Number(value || 0)),
        sortValue: Number(value || 0),
      }))
      .filter((item) => item.sortValue > 0);

    const totalOtHours = otBreakdown.reduce((sum, item) => sum + item.sortValue, 0);

    return {
      employee: {
        name: selectedPayroll.employeeId?.fullName || "--",
        id: selectedPayroll.employeeId?.employeeCode || "--",
        department: selectedPayroll.departmentId?.name || employeeDetail?.department || "--",
        position: selectedPayroll.employeeId?.jobTitle || employeeDetail?.jobTitle || "--",
        taxId: employeeDetail?.taxIdentification || "--",
        bankAccount: employeeDetail?.bankAccount
          ?             `${employeeDetail.bankAccount.accountNumber} (${employeeDetail.bankAccount.bankName})`
          : "--",
      },
      workDays: {
        standard: selectedPayroll.standardWorkDays || 0,
        actual: selectedPayroll.actualWorkDays || 0,
        paidLeave: selectedPayroll.paidLeaveDays || 0,
        dailyRate: selectedPayroll.dailyRate || 0,
      },
      otHours: selectedPayroll.otHours || {},
      otBreakdown,
      allowanceBreakdown,

      // Thu nhập
      incomes: [
        {
          label: "Lương cơ bản",
          value: selectedPayroll.baseSalary || 0,
        },
        {
          label: `Lương theo công (${(selectedPayroll.actualWorkDays || 0).toFixed(2)}/${selectedPayroll.standardWorkDays || 0} ngày)`,
          value: selectedPayroll.salaryFromWork || 0,
        },
        {
          label: "Phụ cấp (Tổng)",
          value: selectedPayroll.totalAllowance || 0,
          details: allowanceBreakdown,
        },
        {
          label: `Làm thêm giờ (OT) - ${totalOtHours.toFixed(2)}h`,
          value: selectedPayroll.otPay || 0,
          details: otBreakdown,
        },
      ],

      // Khấu trừ
      deductions: [
        {
          label: "BHXH (8%)",
          value: selectedPayroll.insurance?.bhxh || 0,
        },
        {
          label: "BHYT (1.5%)",
          value: selectedPayroll.insurance?.bhyt || 0,
        },
        {
          label: "BHTN (1%)",
          value: selectedPayroll.insurance?.bhtn || 0,
        },
      ],

      totalIncome: selectedPayroll.grossIncome || 0,
      totalDeduction: selectedPayroll.insurance?.total || 0,
      netSalary: selectedPayroll.netIncome || 0,
    };
  };

  const payslipData = buildPayslipData();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // No data state
  if (payrollList.length === 0 || !selectedPayroll) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-gray-500">
        <FileText size={64} className="mb-4 text-gray-300" />
        <p className="text-lg font-semibold">Chưa có phiếu lương nào</p>
        <p className="text-sm">Vui lòng liên hệ bộ phận HR để biết thêm chi tiết</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-[calc(100dvh-5rem)] grid-cols-1 gap-4 lg:h-[calc(100vh-100px)] lg:grid-cols-12 lg:gap-6">
      {/* --- CỘT TRÁI: DANH SÁCH KỲ LƯƠNG (3/12) --- */}
      <div className="flex flex-col gap-4 overflow-hidden lg:col-span-3 lg:h-full">
        <Card className="h-full flex flex-col p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Clock size={18} /> Lịch sử lương
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {periods.map((period) => (
              <div
                key={period.id}
                onClick={() => setSelectedPayroll(period.rawData)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all border
                  ${selectedPayroll?._id === period.id
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                  }
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-bold text-sm ${selectedPayroll?._id === period.id
                      ? "text-blue-700"
                      : "text-gray-700"
                      }`}
                  >
                    {period.label}
                  </span>
                  {period.status === "Paid" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <Clock size={16} className="text-orange-500" />
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Cập nhật: {period.date}</span>
                  <span className={`px-1.5 py-0.5 rounded font-medium text-[10px] ${period.status === "Paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                    }`}>
                    {period.status === "Paid" ? "ĐÃ TRẢ" : "CHƯA TRẢ"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* --- CỘT PHẢI: CHI TIẾT PHIẾU LƯƠNG (9/12) --- */}
      <div className="lg:col-span-9 lg:h-full lg:overflow-y-auto lg:pr-1">
        {/* Toolbar Actions */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">
              Chi tiết phiếu lương
            </h1>
            <p className="text-gray-500 text-sm">
              Kỳ lương: Tháng {selectedPayroll?.month}/{selectedPayroll?.year}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="secondary"
              className="flex w-full items-center gap-2 text-sm sm:w-auto"
            >
              <HelpCircle size={16} /> Gửi thắc mắc
            </Button>
            <Button
              className="flex w-full items-center gap-2 bg-blue-600 text-sm shadow-sm hover:bg-blue-700 sm:w-auto"
              onClick={handleDownloadPdf}
            >
              <Download size={16} /> Tải PDF
            </Button>
          </div>
        </div>

        {/* PAYSLIP PAPER */}
        <div ref={contentRef}>
          <Card className="max-w-4xl mx-auto border border-gray-200 shadow-md print:shadow-none mb-10">
            {/* 1. Header Payslip */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <img src={logo} alt="logo LNG" className="w-12" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                    Công ty Cổ phần LNG
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    219 Ngô Gia Tự, Phường Kinh Bắc, Tỉnh Bắc Ninh
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase font-semibold">
                  Phiếu lương tháng
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedPayroll?.month}/{selectedPayroll?.year}
                </p>
              </div>
            </div>

            {/* 2. Employee Info Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoBlock
                label="Họ tên nhân viên"
                value={payslipData?.employee.name}
                bold
              />
              <InfoBlock label="Mã nhân viên" value={payslipData?.employee.id} />
              <InfoBlock
                label="Phòng ban"
                value={payslipData?.employee.department}
              />
              <InfoBlock
                label="Chức danh"
                value={payslipData?.employee.position}
              />
              <InfoBlock
                label="Mã số thuế"
                value={payslipData?.employee.taxId}
              />
              <InfoBlock
                label="Tài khoản nhận"
                value={payslipData?.employee.bankAccount}
              />
              <InfoBlock
                label="Lương theo ngày"
                value={payslipData?.workDays.dailyRate ? formatCurrency(payslipData.workDays.dailyRate) : "--"}
              />
              <InfoBlock label="Ngày cập nhật" value={formatDate(selectedPayroll?.updatedAt)} />
              <InfoBlock label="Đơn vị tiền tệ" value="VND" />
            </div>

            {/* 3. Main Details: Income vs Deduction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CỘT THU NHẬP */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase border-b-2 border-green-500 pb-2 mb-4 flex items-center justify-between">
                  <span>I. CÁC KHOẢN THU NHẬP</span>
                  <DollarSign size={16} className="text-green-500" />
                </h3>
                <div className="space-y-3">
                  {payslipData?.incomes.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div
                        className="flex justify-between items-center text-sm group"
                        title={item.note || ""}
                      >
                        <span className="text-gray-600 group-hover:text-gray-900">
                          {item.label}
                        </span>
                        <span
                          className={` font-medium ${item.isNote ? "text-gray-400" : "text-gray-800"}`}
                        >
                          {item.value > 0
                            ? formatCurrency(item.value)
                            : item.isNote
                              ? ""
                              : formatCurrency(0)}
                        </span>
                      </div>

                      {item.details?.length > 0 && (
                        <div className="ml-4 rounded-lg bg-gray-50 px-3 py-2">
                          {item.details.map((detail) => (
                            <div
                              key={detail.key}
                              className="flex items-center justify-between py-1 text-xs text-gray-500"
                            >
                              <span>{detail.label}</span>
                              <span className="font-mono font-semibold text-gray-700">
                                {detail.valueText}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Tổng thu nhập */}
                  <div className="border-t border-dashed border-gray-300 mt-4 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-700">
                      Tổng thu nhập (A)
                    </span>
                    <span className=" font-bold text-green-600 text-lg">
                      {formatCurrency(payslipData?.totalIncome)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CỘT KHẤU TRỪ */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase border-b-2 border-red-500 pb-2 mb-4 flex items-center justify-between">
                  <span>II. CÁC KHOẢN KHẤU TRỪ</span>
                  <FileText size={16} className="text-red-500" />
                </h3>
                <div className="space-y-3">
                  {payslipData?.deductions.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm group"
                      title={item.note || ""}
                    >
                      <span className="text-gray-600 group-hover:text-gray-900">
                        {item.label}
                      </span>
                      <span className=" font-medium text-red-600/80">
                        {item.value > 0 ? `-${formatCurrency(item.value)}` : formatCurrency(0)}
                      </span>
                    </div>
                  ))}

                  {/* Tổng khấu trừ */}
                  <div className="border-t border-dashed border-gray-300 mt-4 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-700">
                      Tổng khấu trừ (B)
                    </span>
                    <span className=" font-bold text-red-600 text-lg">
                      -{formatCurrency(payslipData?.totalDeduction)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. NET SALARY Section */}
            <div className="mt-10 bg-blue-50/50 rounded-xl p-6 border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold">
                  Thực lĩnh (Net Salary = A - B)
                </p>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Số tiền đã được chuyển vào tài khoản ngân hàng của bạn.
                </p>
              </div>
              <div className="text-3xl md:text-4xl font-bold text-blue-700 tracking-tight">
                {formatCurrency(payslipData?.netSalary)}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
              <p>
                Mọi thắc mắc về phiếu lương vui lòng liên hệ bộ phận C&B trong
                vòng 3 ngày làm việc.
              </p>
              <p className="mt-1">
                Generated by LNG System â€¢ {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const InfoBlock = ({ label, value, bold }) => (
  <div className="flex flex-col justify-center min-h-[3rem]">
    {" "}
    {/* Đảm bảo chiều cao tối thiểu */}
    <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1 leading-none">
      {label}
    </p>
    <p
      className={`text-sm text-gray-900 break-words leading-snug ${bold ? "font-bold" : "font-medium"
        }`}
    >
      {value || "--"}
    </p>
  </div>
);

export default MyPayslip;
