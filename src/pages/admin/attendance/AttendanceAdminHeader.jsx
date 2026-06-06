import {
  Download,
  Lock,
  RefreshCcw,
  Unlock,
  Upload,
  UserPlus,
} from "lucide-react";

import Button from "../../../components/common/Button";
import MonthNavigator from "../../../components/common/MonthNavigator";
import PageToolbar from "../../../components/shared/PageToolbar";

const AttendanceAdminHeader = ({
  month,
  year,
  isPeriodLocked,
  onPreviousPeriod,
  onNextPeriod,
  onImport,
  onOpenBulkAttendance,
  onExport,
  onSyncData,
  onSyncHoliday,
  onToggleLock,
  isExportDisabled,
  canWriteAttendance = false,
}) => {
  const meta = isPeriodLocked ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-2 py-1 text-xs text-red-600">
      <Lock size={10} /> Đã khóa sổ
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-2 py-1 text-xs text-green-600">
      <Unlock size={10} /> Đang mở
    </span>
  );

  const actions = (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[240px_repeat(6,minmax(0,1fr))]">
      <MonthNavigator
        month={month}
        year={year}
        onPrevious={onPreviousPeriod}
        onNext={onNextPeriod}
        className="w-full min-w-0"
      />

      {canWriteAttendance && (
        <Button
          variant="secondary"
          className="h-14 min-w-0 gap-2 rounded-xl px-3 text-sm"
          onClick={onImport}
        >
          <Upload size={16} /> Import dữ liệu
        </Button>
      )}

      {canWriteAttendance && (
        <Button
          variant="secondary"
          className="h-14 min-w-0 gap-2 rounded-xl px-3 text-sm"
          onClick={onOpenBulkAttendance}
        >
          <UserPlus size={16} /> Tạo công hàng loạt
        </Button>
      )}

      <Button
        variant="secondary"
        className="h-14 min-w-0 gap-2 rounded-xl px-3 text-sm"
        onClick={onExport}
        disabled={isExportDisabled}
      >
        <Download size={16} /> Xuất Excel
      </Button>

      {canWriteAttendance && (
        <Button
          onClick={onSyncData}
          variant="secondary"
          className="h-14 min-w-0 gap-2 rounded-xl px-3 text-sm"
        >
          <RefreshCcw size={16} /> Đồng bộ dữ liệu
        </Button>
      )}

      {canWriteAttendance && (
        <Button
          onClick={onSyncHoliday}
          variant="secondary"
          className="h-14 min-w-0 gap-2 rounded-xl px-3 text-sm"
        >
          <RefreshCcw size={16} /> Đồng bộ lịch nghỉ
        </Button>
      )}

      {canWriteAttendance && (
        <Button
          className={`h-14 min-w-0 gap-2 rounded-xl px-3 text-sm text-white shadow-md ${
            isPeriodLocked
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={onToggleLock}
        >
          {isPeriodLocked ? <Unlock size={16} /> : <Lock size={16} />}
          {isPeriodLocked ? "Mở khóa sổ" : "Khóa sổ công"}
        </Button>
      )}
    </div>
  );

  return (
    <PageToolbar
      title="Quản trị Chấm công"
      description="Tổng hợp dữ liệu công, tăng ca và nghỉ phép"
      meta={meta}
      actions={actions}
    />
  );
};

export default AttendanceAdminHeader;
