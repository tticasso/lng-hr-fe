import React, { useState, useRef } from "react";
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
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import logo from "../../assets/logo.png";
const MyPayslip = () => {
  const contentRef = useRef(null);

  const handleDownloadPdf = async () => {
    const element = contentRef.current;
    if (!element) return;

    const originalShadow = element.style.boxShadow;
    element.style.boxShadow = "none";
    // Tạm thời set nền trắng để tránh bị đen nền nếu trong suốt
    element.style.backgroundColor = "#ffffff";

    try {
      // --- BƯỚC 2: CHỤP ẢNH ĐỘ PHÂN GIẢI CAO ---
      const canvas = await html2canvas(element, {
        scale: 4, // Tăng lên 4 để chữ cực nét (Fix lỗi thiếu nét)
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      // --- BƯỚC 3: TÍNH TOÁN KÍCH THƯỚC PDF (Fix lỗi lề rộng) ---
      const pdf = new jsPDF("p", "mm", "a4"); // Khổ A4 đứng

      const pdfWidth = 210;
      const pdfHeight = 297;

      const marginX = 10;
      const marginY = 10;

      const imgWidth = pdfWidth - 2 * marginX;

      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Nếu ảnh dài hơn 1 trang -> Tự động cắt trang
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

      pdf.save(`PhieuLuong_${selectedPeriod.month}-${selectedPeriod.year}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF:", error);
    } finally {
      element.style.boxShadow = originalShadow;
      element.style.backgroundColor = "";
    }
  };
  const periods = [
    {
      id: 1,
      month: "12",
      year: "2025",
      status: "Not Paid",
      label: "Tháng 12/2025",
      date: "10/01/2026",
    },
    {
      id: 2,
      month: "11",
      year: "2025",
      status: "Paid",
      label: "Tháng 11/2025",
      date: "10/12/2025",
    },
    {
      id: 3,
      month: "10",
      year: "2025",
      status: "Paid",
      label: "Tháng 10/2025",
      date: "10/11/2025",
    },
    {
      id: 4,
      month: "09",
      year: "2025",
      status: "Paid",
      label: "Tháng 09/2025",
      date: "10/10/2025",
    },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);

  // 2. Mock Data: Chi tiết phiếu lương (Giả lập theo kỳ đã chọn)
  const payslipData = {
    employee: {
      name: "Tạ Khánh Tùng",
      id: "EMP-2022-089",
      department: "Product Engineering",
      position: "Senior Developer",
      taxId: "893749232",
      bankAccount: "190333... (VP Bank)",
    },
    // Các khoản thu nhập
    incomes: [
      { label: "Lương cơ bản (Base Salary)", value: 35000000 },
      { label: "Số ngày công thực tế (22/22)", value: 0, isNote: true }, // Dòng note ko có tiền
      { label: "Phụ cấp ăn trưa", value: 1200000 },
      { label: "Phụ cấp xăng xe/đi lại", value: 500000 },
      { label: "Làm thêm giờ (OT) - 3.5h", value: 1050000 },
      { label: "Thưởng hiệu suất (KPI)", value: 2000000 },
    ],
    // Các khoản khấu trừ
    deductions: [
      { label: "BHXH (8%)", value: 2800000 },
      { label: "BHYT (1.5%)", value: 525000 },
      { label: "BHTN (1%)", value: 350000 },
      { label: "Thuế TNCN tạm tính", value: 1850000 },
      { label: "Công đoàn phí", value: 0 },
    ],
    totalIncome: 39750000,
    totalDeduction: 5525000,
    netSalary: 34225000,
  };

  // Helper format tiền tệ VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      {/* --- CỘT TRÁI: DANH SÁCH KỲ LƯƠNG (3/12) --- */}
      <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-hidden">
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
                onClick={() => setSelectedPeriod(period)}
                className={`
                  p-3 rounded-lg cursor-pointer transition-all border
                  ${
                    selectedPeriod.id === period.id
                      ? "bg-blue-50 border-blue-200 shadow-sm"
                      : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                  }
                `}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`font-bold text-sm ${
                      selectedPeriod.id === period.id
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
                  <span>Ngày trả: {period.date}</span>
                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium text-[10px]">
                    ĐÃ CHỐT
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* --- CỘT PHẢI: CHI TIẾT PHIẾU LƯƠNG (9/12) --- */}
      <div className="lg:col-span-9 h-full overflow-y-auto pr-1">
        {/* Toolbar Actions */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Chi tiết phiếu lương
            </h1>
            <p className="text-gray-500 text-sm">
              Kỳ lương: {selectedPeriod.label}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex items-center gap-2 text-sm"
            >
              <HelpCircle size={16} /> Gửi thắc mắc
            </Button>
            <Button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm shadow-sm"
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
                {/* <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                H
              </div> */}
                <img src={logo} alt="logo LNG" className="w-12" />
                <div>
                  <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">
                    Công ty Cổ phần LNG
                  </h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    219 Ngô Gia Tự, Phường Kinh Băc, Tỉnh Bắc Ninh
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase font-semibold">
                  Phiếu lương tháng
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedPeriod.month}/{selectedPeriod.year}
                </p>
                {/* <div className="mt-2 flex items-center justify-center gap-2 w-fit ml-auto bg-green-100 text-green-700 px-3 py-1.5 rounded text-[11px] font-bold border border-green-200 uppercase tracking-wide">
                  <CheckCircle2
                    size={14}
                    className="shrink-0 relative"
                    strokeWidth={3}
                  />

                  <span className="leading-none relative -top-[2px]">
                    ĐÃ THANH TOÁN
                  </span>
                </div> */}
              </div>
            </div>

            {/* 2. Employee Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg mb-8 border border-gray-100">
              <InfoBlock
                label="Họ tên nhân viên"
                value={payslipData.employee.name}
                bold
              />
              <InfoBlock label="Mã nhân viên" value={payslipData.employee.id} />
              <InfoBlock
                label="Phòng ban"
                value={payslipData.employee.department}
              />
              <InfoBlock
                label="Chức danh"
                value={payslipData.employee.position}
              />
              <InfoBlock
                label="Mã số thuế"
                value={payslipData.employee.taxId}
              />
              <InfoBlock
                label="Tài khoản nhận"
                value={payslipData.employee.bankAccount}
              />
              <InfoBlock label="Ngày trả lương" value={selectedPeriod.date} />
              <InfoBlock label="Đơn vị tiền tệ" value="VND" />
            </div>

            {/* 3. Main Details: Income vs Deduction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CỘT THU NHẬP */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase border-b-2 border-green-500 pb-2 mb-4 flex items-center justify-between">
                  <span>I. Các khoản thu nhập</span>
                  <DollarSign size={16} className="text-green-500" />
                </h3>
                <div className="space-y-3">
                  {payslipData.incomes.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm group"
                    >
                      <span className="text-gray-600 group-hover:text-gray-900">
                        {item.label}
                      </span>
                      <span
                        className={` font-medium ${
                          item.isNote ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        {item.value > 0
                          ? formatCurrency(item.value)
                          : item.isNote
                          ? ""
                          : "0 ₫"}
                      </span>
                    </div>
                  ))}

                  {/* Tổng thu nhập */}
                  <div className="border-t border-dashed border-gray-300 mt-4 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-700">
                      Tổng thu nhập (A)
                    </span>
                    <span className=" font-bold text-green-600 text-lg">
                      {formatCurrency(payslipData.totalIncome)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CỘT KHẤU TRỪ */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase border-b-2 border-red-500 pb-2 mb-4 flex items-center justify-between">
                  <span>II. Các khoản khấu trừ</span>
                  <FileText size={16} className="text-red-500" />
                </h3>
                <div className="space-y-3">
                  {payslipData.deductions.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm group"
                    >
                      <span className="text-gray-600 group-hover:text-gray-900">
                        {item.label}
                      </span>
                      <span className=" font-medium text-red-600/80">
                        -{formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}

                  {/* Tổng khấu trừ */}
                  <div className="border-t border-dashed border-gray-300 mt-4 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-700">
                      Tổng khấu trừ (B)
                    </span>
                    <span className=" font-bold text-red-600 text-lg">
                      -{formatCurrency(payslipData.totalDeduction)}
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
                {formatCurrency(payslipData.netSalary)}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
              <p>
                Mọi thắc mắc về phiếu lương vui lòng liên hệ bộ phận C&B trong
                vòng 3 ngày làm việc.
              </p>
              <p className="mt-1">
                Generated by LNG System • 09/12/2025 08:30 AM
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
      className={`text-sm text-gray-900 break-words leading-snug ${
        bold ? "font-bold" : "font-medium"
      }`}
    >
      {value || "--"}
    </p>
  </div>
);

export default MyPayslip;
