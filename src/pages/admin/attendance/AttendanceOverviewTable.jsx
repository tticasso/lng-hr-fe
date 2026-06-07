import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";

import DataTableShell from "../../../components/shared/DataTableShell";
import { formatEmployeeCode } from "../../../utils/employeeDisplay";
import {
  formatStandardWorkday,
  formatWorkdayValue,
  getPaidHolidayWorkDays,
  getPayrollWorkDays,
} from "./attendanceUtils";

const AttendanceOverviewTable = ({
  filtersNode,
  loading,
  employees,
  pagination,
  onPageChange,
  selectedEmployee,
  onEmployeeClick,
  openOTDetailId,
  setOpenOTDetailId,
  otTypeLabels,
}) => {
  const page = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || employees.length;
  const startIndex = pagination?.startIndex || 0;

  const mobileContent = (
    <div className="space-y-3">
      {employees.map((emp, index) => {
        const avatar = emp.fullName?.substring(0, 2).toUpperCase() || "??";
        const payrollWorkDays = getPayrollWorkDays(emp);
        const paidHolidayWorkDays = getPaidHolidayWorkDays(emp);

        return (
          <article
            key={emp.employeeId || emp._id || index}
            onClick={() => onEmployeeClick(emp)}
            className={`rounded-xl border p-4 shadow-sm ${
              emp.hasError || payrollWorkDays === 0
                ? "border-red-200 bg-red-50/60"
                : "border-gray-200 bg-white"
            } ${
              selectedEmployee?.employeeId === emp.employeeId
                ? "ring-2 ring-blue-200"
                : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-sm">
                  {avatar}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-800">
                    {emp.fullName || "--"}
                  </p>
                  <p className="text-xs text-gray-500">{formatEmployeeCode(emp.employeeCode)}</p>
                  <p className="text-xs text-gray-500">{emp.department || "--"}</p>
                </div>
              </div>
              {emp.hasError || payrollWorkDays === 0 ? (
                <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                  <AlertCircle size={12} /> Error
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                  <CheckCircle2 size={12} /> Valid
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase text-gray-400">Công tính lương</p>
                <p className="font-semibold text-gray-700">
                  {formatWorkdayValue(payrollWorkDays)}
                </p>
                {paidHolidayWorkDays > 0 && (
                  <p className="text-xs text-emerald-600">
                    +{formatWorkdayValue(paidHolidayWorkDays)} lễ
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Công chuẩn</p>
                <p className="font-semibold text-blue-600">
                  {formatStandardWorkday(emp)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">OT</p>
                <p className="font-semibold text-orange-600">
                  {emp.totalOTHours?.toFixed(2) || 0}h
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Nghỉ phép</p>
                <p className="font-semibold text-purple-600">{emp.paidLeaveDays || 0}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400">Đi muộn</p>
                <p className="font-semibold text-red-600">{emp.lateCount || 0}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );

  const desktopContent = (
    <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
      <thead className="sticky top-0 z-10 border-b border-gray-200 bg-white text-xs font-bold uppercase text-gray-500 shadow-sm">
        <tr>
          <th className="w-14 p-4 text-center">STT</th>
          <th className="p-4">Nhân viên</th>
          <th className="p-4">Phòng ban</th>
          <th className="p-4 text-center">Công tính lương</th>
          <th className="p-4 text-center">Công chuẩn</th>
          <th className="p-4 text-center">OT (Giờ)</th>
          <th className="p-4 text-center">Nghỉ phép</th>
          <th className="p-4 text-center">Đi muộn</th>
          <th className="p-4 text-center">Trạng thái</th>
          <th className="w-10 p-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 bg-white">
        {employees.map((emp, index) => {
          const avatar = emp.fullName?.substring(0, 2).toUpperCase() || "??";
          const payrollWorkDays = getPayrollWorkDays(emp);
          const paidHolidayWorkDays = getPaidHolidayWorkDays(emp);

          return (
            <tr
              key={emp.employeeId || emp._id || index}
              onClick={() => onEmployeeClick(emp)}
              className={`group cursor-pointer transition-colors ${
                emp.hasError ? "bg-red-50/60 hover:bg-red-100/50" : "hover:bg-blue-50/50"
              } ${selectedEmployee?.employeeId === emp.employeeId ? "bg-blue-50" : ""}`}
            >
              <td className="p-4 text-center font-mono text-xs text-gray-400">
                {startIndex + index + 1}
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-bold text-white shadow-sm">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{emp.fullName || "--"}</p>
                    <p className="font-mono text-xs text-gray-500">
                      {formatEmployeeCode(emp.employeeCode)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-gray-600">{emp.department || "--"}</td>
              <td className="p-4 text-center font-medium">
                <div>{formatWorkdayValue(payrollWorkDays)}</div>
                {paidHolidayWorkDays > 0 && (
                  <div className="text-xs font-normal text-emerald-600">
                    +{formatWorkdayValue(paidHolidayWorkDays)} lễ
                  </div>
                )}
              </td>
              <td className="p-4 text-center font-medium text-blue-600">
                {formatStandardWorkday(emp)}
              </td>
              <td className="p-4 text-center">
                <div className="relative inline-flex items-center justify-center gap-1.5">
                  <span className="font-bold text-orange-600">
                    {emp.totalOTHours?.toFixed(2) || 0}h
                  </span>
                  {emp.otHours &&
                    Object.values(emp.otHours).some((h) => h > 0) && (
                      <div data-ot-popover className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenOTDetailId(
                              openOTDetailId === emp.employeeId ? null : emp.employeeId,
                            );
                          }}
                          className="p-0.5 text-gray-400 transition-colors hover:text-orange-600"
                          title="Xem chi tiết OT"
                        >
                          <HelpCircle size={14} />
                        </button>
                        {openOTDetailId === emp.employeeId && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-xl"
                          >
                            <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="text-xs font-bold uppercase text-gray-700">
                                Chi tiết OT
                              </span>
                              <span className="text-xs font-bold text-orange-600">
                                {emp.totalOTHours?.toFixed(2) || 0}h
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              {Object.entries(emp.otHours)
                                .filter(([, h]) => h > 0)
                                .map(([key, hours]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between text-xs"
                                  >
                                    <span className="text-gray-600">
                                      {otTypeLabels[key] || key}
                                    </span>
                                    <span className="font-mono font-bold text-orange-600">
                                      {Number(hours).toFixed(2)}h
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </td>
              <td className="p-4 text-center font-medium text-purple-600">
                {emp.paidLeaveDays || 0}
              </td>
              <td className="p-4 text-center font-medium text-red-600">
                {emp.lateCount || 0}
              </td>
              <td className="p-4 text-center">
                {emp.hasError || payrollWorkDays === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                    <AlertCircle size={12} /> Error
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded border border-green-200 bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                    <CheckCircle2 size={12} /> Valid
                  </span>
                )}
              </td>
              <td className="p-4 text-center">
                <MoreHorizontal
                  size={16}
                  className="text-gray-400 group-hover:text-blue-500"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const footer = totalPages > 1 ? (
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
      <div>
        Hiển thị{" "}
        <strong>
          {employees.length > 0 ? startIndex + 1 : 0}-
          {Math.min(startIndex + employees.length, total)}
        </strong>{" "}
        trong tổng số <strong>{total}</strong> nhân viên
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(page - 1)}
          disabled={page === 1}
          className="rounded-md border border-gray-300 p-2 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-24 text-center font-medium">
          Trang {page}/{totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange?.(page + 1)}
          disabled={page === totalPages}
          className="rounded-md border border-gray-300 p-2 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  ) : null;

  return (
    <DataTableShell
      filters={filtersNode}
      loading={loading}
      isEmpty={employees.length === 0}
      loadingLabel="Đang tải dữ liệu chấm công..."
      emptyTitle="Không tìm thấy nhân viên phù hợp"
      emptyDescription="Thử thay đổi bộ lọc hoặc tìm kiếm"
      mobileContent={mobileContent}
      desktopContent={desktopContent}
      footer={footer}
    />
  );
};

export default AttendanceOverviewTable;
