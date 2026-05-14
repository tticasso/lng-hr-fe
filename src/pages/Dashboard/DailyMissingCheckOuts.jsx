import { memo } from "react";
import Card from "../../components/common/Card";
import { LogOut } from "lucide-react";

const DailyMissingCheckOuts = memo(({ data, onViewAll }) => {
  if (!data) return null;

  const summary = data.summary || {};
  const missingCheckOuts = data.missingCheckOuts || [];
  const totalRecords = summary.totalMissingCheckOuts || missingCheckOuts.length;
  const hasMoreRecords = totalRecords > missingCheckOuts.length;

  return (
    <Card className="border-sky-100 bg-sky-50/40">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Chưa check-out</h3>
          <p className="mt-1 text-xs text-gray-500">{data.date}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
          <LogOut size={20} />
        </div>
      </div>

      <div className="mb-4 rounded-md border border-sky-100 bg-white p-3">
        <p className="text-xs font-medium text-gray-500">Đã check-in nhưng thiếu check-out</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{summary.totalMissingCheckOuts || 0}</p>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span>Đang hiển thị {missingCheckOuts.length}/{totalRecords}</span>
        {hasMoreRecords && (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-md border border-sky-200 bg-white px-3 py-1.5 font-semibold text-sky-700 transition-colors hover:bg-sky-50"
          >
            Xem tất cả
          </button>
        )}
      </div>

      {missingCheckOuts.length > 0 ? (
        <div className="divide-y divide-sky-100 rounded-md border border-sky-100 bg-white">
          {missingCheckOuts.map((attendance) => (
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
                <p className="text-sm font-bold text-sky-700">In {attendance.checkIn || "--:--"}</p>
                <p className="mt-1 text-xs text-gray-500">{attendance.status || "--"}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-sky-100 bg-white/80 p-4 text-sm text-gray-500">
          Chưa có bản ghi thiếu check-out trong ngày.
        </div>
      )}
    </Card>
  );
});

DailyMissingCheckOuts.displayName = "DailyMissingCheckOuts";

export default DailyMissingCheckOuts;
