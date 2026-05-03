import { CheckCircle2, Edit, Eye, Loader2, Trash2, XCircle } from "lucide-react";
import {
  actionButtonClass,
  formatDateRange,
  leaveTypeLabel,
  statusLabel,
} from "./shared";

const StatusBadge = ({ statusKey, statusText }) => {
  const cls = (() => {
    switch (statusKey) {
      case "APPROVED":
        return "border border-green-200 bg-green-50 text-green-700";
      case "PENDING":
        return "border border-yellow-200 bg-yellow-50 text-yellow-700";
      case "CANCELLED":
      case "REJECTED":
        return "border border-red-200 bg-red-50 text-red-700";
      default:
        return "border border-gray-200 bg-gray-50 text-gray-700";
    }
  })();

  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {statusText}
    </span>
  );
};

const LeaveActionButtons = ({
  leave,
  row,
  mode,
  openLeaveDetailModal,
  openEditLeaveModal,
  handleApprove,
  handleReject,
  handleDelete,
  compact = false,
}) => (
  <div className={`flex items-center ${compact ? "justify-start" : "justify-center"} gap-1.5`}>
    <button
      type="button"
      onClick={() => openLeaveDetailModal(leave._id)}
      className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
      title="Xem chi tiết"
    >
      <Eye size={14} />
    </button>

    {mode === "approvals" && row.canApprove && (
      <button
        type="button"
        onClick={() => handleApprove(leave)}
        className={`${actionButtonClass} border-green-200 text-green-600 hover:bg-green-50`}
        title={row.approvalContext.title}
      >
        <CheckCircle2 size={14} />
      </button>
    )}

    {mode === "approvals" && (
      <button
        type="button"
        disabled={!row.canApprove}
        onClick={() => handleReject(leave)}
        className={`${actionButtonClass} border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300`}
        title="Từ chối"
      >
        <XCircle size={14} />
      </button>
    )}

    {mode === "mine" && row.canEdit && (
      <button
        type="button"
        onClick={() => openEditLeaveModal(leave)}
        className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
        title="Sửa đơn nghỉ"
      >
        <Edit size={14} />
      </button>
    )}

    {mode === "mine" && row.canDelete && (
      <button
        type="button"
        onClick={() => handleDelete(leave._id)}
        className={`${actionButtonClass} border-gray-200 text-gray-700 hover:bg-gray-50`}
        title="Xóa đơn nghỉ"
      >
        <Trash2 size={14} />
      </button>
    )}
  </div>
);

const LeaveTable = ({
  loading,
  leaves,
  mode,
  getRowState,
  openLeaveDetailModal,
  openEditLeaveModal,
  handleApprove,
  handleReject,
  handleDelete,
}) => {
  const colSpanCount = 5;

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-48 items-center justify-center text-gray-500">
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Đang tải dữ liệu...
          </span>
        </div>
      </div>
    );
  }

  if (leaves.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-48 items-center justify-center px-4 text-center text-gray-500">
          Không có đơn nghỉ nào
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 p-3 sm:hidden">
        {leaves.map((leave) => {
          const row = getRowState(leave);
          return (
            <article key={leave._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {leave.employeeId?.fullName || "--"}
                  </p>
                  <p className="text-xs text-gray-500">{leave.employeeId?.employeeCode || ""}</p>
                </div>
                <StatusBadge
                  statusKey={row.displayStatus}
                  statusText={statusLabel[row.displayStatus] || row.displayStatus}
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Loại nghỉ</span>
                  <span className="text-right text-gray-700">
                    {leaveTypeLabel[leave.leaveType] || leave.leaveType || "--"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Thời gian</span>
                  <span className="text-right text-gray-700">
                    {formatDateRange(leave.fromDate, leave.toDate)}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <LeaveActionButtons
                  leave={leave}
                  row={row}
                  mode={mode}
                  openLeaveDetailModal={openLeaveDetailModal}
                  openEditLeaveModal={openEditLeaveModal}
                  handleApprove={handleApprove}
                  handleReject={handleReject}
                  handleDelete={handleDelete}
                  compact
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden min-h-0 flex-1 overflow-auto sm:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 border-b bg-white text-xs font-semibold uppercase text-gray-500">
            <tr>
              <th className="w-[144px] px-2.5 py-3">Nhân sự</th>
              <th className="w-[120px] px-2.5 py-3">Loại nghỉ</th>
              <th className="w-[156px] px-2.5 py-3">Xin nghỉ ngày</th>
              <th className="w-[110px] px-2.5 py-3">Trạng thái</th>
              <th className="w-[152px] px-2.5 py-3 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {leaves.map((leave) => {
              const row = getRowState(leave);

              return (
                <tr key={leave._id} className="align-top hover:bg-blue-50/30">
                  <td className="px-2.5 py-3">
                    <p className="font-semibold text-gray-800">
                      {leave.employeeId?.fullName || "--"}
                    </p>
                    <p className="text-xs text-gray-500">{leave.employeeId?.employeeCode || ""}</p>
                  </td>

                  <td className="px-2.5 py-3 text-gray-700">
                    {leaveTypeLabel[leave.leaveType] || leave.leaveType || "--"}
                  </td>

                  <td className="whitespace-nowrap px-2.5 py-3 text-gray-700">
                    {formatDateRange(leave.fromDate, leave.toDate)}
                  </td>

                  <td className="px-2.5 py-3 align-middle">
                    <StatusBadge
                      statusKey={row.displayStatus}
                      statusText={statusLabel[row.displayStatus] || row.displayStatus}
                    />
                  </td>

                  <td className="px-2.5 py-3 align-middle">
                    <LeaveActionButtons
                      leave={leave}
                      row={row}
                      mode={mode}
                      openLeaveDetailModal={openLeaveDetailModal}
                      openEditLeaveModal={openEditLeaveModal}
                      handleApprove={handleApprove}
                      handleReject={handleReject}
                      handleDelete={handleDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveTable;
