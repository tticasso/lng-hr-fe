import { memo } from "react";
import Card from "../../components/common/Card";
import { UserX } from "lucide-react";

const DailyAbsentAttendances = memo(({ data, onViewAll }) => {
  if (!data) return null;

  const summary = data.summary || {};
  const absentAttendances = data.absentAttendances || [];
  const totalRecords = summary.totalAbsentEmployees || absentAttendances.length;
  const hasMoreRecords = totalRecords > absentAttendances.length;

  return (
    <Card className="border-rose-100 bg-rose-50/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Vắng mặt</h3>
          <p className="mt-1 text-xs text-gray-500">{data.date}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-rose-600 shadow-sm">
          <UserX size={20} />
        </div>
      </div>

      <div className="mb-4 rounded-md border border-rose-100 bg-white p-3">
        <p className="text-xs font-medium text-gray-500">Số nhân viên vắng</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{summary.totalAbsentEmployees || 0}</p>
        <p className="mt-1 text-xs font-medium text-gray-500">
          {summary.totalAbsentRecords || 0} ABSENT · {summary.totalNoAttendanceRecords || 0} chưa có bản ghi
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>Đang hiển thị {absentAttendances.length}/{totalRecords}</span>
        {hasMoreRecords && (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-md border border-rose-200 bg-white px-3 py-1.5 font-semibold text-rose-700 transition-colors hover:bg-rose-50"
          >
            Xem tất cả
          </button>
        )}
      </div>

      {absentAttendances.length > 0 ? (
        <div className="divide-y divide-rose-100 rounded-md border border-rose-100 bg-white">
          {absentAttendances.map((attendance) => (
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
              <span className="shrink-0 rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
                {attendance.status === "NO_ATTENDANCE_RECORD" ? "NO RECORD" : "ABSENT"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-rose-100 bg-white/80 p-4 text-sm text-gray-500">
          Chưa có bản ghi vắng mặt trong ngày.
        </div>
      )}
    </Card>
  );
});

DailyAbsentAttendances.displayName = "DailyAbsentAttendances";

export default DailyAbsentAttendances;
