import { Loader2, Plus, RefreshCw } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import LeaveDetailModal from "../../components/modals/LeaveDetailModal";
import LeaveRequestModal from "../../components/modals/CreateLeaveModal";
import LeaveFilters from "./LeaveFilters";
import LeaveTable from "./LeaveTable";
import { buildPageList } from "./shared";
import { useLeaveRequests } from "./useLeaveRequests";

const LeaveRequestPage = ({ mode, title, description }) => {
  const {
    loading,
    leaveSummary,
    filters,
    setFilters,
    leaves,
    pendingCount,
    pagination,
    setPagination,
    totalPages,
    leaveDetailModal,
    openLeaveDetailModal,
    closeLeaveDetailModal,
    leaveFormModal,
    openCreateLeaveModal,
    openEditLeaveModal,
    closeLeaveFormModal,
    handleSubmitForm,
    refresh,
    getRowState,
    handleApprove,
    handleReject,
    handleDelete,
  } = useLeaveRequests({ mode });

  return (
    <div className="flex min-w-0 flex-col gap-4 overflow-visible sm:h-full sm:min-h-0 sm:overflow-hidden lg:gap-6">
      <div className="flex shrink-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-gray-800 sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <p className="mt-1 text-xs text-gray-400">
            Đang chờ duyệt: <span className="font-semibold text-red-600">{pendingCount}</span>
          </p>
          {mode === "mine" && leaveSummary?.annualLeave && (
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                Phép còn: {leaveSummary.annualLeave.currentBalance ?? 0}
              </span>
              <span className="rounded-full bg-green-50 px-2.5 py-1 font-semibold text-green-700">
                Đã tích: {leaveSummary.annualLeave.totalAccrued ?? 0}
              </span>
              <span className="rounded-full bg-orange-50 px-2.5 py-1 font-semibold text-orange-700">
                Đã dùng: {leaveSummary.annualLeave.totalUsed ?? 0}
              </span>
              <span className="rounded-full bg-gray-50 px-2.5 py-1 font-semibold text-gray-700">
                Không lương: {leaveSummary.otherLeaves?.unpaidUsed ?? 0}
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {mode === "mine" && (
            <Button
              className="h-9 flex-1 gap-1.5 px-2 text-xs sm:h-auto sm:w-auto sm:flex-none sm:gap-2 sm:px-4 sm:text-sm"
              onClick={openCreateLeaveModal}
            >
              <Plus size={16} />
              <span className="sm:hidden">Tạo đơn</span>
              <span className="hidden sm:inline">Tạo đơn nghỉ</span>
            </Button>
          )}

          <Button
            variant="secondary"
            className="h-9 flex-1 gap-1.5 px-2 text-xs sm:h-auto sm:w-auto sm:flex-none sm:gap-2 sm:px-4 sm:text-sm"
            onClick={refresh}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Làm mới
          </Button>
        </div>
      </div>

      <Card className="flex min-w-0 flex-col overflow-visible border border-gray-200 p-0 sm:min-h-0 sm:flex-1 sm:overflow-hidden">
        <LeaveFilters filters={filters} setFilters={setFilters} />

        <LeaveTable
          loading={loading}
          leaves={leaves}
          mode={mode}
          getRowState={getRowState}
          openLeaveDetailModal={openLeaveDetailModal}
          openEditLeaveModal={openEditLeaveModal}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handleDelete={handleDelete}
        />

        <div className="flex flex-col gap-3 border-t bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <p className="text-xs text-gray-500">
            Trang {pagination.page}/{totalPages} • Tổng {pagination.total} đơn
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <select
              className="rounded-lg border px-2 py-1 text-xs outline-none"
              value={pagination.limit}
              onChange={(event) =>
                setPagination((prev) => ({
                  ...prev,
                  page: 1,
                  limit: Number(event.target.value),
                }))
              }
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-md border px-3 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              Trước
            </button>

            {buildPageList(pagination.page, totalPages).map((page, idx) =>
              page === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-sm text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setPagination((prev) => ({ ...prev, page }))}
                  className={`rounded-md border px-3 py-1 text-xs sm:text-sm ${
                    page === pagination.page
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              disabled={pagination.page >= totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-md border px-3 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
            >
              Sau
            </button>
          </div>
        </div>
      </Card>

      {leaveFormModal.isOpen && (
        <LeaveRequestModal
          onClose={closeLeaveFormModal}
          onConfirm={handleSubmitForm}
          initialValues={leaveFormModal.leave}
          title={leaveFormModal.mode === "edit" ? "Sửa đơn nghỉ" : "Tạo đơn nghỉ"}
          submitLabel={leaveFormModal.mode === "edit" ? "Cập nhật" : "Gửi đơn"}
        />
      )}

      <LeaveDetailModal
        isOpen={leaveDetailModal.isOpen}
        leaveId={leaveDetailModal.leaveId}
        onClose={closeLeaveDetailModal}
      />
    </div>
  );
};

export default LeaveRequestPage;
