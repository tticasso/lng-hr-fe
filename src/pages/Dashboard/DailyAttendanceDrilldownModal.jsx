import { memo } from "react";
import { X } from "lucide-react";

const getEmployeeName = (record) => record?.employee?.fullName || "Chưa có tên";
const getEmployeeCode = (record) => record?.employee?.employeeCode || "--";
const getDepartmentName = (record) => record?.employee?.department?.name || "--";
const getTeamName = (record) => record?.employee?.team?.name || "--";

const DailyAttendanceDrilldownModal = memo(({
  isOpen,
  title,
  subtitle,
  records = [],
  pagination,
  loading = false,
  onClose,
  onPageChange,
}) => {
  if (!isOpen) return null;

  const showPagination = pagination && pagination.totalPages > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-auto p-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">
              Đang tải danh sách...
            </div>
          ) : records.length > 0 ? (
            <div className="overflow-hidden rounded-md border border-gray-100">
              <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Nhân viên</th>
                    <th className="px-4 py-3">Phòng ban</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">Check-out</th>
                    <th className="px-4 py-3">Đi muộn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {records.map((record) => (
                    <tr key={record.id || record.employee?.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{getEmployeeName(record)}</p>
                        <p className="mt-1 text-xs text-gray-500">{getEmployeeCode(record)}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{getDepartmentName(record)}</td>
                      <td className="px-4 py-3 text-gray-600">{getTeamName(record)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                          {record.status || "--"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{record.checkIn || "--"}</td>
                      <td className="px-4 py-3 text-gray-600">{record.checkOut || "--"}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {record.lateMinutes ? `${record.lateMinutes} phút` : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              Không có dữ liệu.
            </div>
          )}
        </div>

        {showPagination && (
          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-600">
            <span>
              Trang {pagination.page}/{pagination.totalPages} · Tổng {pagination.totalRecords}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => onPageChange?.(pagination.page - 1)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => onPageChange?.(pagination.page + 1)}
                className="rounded-md border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

DailyAttendanceDrilldownModal.displayName = "DailyAttendanceDrilldownModal";

export default DailyAttendanceDrilldownModal;
