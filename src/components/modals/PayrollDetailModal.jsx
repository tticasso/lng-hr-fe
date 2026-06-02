import { X } from "lucide-react";

import {
  formatDays,
  formatMoney,
  formatPercent,
  getAdjustmentBreakdownItems,
  getAllowanceBreakdownItems,
  getLeaveBreakdownItems,
  getOtPayBreakdownItems,
  getPayrollStatusLabel,
  getSalaryPeriodBreakdownItems,
} from "../../pages/payroll/overview/payrollOverviewUtils";

const MoneyRow = ({ label, value, tone = "default", formulaText }) => {
  const toneClass = {
    default: "text-gray-800",
    income: "text-green-700",
    deduction: "text-red-600",
    accent: "text-blue-700",
  }[tone];

  return (
    <div className="flex items-start justify-between gap-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-gray-700">{label}</p>
        {formulaText ? (
          <p className="mt-0.5 font-mono text-xs text-gray-400">{formulaText}</p>
        ) : null}
      </div>
      <p className={`shrink-0 whitespace-nowrap font-mono font-semibold ${toneClass}`}>
        {formatMoney(value)}
      </p>
    </div>
  );
};

const DetailSection = ({ title, children }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-4">
    <h4 className="mb-3 text-xs font-bold uppercase text-gray-500">{title}</h4>
    {children}
  </section>
);

const formatDate = (dateLike) => {
  if (!dateLike) return "--";
  return new Date(dateLike).toLocaleDateString("vi-VN");
};

