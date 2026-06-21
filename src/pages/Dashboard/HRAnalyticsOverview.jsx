import { memo } from "react";
import {
  BriefcaseBusiness,
  CalendarCheck2,
  CalendarDays,
  ClipboardList,
  Clock3,
  RotateCcw,
  UserCheck,
  UserX,
} from "lucide-react";

import Card from "../../components/common/Card";
import { buildHRMetricCards } from "./hrAnalyticsView";

const iconMap = {
  workforce: BriefcaseBusiness,
  present: UserCheck,
  absent: UserX,
  late: Clock3,
  pending: ClipboardList,
  ot: CalendarCheck2,
};

const toneMap = {
  blue: "border-blue-100 bg-blue-50/70 text-blue-700",
  emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-700",
  rose: "border-rose-100 bg-rose-50/70 text-rose-700",
  amber: "border-amber-100 bg-amber-50/70 text-amber-700",
  violet: "border-violet-100 bg-violet-50/70 text-violet-700",
  sky: "border-sky-100 bg-sky-50/70 text-sky-700",
};

const HRAnalyticsOverview = memo(({
  hrOverview,
  selectedDate,
  maxDate,
  onDateChange,
  onResetDate,
}) => {
  const cards = buildHRMetricCards({ hrOverview });
  const isToday = selectedDate === maxDate;

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">HR analytics</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Tình hình vận hành nhân sự</h2>
          <p className="mt-1 text-sm text-slate-500">
            Dữ liệu theo ngày đã chọn, dùng để phát hiện bất thường và ưu tiên xử lý.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
            <CalendarDays size={14} />
            Ngày xem dashboard
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              max={maxDate}
              onChange={(event) => {
                if (event.target.value) onDateChange(event.target.value);
              }}
              className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={onResetDate}
              disabled={isToday}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Hôm nay
            </button>
          </div>
          <p className="text-xs font-medium text-slate-500">{hrOverview?.date || selectedDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => {
          const Icon = iconMap[card.key];

          return (
            <div
              key={card.key}
              className={`rounded-lg border p-4 ${toneMap[card.tone] || toneMap.blue}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{card.label}</p>
                {Icon && <Icon size={18} className="shrink-0" />}
              </div>
              <p className="text-2xl font-bold text-slate-950">{card.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{card.detail}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

HRAnalyticsOverview.displayName = "HRAnalyticsOverview";

export default HRAnalyticsOverview;
