import {
  Clock,
  HelpCircle,
  Edit,
  Info,
  X,
} from "lucide-react";

import { formatStandardWorkday, getPayrollWorkDays } from "./attendanceUtils";

const SOURCE_META = {
  WEB_APP: {
    label: "Web",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  MOBILE_APP: {
    label: "Mobile",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  MACHINE: {
    label: "Máy chấm công",
    className: "border-gray-200 bg-gray-50 text-gray-700",
  },
  IMPORT_EXCEL: {
    label: "Excel",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  SYSTEM_SYNC: {
    label: "Hệ thống",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },
  MANUAL: {
    label: "Sửa tay",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  AUTO_DETECT: {
    label: "Tự động",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

const getSourceMeta = (source) => (
  SOURCE_META[source] || {
    label: source || "--",
    className: "border-gray-200 bg-gray-50 text-gray-500",
  }
);

const getWorkValue = (log) =>
  log?.payrollWorkDayValue ??
  log?.payableWorkDayValue ??
  log?.effectiveWorkDayValue ??
  log?.workValue ??
  log?.workvalue ??
  log?.work_value ??
  log?.workDayValue ??
  log?.dayWorkValue ??
  log?.workdayValue;

const formatWorkValue = (log) => {
  const value = getWorkValue(log);
  if (value === undefined || value === null || value === "") return "--";

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(2) : String(value);
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const sumFinalOTHours = (finalOtHours) => {
  if (!finalOtHours || typeof finalOtHours !== "object") return 0;
  return Object.values(finalOtHours).reduce((sum, hours) => sum + toNumber(hours), 0);
};

const getApprovedOTHours = (overtimeId) => {
  if (!Array.isArray(overtimeId)) return 0;
  return overtimeId.reduce((sum, ot) => sum + toNumber(ot.approvedHours), 0);
};

const formatLeaveDays = (value) => (
  Number.isInteger(value) ? String(value) : value.toFixed(2)
);

const buildDetailSummary = (selectedEmployee, employeeDetail) => {
  if (!Array.isArray(employeeDetail) || employeeDetail.length === 0) {
    return {
      totalWorkDays: getPayrollWorkDays(selectedEmployee),
      totalOTHours: toNumber(selectedEmployee.totalOTHours),
      paidLeaveDays: toNumber(
        selectedEmployee.paidLeaveDays ?? selectedEmployee.totalLeaveDays,
      ),
      lateCount: toNumber(selectedEmployee.lateCount),
    };
  }

  return employeeDetail.reduce(
    (summary, log) => {
      const finalOTHours = sumFinalOTHours(log.finalOtHours);
      const workValue = toNumber(getWorkValue(log));

      summary.totalWorkDays += workValue;
      summary.totalOTHours += finalOTHours || getApprovedOTHours(log.overtimeId);
      summary.paidLeaveDays += log.status === "PAID_LEAVE"
        ? workValue || 1
        : 0;
      summary.lateCount += toNumber(log.lateMinutes) > 0 ? 1 : 0;

      return summary;
    },
    {
      totalWorkDays: 0,
      totalOTHours: 0,
      paidLeaveDays: 0,
      lateCount: 0,
    },
  );
};

const AttendanceDetailDrawer = ({
  selectedEmployee,
  loadingDetail,
  employeeDetail,
  openOTDetailId,
  setOpenOTDetailId,
  onClose,
  onOpenEditModal,
  otTypeLabels,
}) => {
  if (!selectedEmployee) return null;

  const detailSummary = buildDetailSummary(
    selectedEmployee,
    loadingDetail ? null : employeeDetail,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="animate-in slide-in-from-right flex h-full w-full max-w-full flex-col bg-white shadow-2xl duration-300 sm:max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xl font-bold text-white shadow-md">
              {selectedEmployee.fullName?.substring(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {selectedEmployee.fullName || "--"}
              </h2>
              <p className="font-mono text-sm text-gray-500">
                {selectedEmployee.employeeCode || "--"} •{" "}
                {selectedEmployee.department || "--"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-gray-100 sm:grid-cols-5">
          <div className="border-r border-gray-100 p-4 text-center">
            <p className="text-xs uppercase text-gray-500">Công tính lương</p>
            <p className="text-xl font-bold text-blue-600">
              {detailSummary.totalWorkDays.toFixed(2)}
            </p>
          </div>
          <div className="border-r border-gray-100 p-4 text-center">
            <p className="text-xs uppercase text-gray-500">Công chuẩn</p>
            <p className="text-xl font-bold text-blue-600">
              {formatStandardWorkday(selectedEmployee)}
            </p>
          </div>
          <div className="border-r border-gray-100 p-4 text-center">
            <p className="text-xs uppercase text-gray-500">Giờ OT</p>
            <p className="text-xl font-bold text-orange-600">
              {detailSummary.totalOTHours.toFixed(2)}
            </p>
          </div>
          <div className="border-r border-gray-100 p-4 text-center">
            <p className="text-xs uppercase text-gray-500">Nghỉ phép</p>
            <p className="text-xl font-bold text-purple-600">
              {formatLeaveDays(detailSummary.paidLeaveDays)}
            </p>
          </div>
          <div className="p-4 text-center">
            <p className="text-xs uppercase text-gray-500">Đi muộn</p>
            <p className="text-xl font-bold text-red-600">
              {detailSummary.lateCount}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0">
          {loadingDetail ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">
                  Đang tải chi tiết chấm công...
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-left text-sm">
                <thead className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-sm">
                  <tr>
                    <th className="p-4 font-medium text-gray-500">Ngày</th>
                    <th className="p-4 text-center font-medium text-gray-500">
                      Công tính lương
                    </th>
                    <th className="p-4 text-center font-medium text-gray-500">Vào</th>
                    <th className="p-4 text-center font-medium text-gray-500">Ra</th>
                    <th className="p-4 text-center font-medium text-gray-500">Nguồn</th>
                    <th className="p-4 text-center font-medium text-gray-500">
                      OT (h)
                    </th>
                    <th className="p-4 font-medium text-gray-500">Trạng thái</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employeeDetail && employeeDetail.length > 0 ? (
                    employeeDetail.map((log, idx) => {
                      const formattedDate = new Date(log.date).toLocaleDateString(
                        "vi-VN",
                      );
                      const totalOTHours =
                        log.overtimeId && Array.isArray(log.overtimeId)
                          ? log.overtimeId.reduce(
                              (sum, ot) => sum + (ot.approvedHours || 0),
                              0,
                            )
                          : 0;
                      const sourceMeta = getSourceMeta(log.source);

                      let statusBadge;
                      if (
                        (log.status === "UNPAID_LEAVE" ||
                          log.status === "PAID_LEAVE") &&
                        log.leaveId?.status === "APPROVED"
                      ) {
                        const statusColor =
                          log.status === "PAID_LEAVE" ? "purple" : "orange";
                        const statusText =
                          log.status === "PAID_LEAVE"
                            ? "Nghỉ có lương"
                            : "Nghỉ không lương";

                        statusBadge = (
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-bold bg-${statusColor}-100 text-${statusColor}-700`}
                          >
                            {statusText}
                          </span>
                        );
                      } else if (log.status === "HOLIDAY") {
                        statusBadge = (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            Nghỉ lễ có công
                          </span>
                        );
                      } else if (!log.checkOut) {
                        statusBadge = (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                            Thiếu ra
                          </span>
                        );
                      } else if (log.lateMinutes > 0) {
                        statusBadge = (
                          <span className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700">
                            Muộn {log.lateMinutes}p
                          </span>
                        );
                      } else if (log.status === "LEAVE") {
                        statusBadge = (
                          <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                            Nghỉ phép
                          </span>
                        );
                      } else if (log.status === "ABSENT") {
                        statusBadge = (
                          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                            Vắng
                          </span>
                        );
                      } else {
                        statusBadge = (
                          <span className="text-xs font-medium text-green-600">
                            Bình thường
                          </span>
                        );
                      }

                      return (
                        <tr key={log._id || idx} className="group hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-800">
                            {formattedDate}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-blue-600">
                            {formatWorkValue(log)}
                          </td>
                          <td className="p-4 text-center font-mono text-gray-600">
                            <div>{log.checkIn || "--:--"}</div>
                            {log.checkInIp && (
                              <div className="mt-1 text-[11px] font-medium text-gray-400">
                                IP: {log.checkInIp}
                              </div>
                            )}
                          </td>
                          <td
                            className={`p-4 text-center font-mono font-bold ${
                              !log.checkOut ? "text-red-500" : "text-gray-600"
                            }`}
                          >
                            <div>{log.checkOut || "--:--"}</div>
                            {log.checkOutIp && (
                              <div className="mt-1 text-[11px] font-medium text-gray-400">
                                IP: {log.checkOutIp}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <span
                                title={log.networkNotes || `Source: ${log.source || "--"}`}
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${sourceMeta.className}`}
                              >
                                {sourceMeta.label}
                              </span>
                              {log.networkNotes && (
                                <Info
                                  size={14}
                                  className="text-gray-400"
                                  title={log.networkNotes}
                                />
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {totalOTHours > 0 ? (
                              <div className="relative inline-flex items-center justify-center gap-1.5">
                                <span className="font-mono font-bold text-orange-600">
                                  {totalOTHours.toFixed(2)}
                                </span>
                                {log.finalOtHours &&
                                  Object.values(log.finalOtHours).some(
                                    (h) => h > 0,
                                  ) && (
                                    <div data-ot-popover className="relative">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const key = `log-${log._id || idx}`;
                                          setOpenOTDetailId(
                                            openOTDetailId === key ? null : key,
                                          );
                                        }}
                                        className="p-0.5 text-gray-400 transition-colors hover:text-orange-600"
                                        title="Xem chi tiết OT"
                                      >
                                        <HelpCircle size={14} />
                                      </button>
                                      {openOTDetailId === `log-${log._id || idx}` && (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-xl"
                                        >
                                          <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                                            <span className="text-xs font-bold uppercase text-gray-700">
                                              Chi tiết OT
                                            </span>
                                            <span className="text-xs font-bold text-orange-600">
                                              {totalOTHours.toFixed(2)}h
                                            </span>
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            {Object.entries(log.finalOtHours)
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
                                          {log.overtimeId &&
                                            log.overtimeId.length > 0 && (
                                              <div className="mt-2 space-y-1 border-t border-gray-100 pt-2">
                                                <p className="text-[11px] font-bold text-gray-600">
                                                  Khung giờ OT:
                                                </p>
                                                {log.overtimeId.map((ot, i) => (
                                                  <div
                                                    key={ot._id || i}
                                                    className="text-center font-mono text-[11px] font-bold text-orange-600"
                                                  >
                                                    {ot.approvedStartTime} -{" "}
                                                    {ot.approvedEndTime}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>
                            ) : (
                              <span className="font-mono font-bold text-gray-400">
                                --
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            {statusBadge}
                            {log.deductedBlocks > 0 && (
                              <span className="ml-2 text-xs text-red-500">
                                (-{log.deductedBlocks} block)
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => onOpenEditModal(log)}
                              className="rounded p-1.5 text-blue-600 transition hover:bg-blue-100"
                              title="Sửa công"
                            >
                              <Edit size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-400">
                        <Clock size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Không có dữ liệu chấm công</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailDrawer;
