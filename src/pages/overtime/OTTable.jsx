import { CheckCircle2, Edit, Eye, Loader2, Trash2, XCircle } from "lucide-react";
import { actionButtonClass, formatDate, otTypeLabel, statusLabel } from "./shared";

const StatusBadge = ({ status }) => {
  const cls = (() => {
    switch (status) {
      case "APPROVED":
        return "border border-green-200 bg-green-50 text-green-700";
      case "PENDING":
        return "border border-yellow-200 bg-yellow-50 text-yellow-700";
      case "REJECTED":
      case "CANCELLED":
        return "border border-red-200 bg-red-50 text-red-700";
      default:
        return "border border-gray-200 bg-gray-50 text-gray-700";
    }
  })();

  return (
    <span
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      {statusLabel[status] || status}
    </span>
  );
};

const OTActionButtons = ({
  ot,
  row,
  mode,
  openOTDetailModal,
  openApproveOTModal,
  handleRejectOT,
  openEditOTModal,
  handleDeleteOT,
  compact = false,
}) => (
  <div className={`flex items-center ${compact ? "justify-start" : "justify-center"} gap-1.5`}>
    <button
      type="button"
      onClick={() => openOTDetailModal(ot)}
      className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
      title="Chi tiết đơn OT"
    >
      <Eye size={14} />
    </button>

    {mode === "approvals" && (
      <>
        <button
          type="button"
          disabled={!row.canApproveOT}
          onClick={() => openApproveOTModal(ot)}
          className={`${actionButtonClass} border-green-200 text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300`}
          title={row.ownOT ? "Không thể tự duyệt đơn của chính mình" : "Duyệt OT"}
        >
          <CheckCircle2 size={14} />
        </button>
        <button
          type="button"
          disabled={!row.canRejectOT || !row.canApproveOT}
          onClick={() => handleRejectOT(ot)}
          className={`${actionButtonClass} border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300`}
          title={row.ownOT ? "Không thể tự từ chối đơn của chính mình" : "Từ chối OT"}
        >
          <XCircle size={14} />
        </button>
      </>
    )}

    {mode === "mine" && row.canEditOT && (
      <button
        type="button"
        onClick={() => openEditOTModal(ot)}
        className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
        title="Sửa đơn OT"
      >
        <Edit size={14} />
      </button>
    )}

    {mode === "mine" && row.canDeleteOT && (
      <button
        type="button"
        onClick={() => handleDeleteOT(ot._id)}
        className={`${actionButtonClass} border-gray-200 text-gray-700 hover:bg-gray-50`}
        title="Xóa đơn OT"
      >
        <Trash2 size={14} />
      </button>
    )}
  </div>
);

const OTTable = ({
  loading,
  ots,
  mode,
  getRowState,
  openOTDetailModal,
  openApproveOTModal,
  handleRejectOT,
  openEditOTModal,
  handleDeleteOT,
}) => {
  const colSpanCount = 6;

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

  if (ots.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-48 items-center justify-center px-4 text-center text-gray-500">
          Không có đơn OT nào
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 p-3 sm:hidden">
        {ots.map((ot) => {
          const row = getRowState(ot);
          return (
            <article
              key={ot?._id || `${ot?.employeeId?._id}-${ot?.date}-${ot?.startTime}`}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {ot?.employeeId?.fullName || "--"}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(ot?.date)}</p>
                </div>
                <StatusBadge status={row.status} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Loại OT</span>
                  <span className="text-right text-gray-700">
                    {otTypeLabel[ot?.otType] || ot?.otType || "--"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Khung giờ</span>
                  <span className="text-right text-gray-700">
                    {ot?.startTime && ot?.endTime ? `${ot.startTime} - ${ot.endTime}` : "--"}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <OTActionButtons
                  ot={ot}
                  row={row}
                  mode={mode}
                  openOTDetailModal={openOTDetailModal}
                  openApproveOTModal={openApproveOTModal}
                  handleRejectOT={handleRejectOT}
                  openEditOTModal={openEditOTModal}
                  handleDeleteOT={handleDeleteOT}
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
              <th className="w-[136px] px-2 py-2.5">Nhân sự</th>
              <th className="w-[92px] px-2 py-2.5">Ngày OT</th>
              <th className="w-[108px] px-2 py-2.5">Loại OT</th>
              <th className="w-[124px] px-2 py-2.5">Giờ đăng ký</th>
              <th className="w-[104px] px-2 py-2.5">Trạng thái</th>
              <th className="w-[144px] px-2 py-2.5 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {ots.map((ot) => {
              const row = getRowState(ot);
              return (
                <tr
                  key={ot?._id || `${ot?.employeeId?._id}-${ot?.date}-${ot?.startTime}`}
                  className="align-top hover:bg-blue-50/30"
                >
                  <td className="px-2 py-2.5">
                    <p className="font-semibold text-gray-800">{ot?.employeeId?.fullName || "--"}</p>
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-gray-700">{formatDate(ot?.date)}</td>
                  <td className="px-2 py-2.5 text-gray-700">
                    {otTypeLabel[ot?.otType] || ot?.otType || "--"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-gray-700">
                    {ot?.startTime && ot?.endTime ? `${ot.startTime} - ${ot.endTime}` : "--"}
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-2 py-2.5 align-middle">
                    <OTActionButtons
                      ot={ot}
                      row={row}
                      mode={mode}
                      openOTDetailModal={openOTDetailModal}
                      openApproveOTModal={openApproveOTModal}
                      handleRejectOT={handleRejectOT}
                      openEditOTModal={openEditOTModal}
                      handleDeleteOT={handleDeleteOT}
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

export default OTTable;
