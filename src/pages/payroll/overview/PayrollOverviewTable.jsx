import { AlertCircle, Send } from "lucide-react";

import { RotateCcw } from "lucide-react";
import { CircleDollarSign } from "lucide-react";

import {
  formatMoney,
  getAdjustmentBreakdownItems,
  getAllowanceBreakdownItems,
  getLeaveBreakdownItems,
  getOtPayBreakdownItems,
  getPayrollStatusBadgeClass,
  getPayrollStatusLabel,
} from "./payrollOverviewUtils";

const TableState = ({ label }) => (
  <div className="flex h-64 items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600"></div>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="flex h-64 items-center justify-center">
    <div className="text-center text-gray-400">
      <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
      <p className="text-sm font-medium">{title}</p>
      {description ? <p className="mt-1 text-xs">{description}</p> : null}
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${getPayrollStatusBadgeClass(
      status,
    )}`}
  >
    {getPayrollStatusLabel(status)}
  </span>
);

const BreakdownList = ({ items, formatter }) => {
  if (!items.length) {
    return <p className="mt-1 text-xs text-gray-400">Không có</p>;
  }

  return (
    <div className="mt-1 space-y-1 text-xs text-gray-500">
      {items.map((item) => (
        <div key={item.key} className="flex items-start justify-between gap-2">
          <span className="min-w-0 text-left">
            <span className="block truncate">{item.label}</span>
            {item.formulaText && (
              <span className="block truncate font-mono text-[11px] text-gray-400">
                {item.formulaText}
              </span>
            )}
          </span>
          <span className="shrink-0 font-mono font-medium text-gray-700">
            {formatter(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const PayrollOverviewTable = ({
  filtersNode,
  loading,
  rows,
  selectedRows,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  onSelectRow,
  onSendPayrollEmail,
  onReopenPayroll,
  onManageAdjustments,
}) => {
  const loadingLabel = "Đang tải dữ liệu lương...";
  const emptyTitle = "Không có dữ liệu lương";
  const emptyDescription = "Vui lòng chọn tháng khác hoặc thử lại";

  const mobileContent = (
    <div className="space-y-3">
      {rows.map((row) => {
        const isSelected = selectedRows.includes(row._id);
        const otPayBreakdown = getOtPayBreakdownItems(row);
        const leaveBreakdown = getLeaveBreakdownItems(row);
        const allowanceBreakdown = getAllowanceBreakdownItems(row);
        const adjustmentBreakdown = getAdjustmentBreakdownItems(row);

        return (
          <article
            key={row._id}
            className={`rounded-xl border p-4 shadow-sm ${
              isSelected ? "border-blue-300 bg-blue-50/60" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900">
                  {row.employeeId?.fullName || "--"}
                </p>
                <p className="font-mono text-xs text-gray-500">
                  {row.employeeId?.employeeCode || "--"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelectRow(row._id)}
                className="mt-1 h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase text-gray-400">Lương cơ bản</p>
                <p className="font-medium text-gray-700">{formatMoney(row.baseSalary || 0)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Lương OT</p>
                <p className="font-medium text-orange-600">{formatMoney(row.otPay || 0)}</p>
                <BreakdownList items={otPayBreakdown} formatter={formatMoney} />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Phụ cấp</p>
                <p className="font-medium text-green-600">{formatMoney(row.totalAllowance || 0)}</p>
                <BreakdownList items={allowanceBreakdown} formatter={formatMoney} />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Điều chỉnh</p>
                <p className="font-medium text-purple-600">
                  {formatMoney((row.totalAdjustmentEarnings || 0) - (row.totalAdjustmentDeductions || 0))}
                </p>
                <BreakdownList items={adjustmentBreakdown} formatter={formatMoney} />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Công tính lương / chuẩn</p>
                <p className="font-medium text-red-600">
                  {row.actualWorkDays}/{row.standardWorkDays}
                </p>
                <BreakdownList items={leaveBreakdown} formatter={formatMoney} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase text-gray-400">Thực nhận</p>
                <p className="font-bold text-blue-700">{formatMoney(row.netIncome || 0)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={row.status} />
                <button
                  type="button"
                  onClick={() => onManageAdjustments(row)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                  title="Quản lý điều chỉnh"
                >
                  <CircleDollarSign size={16} />
                  Điều chỉnh
                </button>
                {["FINALIZED", "PAID"].includes(row.status) && (
                  <button
                    type="button"
                    onClick={() => onSendPayrollEmail(row._id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    title="Gửi email phiếu lương"
                  >
                    <Send size={16} />
                    Email
                  </button>
                )}
                {row.status === "FINALIZED" && (
                  <button
                    type="button"
                    onClick={() => onReopenPayroll(row)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                    title="Mở lại về DRAFT"
                  >
                    <RotateCcw size={16} />
                    Mở lại
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const desktopContent = (
      <table className="w-full min-w-[1650px] table-fixed border-collapse text-left text-sm">
        <colgroup>
          <col className="w-12" />
          <col className="w-12" />
          <col className="w-[190px]" />
          <col className="w-[150px]" />
          <col className="w-[210px]" />
          <col className="w-[210px]" />
          <col className="w-[210px]" />
          <col className="w-[170px]" />
          <col className="w-[170px]" />
          <col className="w-[130px]" />
          <col className="w-[150px]" />
        </colgroup>
        <thead className="sticky top-0 z-10 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-xs font-bold uppercase tracking-wider text-blue-700">
          <tr>
            <th className="p-4">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={onSelectAll}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </th>
            <th className="p-4">#</th>
            <th className="p-4">Nhân viên</th>
            <th className="p-4 text-right">Lương cơ bản</th>
            <th className="p-4 text-right">OT</th>
            <th className="p-4 text-right">Phụ cấp</th>
            <th className="p-4 text-right">Điều chỉnh</th>
            <th className="p-4 text-right">Công tính lương / chuẩn</th>
            <th className="bg-blue-100 p-4 text-right">Thực nhận</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="sticky right-0 z-20 border-l border-blue-200 bg-blue-100 p-4 text-center shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.35)]">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, index) => {
            const isSelected = selectedRows.includes(row._id);
            const otPayBreakdown = getOtPayBreakdownItems(row);
            const leaveBreakdown = getLeaveBreakdownItems(row);
            const allowanceBreakdown = getAllowanceBreakdownItems(row);
            const adjustmentBreakdown = getAdjustmentBreakdownItems(row);

            return (
              <tr
                key={row._id}
                className={`group align-top transition-colors hover:bg-blue-50/50 ${
                  isSelected ? "bg-blue-50/50" : ""
                }`}
              >
                <td className="p-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectRow(row._id)}
                      className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                </td>
                <td className="p-4 font-mono text-xs text-gray-500">{index + 1}</td>
                <td className="p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">{row.employeeId?.fullName || "--"}</p>
                    <p className="truncate font-mono text-xs text-gray-500">{row.employeeId?.employeeCode || "--"}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap p-4 text-right font-mono text-gray-700">
                  {formatMoney(row.baseSalary || 0)}
                </td>
                <td className="p-4">
                  <div className="whitespace-nowrap text-right font-mono text-orange-600">{formatMoney(row.otPay || 0)}</div>
                  <BreakdownList items={otPayBreakdown} formatter={formatMoney} />
                </td>
                <td className="p-4">
                  <div className="whitespace-nowrap text-right font-mono text-green-600">{formatMoney(row.totalAllowance || 0)}</div>
                  <BreakdownList items={allowanceBreakdown} formatter={formatMoney} />
                </td>
                <td className="p-4">
                  <div className="whitespace-nowrap text-right font-mono text-purple-600">
                    {formatMoney((row.totalAdjustmentEarnings || 0) - (row.totalAdjustmentDeductions || 0))}
                  </div>
                  <BreakdownList items={adjustmentBreakdown} formatter={formatMoney} />
                </td>
                <td className="p-4 text-right font-mono text-red-600">
                  <div className="whitespace-nowrap">{row.actualWorkDays}/{row.standardWorkDays}</div>
                  <BreakdownList items={leaveBreakdown} formatter={formatMoney} />
                </td>
                <td className="whitespace-nowrap bg-blue-50/50 p-4 text-right font-mono text-base font-bold text-blue-700">
                  {formatMoney(row.netIncome || 0)}
                </td>
                <td className="p-4 text-center">
                  <StatusBadge status={row.status} />
                </td>
                <td className="sticky right-0 border-l border-gray-100 bg-white p-3 text-center shadow-[-8px_0_12px_-12px_rgba(15,23,42,0.28)] group-hover:bg-blue-50">
                  <div className="flex flex-col items-stretch justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onManageAdjustments(row)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-100"
                      title="Quản lý điều chỉnh"
                    >
                      <CircleDollarSign size={16} />
                      Điều chỉnh
                    </button>
                    {["FINALIZED", "PAID"].includes(row.status) && (
                      <button
                        type="button"
                        onClick={() => onSendPayrollEmail(row._id)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        title="Gửi email phiếu lương"
                      >
                        <Send size={16} />
                        Email
                      </button>
                    )}
                    {row.status === "FINALIZED" && (
                      <button
                        type="button"
                        onClick={() => onReopenPayroll(row)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        title="Mở lại về DRAFT"
                      >
                        <RotateCcw size={16} />
                        Mở lại
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
  );

  const footer =
    !loading && rows.length > 0 ? (
      <div className="flex flex-col gap-2 border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
        <div>
          Hiển thị <strong>{rows.length}</strong> bản lương
        </div>
        <div className="text-xs text-gray-500">
          Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
        </div>
      </div>
    ) : null;

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <div className="[&>div]:rounded-none [&>div]:border-b [&>div]:border-gray-200">
        {filtersNode}
      </div>

      <div className="p-3 md:hidden">
        {loading ? (
          <TableState label={loadingLabel} />
        ) : rows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          mobileContent
        )}
      </div>

      <div className="hidden min-h-[360px] max-h-[calc(100dvh-31rem)] overflow-auto md:block">
        {loading ? (
          <TableState label={loadingLabel} />
        ) : rows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          desktopContent
        )}
      </div>

      {footer}
    </section>
  );
};

export default PayrollOverviewTable;
