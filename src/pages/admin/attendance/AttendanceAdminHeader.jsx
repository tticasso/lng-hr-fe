import { Dropdown } from "antd";
import {
  ChevronDown,
  Download,
  Lock,
  MoreHorizontal,
  RefreshCcw,
  Trash2,
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
  onOpenBulkDelete,
  onExport,
  onSyncData,
  onSyncHoliday,
  onToggleLock,
  isExportDisabled,
  canWriteAttendance = false,
}) => {
  const moreMenuItems = [
    {
      key: "import",
      icon: <Upload size={14} />,
      label: "Import dữ liệu",
    },
    {
      key: "syncData",
      icon: <RefreshCcw size={14} />,
      label: "Đồng bộ dữ liệu",
    },
    {
      key: "syncHoliday",
      icon: <RefreshCcw size={14} />,
      label: "Đồng bộ lịch nghỉ",
    },
    {
      type: "divider",
    },
    {
      key: "toggleLock",
      icon: isPeriodLocked ? <Unlock size={14} /> : <Lock size={14} />,
      label: isPeriodLocked ? "Mở khóa sổ công" : "Khóa sổ công",
    },
  ];

  const handleMoreAction = ({ key }) => {
    const handlers = {
      import: onImport,
      syncData: onSyncData,
      syncHoliday: onSyncHoliday,
      toggleLock: onToggleLock,
    };

    handlers[key]?.();
  };

  const lockBadge = isPeriodLocked ? (
    <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-100 px-2 py-1 text-xs text-red-600">
      <Lock size={10} /> Đã khóa sổ
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-100 px-2 py-1 text-xs text-green-600">
      <Unlock size={10} /> Đang mở
    </span>
  );

  const secondaryActions = (
    <>
      <Button
        variant="secondary"
        className="h-9 gap-2 rounded-lg px-3 text-sm"
        onClick={onImport}
      >
        <Upload size={15} /> Import
      </Button>
      <Button
        onClick={onSyncData}
        variant="secondary"
        className="h-9 gap-2 rounded-lg px-3 text-sm"
      >
        <RefreshCcw size={15} /> Đồng bộ dữ liệu
      </Button>
      <Button
        onClick={onSyncHoliday}
        variant="secondary"
        className="h-9 gap-2 rounded-lg px-3 text-sm"
      >
        <RefreshCcw size={15} /> Lịch nghỉ
      </Button>
      <Button
        variant="secondary"
        className="h-9 gap-2 rounded-lg px-3 text-sm"
        onClick={onToggleLock}
      >
        {isPeriodLocked ? <Unlock size={15} /> : <Lock size={15} />}
        {isPeriodLocked ? "Mở khóa" : "Khóa sổ"}
      </Button>
    </>
  );

  const actions = (
    <div className="flex w-full flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-end">
      <MonthNavigator
        month={month}
        year={year}
        onPrevious={onPreviousPeriod}
        onNext={onNextPeriod}
        className="w-full min-w-0 2xl:w-[240px]"
      />

      <div className="flex flex-col gap-2 xl:flex-row xl:flex-wrap xl:items-center xl:justify-end">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {canWriteAttendance && (
            <>
              <Button
                className="h-10 gap-2 rounded-lg bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
                onClick={onOpenBulkAttendance}
              >
                <UserPlus size={16} /> Tạo công hàng loạt
              </Button>
              <Button
                variant="secondary"
                className="h-10 gap-2 rounded-lg border-red-200 px-4 text-sm text-red-600 hover:bg-red-50"
                onClick={onOpenBulkDelete}
              >
                <Trash2 size={16} /> Xóa công hàng loạt
              </Button>
            </>
          )}

          <Button
            variant="secondary"
            className="h-10 gap-2 rounded-lg px-4 text-sm"
            onClick={onExport}
            disabled={isExportDisabled}
          >
            <Download size={16} /> Xuất Excel
          </Button>
        </div>

        {canWriteAttendance && (
          <>
            <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1 xl:flex">
              <span className="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Công cụ
              </span>
              {secondaryActions}
            </div>

            <div className="sm:w-auto xl:hidden">
              <Dropdown
                menu={{ items: moreMenuItems, onClick: handleMoreAction }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 w-full gap-2 rounded-lg px-4 text-sm sm:w-auto"
                >
                  <MoreHorizontal size={16} /> Thêm <ChevronDown size={14} />
                </Button>
              </Dropdown>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <PageToolbar
      title="Quản trị Chấm công"
      description="Tổng hợp dữ liệu công, tăng ca và nghỉ phép"
      meta={lockBadge}
      actions={actions}
    />
  );
};

export default AttendanceAdminHeader;
