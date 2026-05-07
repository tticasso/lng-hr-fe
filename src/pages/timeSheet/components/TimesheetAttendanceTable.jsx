import { memo } from "react";
import { AlertTriangle, CalendarDays, Zap } from "lucide-react";
import Card from "../../../components/common/Card";
import { dayLabels } from "../utils/constants";

const getDayOfWeek = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  return dayLabels[new Date(year, month - 1, day).getDay()];
};

const hasMissingCheck = (day) =>
  Boolean((day.checkIn && !day.checkOut) || (!day.checkIn && day.checkOut));

const getStatusMeta = (day) => {
  if (day.type === "holiday") {
    return {
      label: day.holidayName || "Nghi le",
      className: "bg-red-50 text-red-700 border-red-100",
    };
  }

  if (day.type === "weekend") {
    return {
      label: "Cuoi tuan",
      className: "bg-orange-50 text-orange-700 border-orange-100",
    };
  }

  if (day.type === "substitute_work") {
    return {
      label: "Lam bu",
      className: "bg-yellow-50 text-yellow-700 border-yellow-100",
    };
  }

  if (day.type === "rotation_off") {
    return {
      label: "Nghi luan phien",
      className: "bg-teal-50 text-teal-700 border-teal-100",
    };
  }

  if (day.type === "leave") {
    const isPaid = day.apiData?.status === "PAID_LEAVE";
    return {
      label: isPaid ? "Nghi co luong" : "Nghi khong luong",
      className: isPaid
        ? "bg-purple-50 text-purple-700 border-purple-100"
        : "bg-orange-50 text-orange-700 border-orange-100",
    };
  }

  if (day.status?.includes("absent")) {
    return {
      label: "Vang",
      className: "bg-red-50 text-red-700 border-red-100",
    };
  }

  if (hasMissingCheck(day) || day.apiData?.status === "ERROR") {
    return {
      label: "Thieu du lieu",
      className: "bg-amber-50 text-amber-700 border-amber-100",
    };
  }

  if (day.checkIn || day.checkOut) {
    return {
      label: "Da cham cong",
      className: "bg-green-50 text-green-700 border-green-100",
    };
  }

  return {
    label: "Chua cham cong",
    className: "bg-gray-50 text-gray-600 border-gray-100",
  };
};

const TimeCell = ({ value, muted, danger }) => (
  <span
    className={`font-mono text-sm font-bold ${
      danger ? "text-red-600" : muted ? "text-gray-400" : "text-gray-900"
    }`}
  >
    {value || "--:--"}
  </span>
);

const StatusBadge = ({ day }) => {
  const meta = getStatusMeta(day);
  return (
    <span
      className={`inline-flex items-center rounded border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
};

const getWarnings = (day) => {
  const warnings = [];

  if (day.status?.includes("late")) {
    warnings.push(`Di muon ${day.lateMinutes}p`);
  }

  if (day.status?.includes("early")) {
    warnings.push(`Ve som ${day.earlyMinutes}p`);
  }

  if (hasMissingCheck(day)) {
    warnings.push("Thieu check-in/check-out");
  }

  return warnings;
};

const RowWarnings = ({ day }) => {
  const warnings = getWarnings(day);

  if (!warnings.length) {
    return <span className="text-sm text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {warnings.map((warning) => (
        <span
          key={warning}
          className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700"
        >
          <AlertTriangle size={12} />
          {warning}
        </span>
      ))}
    </div>
  );
};

const CompactWarnings = ({ day }) => {
  const warnings = getWarnings(day);

  if (!warnings.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {warnings.map((warning) => (
        <span
          key={warning}
          className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700"
        >
          <AlertTriangle size={11} />
          {warning}
        </span>
      ))}
    </div>
  );
};

const TimesheetAttendanceTable = memo(({ calendarDays, loading }) => {
  const days = calendarDays.filter((day) => day.inMonth);

  return (
    <Card className="w-full overflow-hidden border border-gray-200 p-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-3 py-3 sm:px-5 sm:py-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Bang cong</h2>
          <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
            Theo doi check-in, check-out va trang thai tung ngay.
          </p>
        </div>
        <CalendarDays className="hidden text-blue-600 sm:block" size={22} />
      </div>

      {loading ? (
        <div className="flex h-72 items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="text-sm text-gray-500">Dang tai du lieu cham cong...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-[960px] w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Ngay
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Trang thai
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Check In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Check Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    OT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Ghi chu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {days.map((day) => (
                  <tr key={day.isoDate} className={day.isToday ? "bg-blue-50/60" : undefined}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{day.fullDate}</div>
                      <div className="text-xs text-gray-500">{getDayOfWeek(day.isoDate)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge day={day} />
                    </td>
                    <td className="px-4 py-3">
                      <TimeCell value={day.checkIn} muted={!day.checkIn} danger={day.status?.includes("late")} />
                    </td>
                    <td className="px-4 py-3">
                      <TimeCell value={day.checkOut} muted={!day.checkOut} danger={hasMissingCheck(day)} />
                    </td>
                    <td className="px-4 py-3">
                      {day.status?.includes("ot") ? (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                          <Zap size={12} />
                          {Number(day.otHours || 0).toFixed(2)}h
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RowWarnings day={day} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-gray-100 md:hidden">
            {days.map((day) => (
              <div key={day.isoDate} className={`px-3 py-2.5 ${day.isToday ? "bg-blue-50/60" : "bg-white"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">
                      {getDayOfWeek(day.isoDate)}, {day.fullDate}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">IN</span>
                      <TimeCell
                        value={day.checkIn}
                        muted={!day.checkIn}
                        danger={day.status?.includes("late")}
                      />
                      <span className="text-gray-300">{"->"}</span>
                      <span className="text-gray-500">OUT</span>
                      <TimeCell
                        value={day.checkOut}
                        muted={!day.checkOut}
                        danger={hasMissingCheck(day)}
                      />
                    </div>
                  </div>
                  <StatusBadge day={day} />
                </div>

                {day.status?.includes("ot") && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-semibold text-orange-700">
                      <Zap size={11} />
                      OT {Number(day.otHours || 0).toFixed(2)}h
                    </span>
                  </div>
                )}

                <CompactWarnings day={day} />
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
});

TimesheetAttendanceTable.displayName = "TimesheetAttendanceTable";

export default TimesheetAttendanceTable;
