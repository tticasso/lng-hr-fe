import { memo } from "react";
import Card from "../../components/common/Card";
import { BriefcaseBusiness, CalendarCheck2, CalendarDays, ClipboardList, Clock3, UserCheck, UserX } from "lucide-react";

const overviewCards = (data) => [
  {
    label: "Nhân sự đang theo dõi",
    value: data?.employees?.active + data?.employees?.probation + data?.employees?.onLeave || 0,
    meta: `${data?.employees?.active || 0} chính thức · ${data?.employees?.probation || 0} thử việc`,
    icon: BriefcaseBusiness,
    tone: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label: "Có mặt",
    value: data?.attendance?.present || 0,
    meta: `${data?.attendance?.records || 0} bản ghi chấm công`,
    icon: UserCheck,
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    label: "Vắng mặt",
    value: data?.attendance?.absent || 0,
    meta: `${data?.attendance?.onLeave || 0} nghỉ phép`,
    icon: UserX,
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "Đi muộn",
    value: data?.attendance?.late || 0,
    meta: `${data?.attendance?.missingCheckOuts || 0} thiếu check-out`,
    icon: Clock3,
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    label: "Đơn chờ duyệt",
    value: data?.approvals?.totalPending || 0,
    meta: `${data?.approvals?.pendingLeaves || 0} nghỉ phép · ${data?.approvals?.pendingOvertimes || 0} OT`,
    icon: ClipboardList,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    label: "OT đã duyệt",
    value: data?.approvals?.approvedOvertimesToday || 0,
    meta: `Ngày ${data?.date || "--"}`,
    icon: CalendarCheck2,
    tone: "bg-sky-50 text-sky-700 border-sky-100",
  },
];

const HROperationsOverview = memo(({ data, selectedDate, maxDate, onDateChange, onResetDate }) => {
  if (!data) return null;
  const isToday = selectedDate === maxDate;

  return (
    <Card className="col-span-12">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tổng quan vận hành HR</h2>
          <p className="text-sm text-gray-500">Theo dõi nhanh tình hình nhân sự và chấm công theo ngày đã chọn.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
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
              className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={onResetDate}
              disabled={isToday}
              className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hôm nay
            </button>
          </div>
          <p className="text-sm font-medium text-gray-500">{data.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {overviewCards(data).map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className={`rounded-md border p-4 ${item.tone}`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{item.label}</p>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="mt-1 text-xs font-medium text-gray-500">{item.meta}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

HROperationsOverview.displayName = "HROperationsOverview";

export default HROperationsOverview;
