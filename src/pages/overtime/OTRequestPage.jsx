import { Loader2, Plus, RefreshCw } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import OTDetailModal from "../../components/modals/OTDetailModal";
import ApproveOTModal from "../../components/modals/ApproveOTModal";
import ModalOT from "../../components/modals/OTModal";
import { buildPageList } from "./shared";
import OTFilters from "./OTFilters";
import OTTable from "./OTTable";
import { useOvertimeRequests } from "./useOvertimeRequests";

const OTRequestPage = ({ mode, title, description }) => {
  const {
    loading,
    filters,
    setFilters,
    ots,
    pendingCount,
    pagination,
    setPagination,
    totalPages,
    refresh,
    getRowState,
    otDetailModal,
    openOTDetailModal,
    closeOTDetailModal,
    approveOTModal,
    openApproveOTModal,
    closeApproveOTModal,
    handleApproveOT,
    handleRejectOT,
    otFormModal,
    openCreateOTModal,
    openEditOTModal,
    closeOTFormModal,
    handleSubmitOTForm,
    handleDeleteOT,
  } = useOvertimeRequests({ mode });

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3 overflow-hidden lg:gap-4">
      <div className="flex shrink-0 flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-gray-800 sm:text-[2rem]">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
          <p className="mt-1 text-xs text-gray-400">
            Đang chờ duyệt: <span className="font-semibold text-red-600">{pendingCount}</span>
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {mode === "mine" && (
            <Button className="flex w-full items-center gap-2 sm:w-auto" onClick={openCreateOTModal}>
              <Plus size={16} />
              Tạo đơn OT
            </Button>
          )}

          <Button variant="secondary" className="flex w-full items-center gap-2 sm:w-auto" onClick={refresh}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Làm mới
          </Button>
        </div>
      </div>

      <Card className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden border border-gray-200 p-0">
        <OTFilters filters={filters} setFilters={setFilters} />

        <OTTable
          loading={loading}
          ots={ots}
          mode={mode}
          getRowState={getRowState}
          openOTDetailModal={openOTDetailModal}
          openApproveOTModal={openApproveOTModal}
          handleRejectOT={handleRejectOT}
          openEditOTModal={openEditOTModal}
          handleDeleteOT={handleDeleteOT}
        />

        <div className="flex flex-col gap-2 border-t bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
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

      {otFormModal.isOpen && (
        <ModalOT
          open={otFormModal.isOpen}
          onClose={closeOTFormModal}
          onSubmit={handleSubmitOTForm}
          initialValues={otFormModal.ot}
          title={otFormModal.mode === "edit" ? "Sửa đơn OT" : "Tạo đơn OT"}
          submitLabel={otFormModal.mode === "edit" ? "Cập nhật" : "Gửi đơn"}
        />
      )}

      <OTDetailModal
        isOpen={otDetailModal.isOpen}
        onClose={closeOTDetailModal}
        otData={otDetailModal.otData}
      />

      <ApproveOTModal
        isOpen={approveOTModal.isOpen}
        onClose={closeApproveOTModal}
        otData={approveOTModal.otData}
        onConfirm={handleApproveOT}
      />
    </div>
  );
};

export default OTRequestPage;
