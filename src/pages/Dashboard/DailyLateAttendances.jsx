import { memo } from "react";
import Card from "../../components/common/Card";
import { Clock3, TimerReset, UserCheck } from "lucide-react";

const formatMinutes = (value) => {
  const minutes = Number(value || 0);
  return `${minutes} phút`;
};

const DailyLateAttendances = memo(({ data, onViewAll }) => {
  if (!data) return null;

  const summary = data.summary || {};
  const lateAttendances = data.lateAttendances || [];
  const totalRecords = summary.totalLateEmployees || lateAttendances.length;
  const hasMoreRecords = totalRecords > lateAttendances.length;

  return (
    <Card className="border-amber-100 bg-amber-50/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Đi muộn</h3>
          <p className="mt-1 text-xs text-gray-500">{data.date}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
          <Clock3 size={20} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-md border border-amber-100 bg-white p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
            <UserCheck size={13} />
            Số người
          </div>
          <p className="text-lg font-bold text-gray-900">{summary.totalLateEmployees || 0}</p>
        </div>
        <div className="rounded-md border border-amber-100 bg-white p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
            <TimerReset size={13} />
            Tổng phút
          </div>
          <p className="text-lg font-bold text-gray-900">{summary.totalLateMinutes || 0}</p>
        </div>
        <div className="rounded-md border border-amber-100 bg-white p-3">
          <div className="mb-1 flex items-center gap-1 text-xs font-medium text-gray-500">
            <Clock3 size={13} />
            Cao nhất
          </div>
          <p className="text-lg font-bold text-gray-900">{summary.maxLateMinutes || 0}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>Đang hiển thị {lateAttendances.length}/{totalRecords}</span>
        {hasMoreRecords && (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-md border border-amber-200 bg-white px-3 py-1.5 font-semibold text-amber-700 transition-colors hover:bg-amber-50"
          >
            Xem tất cả
          </button>
        )}
      </div>

      {lateAttendances.length > 0 ? (
        <div className="divide-y divide-amber-100 rounded-md border border-amber-100 bg-white">
          {lateAttendances.map((attendance) => (
            <div key={attendance.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800">
                  {attendance.employee?.fullName || "Chưa có tên"}
                </p>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {attendance.employee?.employeeCode || "--"}
                  {attendance.employee?.department?.name ? ` · ${attendance.employee.department.name}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-amber-700">{formatMinutes(attendance.lateMinutes)}</p>
                <p className="mt-1 text-xs text-gray-500">In {attendance.checkIn || "--:--"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-amber-100 bg-white/80 p-4 text-sm text-gray-500">
          Chưa có nhân viên đi muộn trong ngày.
        </div>
      )}
    </Card>
  );
});

DailyLateAttendances.displayName = "DailyLateAttendances";

export default DailyLateAttendances;
