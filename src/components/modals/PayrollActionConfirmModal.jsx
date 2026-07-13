import { AlertTriangle, Loader2, X } from "lucide-react";

import Button from "../common/Button";
import { formatEmployeeCode } from "../../utils/employeeDisplay";
import {
  formatMoney,
  getPayrollStatusLabel,
} from "../../pages/payroll/overview/payrollOverviewUtils";

const toneClasses = {
  default: {
    icon: "bg-blue-50 text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  },
  danger: {
    icon: "bg-red-50 text-red-600",
    button: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600",
    button: "bg-amber-600 hover:bg-amber-700",
  },
};

const getEmployeeName = (payroll) =>
  payroll?.employeeId?.fullName || payroll?.employeeId?.employeeCode || "Không rõ nhân viên";

const PayrollActionConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel = "Xác nhận",
  tone = "default",
  items = [],
  summary = [],
  warning,
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const classes = toneClasses[tone] || toneClasses.default;
  const visibleItems = items.slice(0, 8);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className={`rounded-lg p-2 ${classes.icon}`}>
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              {description ? <p className="mt-1 text-sm text-gray-500">{description}</p> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            title="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {summary.length ? (
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {summary.map((item) => (
                <div key={item.label} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-medium uppercase text-gray-500">{item.label}</p>
                  <p className="mt-1 font-mono text-lg font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {items.length ? (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[minmax(0,1fr)_110px_120px] gap-3 bg-gray-50 px-4 py-2 text-xs font-bold uppercase text-gray-500">
                <span>Nhân viên</span>
                <span>Trạng thái</span>
                <span className="text-right">Thực nhận</span>
              </div>
              <div className="divide-y divide-gray-100">
                {visibleItems.map((payroll) => (
                  <div
                    key={payroll._id}
                    className="grid grid-cols-[minmax(0,1fr)_110px_120px] gap-3 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{getEmployeeName(payroll)}</p>
                      <p className="truncate text-xs text-gray-500">
                        {formatEmployeeCode(payroll.employeeId?.employeeCode, "--")} - Tháng {payroll.month}/
                        {payroll.year}
                      </p>
                    </div>
                    <span className="text-gray-600">{getPayrollStatusLabel(payroll.status)}</span>
                    <span className="text-right font-mono font-semibold text-gray-900">
                      {formatMoney(payroll.netIncome)}
                    </span>
                  </div>
                ))}
              </div>
              {hiddenCount ? (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-sm text-gray-500">
                  Còn {hiddenCount} phiếu khác.
                </div>
              ) : null}
            </div>
          ) : null}

          {warning ? (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {warning}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 p-5">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`gap-2 text-white ${classes.button}`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PayrollActionConfirmModal;
