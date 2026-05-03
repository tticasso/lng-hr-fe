import {
  Download,
  Lock,
  RefreshCcw,
  Unlock,
  Upload,
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
  onExport,
  onSyncData,
  onSyncHoliday,
  onToggleLock,
  isExportDisabled,
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
    <div className="flex w-full min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
      <MonthNavigator
        month={month}
        year={year}
        onPrevious={onPreviousPeriod}
        onNext={onNextPeriod}
        className="w-full xl:w-auto xl:min-w-[300px] xl:flex-none"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:min-w-0 xl:flex-1 xl:flex-nowrap xl:items-center xl:justify-end">
        <Button
          variant="secondary"
          className="h-14 min-w-[168px] gap-2 rounded-xl px-4 text-sm xl:min-w-0 xl:flex-1"
          onClick={onImport}
        >
          <Upload size={16} /> Import dữ liệu
        </Button>

        <Button
          variant="secondary"
          className="h-14 min-w-[160px] gap-2 rounded-xl px-4 text-sm xl:min-w-0 xl:flex-1"
          onClick={onExport}
          disabled={isExportDisabled}
        >
          <Download size={16} /> Xuất Excel
        </Button>

        <Button
          onClick={onSyncData}
          variant="secondary"
          className="h-14 min-w-[192px] gap-2 rounded-xl px-4 text-sm xl:min-w-0 xl:flex-1"
        >
          <RefreshCcw size={16} /> Đồng bộ dữ liệu
        </Button>

        <Button
          onClick={onSyncHoliday}
          variant="secondary"
          className="h-14 min-w-[192px] gap-2 rounded-xl px-4 text-sm xl:min-w-0 xl:flex-1"
        >
          <RefreshCcw size={16} /> Đồng bộ lịch nghỉ
        </Button>

        <Button
          className={`h-14 min-w-[192px] gap-2 rounded-xl px-4 text-sm text-white shadow-md xl:min-w-0 xl:flex-1 ${
            isPeriodLocked
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={onToggleLock}
        >
          {isPeriodLocked ? <Unlock size={16} /> : <Lock size={16} />}
          {isPeriodLocked ? "Mở khóa sổ" : "Khóa sổ công"}
        </Button>
      </div>
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