const PayrollDetailModal = ({ isOpen, onClose, payroll }) => {
  if (!isOpen || !payroll) return null;

  const salaryPeriodItems = getSalaryPeriodBreakdownItems(payroll);
  const otItems = getOtPayBreakdownItems(payroll);
  const allowanceItems = getAllowanceBreakdownItems(payroll);
  const adjustmentItems = getAdjustmentBreakdownItems(payroll);
  const leaveItems = getLeaveBreakdownItems(payroll);
  const insuranceTotal = Number(payroll.insurance?.total || 0);
  const pit = Number(payroll.pit || 0);
  const totalAdjustmentDeductions = Number(payroll.totalAdjustmentDeductions || 0);
  const totalAdjustmentEarnings = Number(payroll.totalAdjustmentEarnings || 0);
  const employee = payroll.employeeId || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-gray-50 shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 bg-white p-5">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900">Chi tiết tiền lương</h3>
            <p className="mt-1 text-sm text-gray-500">
              {payroll.employeeId?.fullName || "--"} ({payroll.employeeId?.employeeCode || "--"}) - Tháng{" "}
              {payroll.month}/{payroll.year} - {getPayrollStatusLabel(payroll.status)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <DetailSection title="Lương theo giai đoạn">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-blue-50 p-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-blue-500">Ngày vào làm</p>
                  <p className="font-mono font-bold text-blue-900">{formatDate(employee.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Kết thúc thử việc</p>
                  <p className="font-mono font-bold text-blue-900">{formatDate(employee.probationEndDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Ngày nghỉ việc</p>
                  <p className="font-mono font-bold text-blue-900">{formatDate(employee.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Trạng thái nhân viên</p>
                  <p className="font-mono font-bold text-blue-900">{employee.status || payroll.employeeStatus || "--"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Lương gốc</p>
                  <p className="font-mono font-bold text-blue-900">{formatMoney(payroll.baseSalary)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Hệ số bình quân</p>
                  <p className="font-mono font-bold text-blue-900">
                    {formatPercent(payroll.salaryMultiplier || 1)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Công chuẩn</p>
                  <p className="font-mono font-bold text-blue-900">
                    {formatDays(payroll.standardWorkDays)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-blue-500">Lương hiệu lực</p>
                  <p className="font-mono font-bold text-blue-900">
                    {formatMoney(payroll.effectiveBaseSalary)}
                  </p>
                </div>
              </div>
              <div className="mt-3 divide-y divide-gray-100">
                {salaryPeriodItems.length ? (
                  salaryPeriodItems.map((item) => (
                    <MoneyRow
                      key={item.key}
                      label={item.label}
                      value={item.value}
                      tone="income"
                      formulaText={item.formulaText}
                    />
                  ))
                ) : (
                  <p className="py-3 text-sm text-gray-400">Chưa có dữ liệu công theo giai đoạn.</p>
                )}
              </div>
              <MoneyRow
                label="Tổng lương theo công"
                value={payroll.salaryFromWork}
                tone="accent"
                formulaText={`${formatDays(payroll.actualWorkDays)} công tính lương`}
              />
            </DetailSection>

            <DetailSection title="Thu nhập khác">
              <MoneyRow label="Tiền tăng ca" value={payroll.otPay} tone="income" />
              <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
                {otItems.length ? (
                  otItems.map((item) => (
                    <MoneyRow key={item.key} label={item.label} value={item.value} formulaText={item.formulaText} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Không có OT.</p>
                )}
              </div>
              <MoneyRow label="Phụ cấp cố định" value={payroll.totalAllowance} tone="income" />
              <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
                {allowanceItems.length ? (
                  allowanceItems.map((item) => (
                    <MoneyRow key={item.key} label={item.label} value={item.value} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Không có phụ cấp cố định.</p>
                )}
              </div>
              <MoneyRow label="Điều chỉnh cộng" value={totalAdjustmentEarnings} tone="income" />
            </DetailSection>

            <DetailSection title="Khấu trừ và thực nhận">
              <MoneyRow label="BHXH" value={payroll.insurance?.bhxh || 0} tone="deduction" />
              <MoneyRow label="BHYT" value={payroll.insurance?.bhyt || 0} tone="deduction" />
              <MoneyRow label="BHTN" value={payroll.insurance?.bhtn || 0} tone="deduction" />
              <MoneyRow label="Tổng bảo hiểm" value={insuranceTotal} tone="deduction" />
              <MoneyRow label="Thuế TNCN" value={pit} tone="deduction" />
              <MoneyRow label="Điều chỉnh trừ" value={totalAdjustmentDeductions} tone="deduction" />
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <MoneyRow label="Tổng thu nhập" value={payroll.grossIncome} tone="income" />
                <MoneyRow label="Tổng khấu trừ" value={payroll.totalDeduction} tone="deduction" />
                <MoneyRow label="Thực nhận" value={payroll.netIncome} tone="accent" />
              </div>
            </DetailSection>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DetailSection title="Chi tiết điều chỉnh lương">
              {adjustmentItems.length ? (
                <div className="divide-y divide-gray-100">
                  {adjustmentItems.map((item) => (
                    <MoneyRow
                      key={item.key}
                      label={`${item.label}${item.note ? ` - ${item.note}` : ""}`}
                      value={item.value}
                      tone={item.value < 0 ? "deduction" : "income"}
                      formulaText={item.formulaText}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Không có khoản điều chỉnh.</p>
              )}
            </DetailSection>

            <DetailSection title="Nghỉ phép và ngày công">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                <div>
                  <p className="text-xs uppercase text-gray-400">Công tính lương</p>
                  <p className="font-mono font-bold text-gray-800">{formatDays(payroll.actualWorkDays)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-400">Nghỉ hưởng lương</p>
                  <p className="font-mono font-bold text-gray-800">{formatDays(payroll.paidLeaveDays)}</p>
                </div>
              </div>
              <div className="mt-3 divide-y divide-gray-100">
                {leaveItems.length ? (
                  leaveItems.map((item) => (
                    <MoneyRow key={item.key} label={item.label} value={item.value} formulaText={item.formulaText} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400">Không có nghỉ phép trong kỳ.</p>
                )}
              </div>
            </DetailSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailModal;
