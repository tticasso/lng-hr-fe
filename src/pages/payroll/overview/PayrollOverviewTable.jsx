import { AlertCircle, Loader2, Send } from "lucide-react";

import DataTableShell from "../../../components/shared/DataTableShell";
import {
  formatHours,
  formatMoney,
  getAllowanceBreakdownItems,
  getOtBreakdownItems,
  getPayrollStatusBadgeClass,
  getPayrollStatusLabel,
} from "./payrollOverviewUtils";

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${getPayrollStatusBadgeClass(
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
        <div key={item.key} className="flex items-center justify-between gap-2">
          <span className="truncate">{item.label}</span>
          <span className="font-mono font-medium text-gray-700">{formatter(item.value)}</span>
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
}) => {
  const loadingLabel = "Đang tải dữ liệu lương...";
  const emptyTitle = "Không có dữ liệu lương";
  const emptyDescription = "Vui lòng chọn tháng khác hoặc thử lại";

  const mobileContent = (
    <div className="space-y-3">
      {rows.map((row) => {
        const isSelected = selectedRows.includes(row._id);
        const otBreakdown = getOtBreakdownItems(row);
        const allowanceBreakdown = getAllowanceBreakdownItems(row);

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
                <p className="mt-1 text-sm text-gray-600">{row.departmentId?.name || "--"}</p>
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
                <BreakdownList items={otBreakdown} formatter={formatHours} />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Phụ cấp</p>
                <p className="font-medium text-green-600">{formatMoney(row.totalAllowance || 0)}</p>
                <BreakdownList items={allowanceBreakdown} formatter={formatMoney} />
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Công chuẩn</p>
                <p className="font-medium text-red-600">
                  {row.actualWorkDays}/{row.standardWorkDays}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
              <div>
                <p className="text-xs uppercase text-gray-400">Thực nhận</p>
                <p className="font-bold text-blue-700">{formatMoney(row.netIncome || 0)}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={row.status} />
                <button
                  type="button"
                  onClick={() => onSendPayrollEmail(row._id)}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                  title="Gửi email phiếu lương"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const desktopContent = (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-10 border-b-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-xs font-bold uppercase tracking-wider text-blue-700">
          <tr>
            <th className="w-12 p-4">
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
            <th className="w-10 p-4">#</th>
            <th className="p-4">Nhân viên</th>
            <th className="p-4">Phòng ban</th>
            <th className="p-4 text-right">Lương cơ bản</th>
            <th className="p-4 text-right">OT</th>
            <th className="p-4 text-right">Phụ cấp</th>
            <th className="p-4 text-right">Công chuẩn</th>
            <th className="bg-blue-100 p-4 text-right">Thực nhận</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="p-4 text-center">Email</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row, index) => {
            const isSelected = selectedRows.includes(row._id);
            const otBreakdown = getOtBreakdownItems(row);
            const allowanceBreakdown = getAllowanceBreakdownItems(row);

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
                  <div>
                    <p className="font-semibold text-gray-900">{row.employeeId?.fullName || "--"}</p>
                    <p className="font-mono text-xs text-gray-500">{row.employeeId?.employeeCode || "--"}</p>
                  </div>
                </td>
                <td className="p-4 text-gray-600">{row.departmentId?.name || "--"}</td>
                <td className="p-4 text-right font-mono text-gray-700">
                  {formatMoney(row.baseSalary || 0)}
                </td>
                <td className="p-4">
                  <div className="text-right font-mono text-orange-600">{formatMoney(row.otPay || 0)}</div>
                  <BreakdownList items={otBreakdown} formatter={formatHours} />
                </td>
                <td className="p-4">
                  <div className="text-right font-mono text-green-600">{formatMoney(row.totalAllowance || 0)}</div>
                  <BreakdownList items={allowanceBreakdown} formatter={formatMoney} />
                </td>
                <td className="p-4 text-right font-mono text-red-600">
                  {row.actualWorkDays}/{row.standardWorkDays}
                </td>
                <td className="bg-blue-50/50 p-4 text-right font-mono text-base font-bold text-blue-700">
                  {formatMoney(row.netIncome || 0)}
                </td>
                <td className="p-4 text-center">
                  <StatusBadge status={row.status} />
                </td>
                <td className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => onSendPayrollEmail(row._id)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    title="Gửi email phiếu lương"
                  >
                    <Send size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
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

  const shell = (
    <DataTableShell
      filters={filtersNode}
      loading={loading}
      isEmpty={rows.length === 0}
      loadingLabel={loadingLabel}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      mobileContent={mobileContent}
      desktopContent={desktopContent}
      className="border-gray-200"
    />
  );

  return footer ? (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-card">
      <div className="[&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">{shell}</div>
      {footer}
    </div>
  ) : (
    shell
  );
};

export default PayrollOverviewTable;
