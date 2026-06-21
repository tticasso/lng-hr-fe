import { memo } from "react";
import { Activity, AlertTriangle, Clock3, LogOut, UserCheck, UserX } from "lucide-react";

import Card from "../../components/common/Card";
import { getAttendanceHealth } from "./hrAnalyticsView";

const clampPercent = (value) => Math.min(100, Math.max(0, Number(value || 0)));

const AttendanceHealthCard = memo(({ hrOverview, onViewAttendance }) => {
  const health = getAttendanceHealth(hrOverview);
  const presentWidth = clampPercent(health.presentRate);
  const absentWidth = clampPercent(health.absentRate);
  const lateWidth = clampPercent(health.lateRate);

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm lg:col-span-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-600" />
            <h3 className="text-lg font-bold text-slate-950">Sức khỏe chấm công</h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Tỷ lệ có mặt, bất thường và mức độ cần theo dõi trong ngày.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {health.statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Tỷ lệ có mặt</p>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-bold text-slate-950">{health.presentRate}%</span>
            <span className="pb-1 text-sm font-medium text-slate-500">
              / {health.expectedEmployees || 0} nhân sự
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${presentWidth}%` }} />
          </div>
          <button
            type="button"
            onClick={onViewAttendance}
            className="mt-4 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            Mở bảng chấm công
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatusTile icon={<UserCheck size={15} />} label="Có mặt" value={health.present} tone="emerald" />
            <StatusTile icon={<UserX size={15} />} label="Vắng" value={health.absent} tone="rose" />
            <StatusTile icon={<Clock3 size={15} />} label="Đi muộn" value={health.late} tone="amber" />
            <StatusTile icon={<LogOut size={15} />} label="Thiếu check-out" value={health.missingCheckOuts} tone="sky" />
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">Phân rã bất thường</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                <AlertTriangle size={13} />
                {health.anomalyTotal} điểm cần xem
              </span>
            </div>
            <BreakdownRow label="Vắng mặt" value={health.absent} width={absentWidth} className="bg-rose-500" />
            <BreakdownRow label="Đi muộn" value={health.late} width={lateWidth} className="bg-amber-500" />
            <BreakdownRow
              label="Thiếu check-out"
              value={health.missingCheckOuts}
              width={clampPercent((health.missingCheckOuts / (health.expectedEmployees || 1)) * 100)}
              className="bg-sky-500"
            />
          </div>
        </div>
      </div>
    </Card>
  );
});

const toneClass = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  sky: "bg-sky-50 text-sky-700 border-sky-100",
};

const StatusTile = ({ icon, label, value, tone }) => (
  <div className={`rounded-lg border p-3 ${toneClass[tone]}`}>
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-semibold">{label}</span>
      {icon}
    </div>
    <p className="text-xl font-bold text-slate-950">{value}</p>
  </div>
);

const BreakdownRow = ({ label, value, width, className }) => (
  <div className="mb-3 last:mb-0">
    <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${clampPercent(width)}%` }} />
    </div>
  </div>
);

AttendanceHealthCard.displayName = "AttendanceHealthCard";

export default AttendanceHealthCard;
