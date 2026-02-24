import React, { useState } from "react";
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
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const PayrollEngine = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const payrollData = [
    {
      id: "EMP001",
      name: "Nguyễn Văn An",
      dept: "Product",
      gross: 35000000,
      ot: 2500000,
      bonus: 1000000,
      deduction: 3500000,
      net: 35000000,
      status: "Valid",
    },
    {
      id: "EMP002",
      name: "Lê Thị Hoa",
      dept: "Design",
      gross: 28000000,
      ot: 0,
      bonus: 500000,
      deduction: 2800000,
      net: 25700000,
      status: "Valid",
    },
    {
      id: "EMP003",
      name: "Phạm Văn Dũng",
      dept: "Sales",
      gross: 15000000,
      ot: 0,
      bonus: 0,
      deduction: 0,
      net: 0,
      status: "Error",
      errorMsg: "Thiếu dữ liệu công",
    },
    {
      id: "EMP004",
      name: "Hoàng Thị G",
      dept: "Marketing",
      gross: 22000000,
      ot: 500000,
      bonus: 0,
      deduction: 2200000,
      net: 20300000,
      status: "Valid",
    },
  ];

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

  // Xử lý chuyển bước
  const handleNext = () => {
    if (currentStep < 3) {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep((prev) => prev + 1);
      }, 800); // Giả lập loading nhẹ
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
      {/* --- HEADER --- */}
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Công cụ tính lương(Not yet active)</h1>
        
        <p className="text-sm text-gray-500">
          Hệ thống tính toán và chốt lương tự động
        </p>
      </div>

      {/* --- STEPPER --- */}
      <div className="flex items-center justify-center mb-4 shrink-0">
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
                    Vui lòng chọn thông tin kỳ lương để hệ thống tổng hợp dữ
                    liệu.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tháng / Năm
                    </label>
                    <input
                      type="month"
                      defaultValue="2025-12"
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chu kỳ lương
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                      <option className="rounded-lg">
                        Theo Tháng (Monthly)
                      </option>
                      <option>Theo Tuần (Weekly)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                      <Users size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Nhân sự dự kiến
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {summary.totalEmployees}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-green-600">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Ngày chi trả
                      </p>
                      <p className="text-2xl font-bold text-gray-800">
                        {summary.payDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Review Toolbar */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertCircle size={16} className="text-orange-500" />
                  Phát hiện <strong>1</strong> lỗi cần xử lý trước khi chốt.
                </div>
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm nhân viên..."
                    className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4">Nhân viên</th>
                      <th className="p-4">Phòng ban</th>
                      <th className="p-4 text-right">Gross Salary</th>
                      <th className="p-4 text-right text-orange-600">OT Pay</th>
                      <th className="p-4 text-right text-green-600">Bonus</th>
                      <th className="p-4 text-right text-red-600">Deduction</th>
                      <th className="p-4 text-right bg-blue-50/50">NET PAY</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payrollData.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 group">
                        <td className="p-4 font-medium text-gray-800">
                          {row.name} <br />
                          <span className="text-xs text-gray-400 font-normal">
                            {row.id}
                          </span>
                        </td>
                        <td className="p-4 text-gray-600">{row.dept}</td>
                        <td className="p-4 text-right font-mono text-gray-600">
                          {formatMoney(row.gross)}
                        </td>
                        <td className="p-4 text-right font-mono text-gray-600">
                          {formatMoney(row.ot)}
                        </td>
                        <td className="p-4 text-right font-mono text-gray-600">
                          {formatMoney(row.bonus)}
                        </td>
                        <td className="p-4 text-right font-mono text-gray-600">
                          -{formatMoney(row.deduction)}
                        </td>
                        <td className="p-4 text-right font-mono font-bold text-blue-700 bg-blue-50/30 group-hover:bg-blue-100/30 text-base">
                          {formatMoney(row.net)}
                        </td>
                        <td className="p-4 text-center">
                          {row.status === "Error" ? (
                            <span
                              className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold"
                              title={row.errorMsg}
                            >
                              <AlertCircle size={12} /> Error
                            </span>
                          ) : (
                            <CheckCircle2
                              size={18}
                              className="text-green-500 mx-auto"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  <h2 className="text-2xl font-bold text-gray-800">
                    Sẵn sàng chốt lương
                  </h2>
                  <p className="text-gray-500">
                    Vui lòng kiểm tra lại các chỉ số tổng quan trước khi phát
                    hành phiếu lương.
                  </p>
                </div>

                {/* Big Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 uppercase text-sm">
                    Checklist an toàn
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-green-500" /> Đã
                      đối chiếu chấm công đầy đủ (125/125 nhân viên).
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
          <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center shrink-0">
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

            <div className="flex gap-3">
              {currentStep === 3 ? (
                <>
                  <Button
                    variant="secondary"
                    className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <Send size={18} className="mr-2" /> Gửi phiếu lương (Email)
                  </Button>
                  <Button className=" text-white shadow-lg shadow-blue-200">
                    <Lock size={18} className="mr-2" /> Chốt kỳ lương & Lưu
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
                >
                  {isProcessing ? (
                    "Đang xử lý..."
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

const StepIndicator = ({ step, current, label }) => {
  const isActive = current >= step;
  const isCurrent = current === step;
  return (
    <div
      className={`flex items-center gap-2 ${
        isActive ? "text-blue-600" : "text-gray-400"
      }`}
    >
      <div
        className={`
        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
        ${
          isCurrent
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
        className={`text-sm font-medium hidden sm:block ${
          isCurrent ? "text-gray-800" : ""
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
