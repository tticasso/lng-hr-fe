import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { DatePicker } from "antd";
import { AlertTriangle, CalendarDays, Clock3, LogOut, RefreshCcw, UserX } from "lucide-react";
import { toast } from "react-toastify";

import Card from "../../components/common/Card";
import { dashboardAPI } from "../../apis/dashboardAPI";
import { formatEmployeeCode } from "../../utils/employeeDisplay";
import {
  buildAttendanceInsightCards,
  buildAttendanceInsightTrendSeries,
} from "./hrAnalyticsView";
import {
  DASHBOARD_DATE_PICKER_FORMAT,
  fromDashboardPickerDate,
  isAfterDashboardMaxDate,
  toDashboardPickerDate,
} from "./dashboardDatePickerView";

const toneMap = {
  blue: "border-blue-100 bg-blue-50/70 text-blue-700",
  amber: "border-amber-100 bg-amber-50/70 text-amber-700",
  sky: "border-sky-100 bg-sky-50/70 text-sky-700",
  violet: "border-violet-100 bg-violet-50/70 text-violet-700",
  rose: "border-rose-100 bg-rose-50/70 text-rose-700",
  slate: "border-slate-100 bg-slate-50/70 text-slate-700",
};

const issueLabels = {
  ABSENT: "Vắng mặt",
  ATTENDANCE_ISSUE: "Bất thường",
  EARLY: "Về sớm",
  ERROR: "Lỗi",
  LATE: "Đi muộn",
  LATE_AND_EARLY: "Đi muộn + về sớm",
  MISSING_CHECKIN: "Thiếu check-in",
  MISSING_CHECKOUT: "Thiếu check-out",
  NO_ATTENDANCE_RECORD: "Không chấm công",
};

const toLocalDate = (value) => {
  const date = value instanceof Date ? value : new Date(`${value}T00:00:00`);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateString, amount) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toLocalDate(date);
};

const buildPresetRange = (toDate, days) => ({
  fromDate: addDays(toDate, -(days - 1)),
  toDate,
});

const formatTime = (value) => value || "--";

const AttendanceInsightsDashboard = memo(({ selectedDate, onNavigateAttendance }) => {
  const [range, setRange] = useState(() => buildPresetRange(selectedDate, 7));
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState(7);

  useEffect(() => {
    setRange(buildPresetRange(selectedDate, activePreset || 7));
  }, [activePreset, selectedDate]);

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getAttendanceInsights({
        fromDate: range.fromDate,
        toDate: range.toDate,
        issueLimit: 50,
      });
      setInsights(response.data?.data || null);
    } catch (error) {
      toast.error(error.normalizedMessage || "Không tải được dashboard chấm công");
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, [range.fromDate, range.toDate]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const cards = useMemo(() => buildAttendanceInsightCards(insights), [insights]);
  const trendSeries = useMemo(() => buildAttendanceInsightTrendSeries(insights), [insights]);
  const maxTrendValue = Math.max(1, ...trendSeries.map((item) => item.maxValue));
  const issueRecords = insights?.issueRecords || [];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="text-lg font-bold text-slate-950">Giám sát chấm công</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Khu vực chính để theo dõi đi muộn, về sớm, thiếu check-in/out và không chấm công.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {[1, 7, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setActivePreset(days)}
                className={`h-9 rounded-md border px-3 text-sm font-semibold transition ${
                  activePreset === days
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {days === 1 ? "1 ngày" : `${days} ngày`}
              </button>
            ))}
            <button
              type="button"
              onClick={fetchInsights}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              disabled={loading}
            >
              <RefreshCcw size={14} />
              Làm mới
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
              <CalendarDays size={14} />
              Khoảng ngày
            </label>
            <DatePicker.RangePicker
              allowClear={false}
              className="h-9 min-w-[260px]"
              disabledDate={(current) => isAfterDashboardMaxDate(current, selectedDate)}
              format={DASHBOARD_DATE_PICKER_FORMAT}
              value={[
                toDashboardPickerDate(range.fromDate),
                toDashboardPickerDate(range.toDate),
              ]}
              onChange={(value) => {
                const [fromDate, toDate] = value || [];
                const nextFromDate = fromDashboardPickerDate(fromDate);
                const nextToDate = fromDashboardPickerDate(toDate);
                if (!nextFromDate || !nextToDate) return;
                setActivePreset(null);
                setRange({ fromDate: nextFromDate, toDate: nextToDate });
              }}
            />
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`rounded-lg border p-4 ${toneMap[card.tone] || toneMap.blue}`}
          >
            <p className="text-sm font-semibold text-slate-700">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-slate-950">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900">Xu hướng bất thường</h3>
            <span className="text-xs font-semibold text-slate-500">
              {insights?.fromDate || range.fromDate} - {insights?.toDate || range.toDate}
            </span>
          </div>

          <div className="flex min-h-[230px] items-end gap-3 overflow-x-auto pb-2">
            {trendSeries.map((item) => (
              <div key={item.date} className="flex min-w-[72px] flex-1 flex-col items-center gap-2">
                <div className="flex h-40 w-full items-end gap-1 rounded-md bg-white px-2 py-2">
                  <TrendBar value={item.late} max={maxTrendValue} className="bg-amber-500" />
                  <TrendBar value={item.early} max={maxTrendValue} className="bg-sky-500" />
                  <TrendBar value={item.missingCheckOuts} max={maxTrendValue} className="bg-violet-500" />
                  <TrendBar value={item.absentOrNoRecord} max={maxTrendValue} className="bg-rose-500" />
                </div>
                <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            <Legend color="bg-amber-500" label="Đi muộn" />
            <Legend color="bg-sky-500" label="Về sớm" />
            <Legend color="bg-violet-500" label="Thiếu out" />
            <Legend color="bg-rose-500" label="Vắng/không chấm" />
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cần HR xử lý</h3>
              <p className="text-xs font-medium text-slate-500">{issueRecords.length} bản ghi ưu tiên</p>
            </div>
            <button
              type="button"
              onClick={onNavigateAttendance}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Mở chấm công
            </button>
          </div>

          {issueRecords.length > 0 ? (
            <div className="max-h-[360px] divide-y divide-slate-100 overflow-y-auto">
              {issueRecords.map((item) => (
                <IssueRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="p-5 text-sm text-slate-500">
              Chưa có bất thường trong khoảng ngày này.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});

const TrendBar = ({ value, max, className }) => (
  <div className="flex flex-1 items-end justify-center">
    <div
      className={`w-full min-w-[8px] rounded-t ${className}`}
      style={{ height: `${Math.max(value > 0 ? 8 : 0, (value / max) * 132)}px` }}
      title={String(value)}
    />
  </div>
);

const Legend = ({ color, label }) => (
  <span className="inline-flex items-center gap-2">
    <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
    {label}
  </span>
);

const IssueRow = ({ item }) => (
  <div className="flex items-start justify-between gap-3 p-4">
    <div className="min-w-0">
      <div className="flex min-w-0 items-center gap-2">
        <IssueIcon issueType={item.issueType} />
        <p className="truncate text-sm font-bold text-slate-900">
          {item.employee?.fullName || "Chưa có tên"}
        </p>
      </div>
      <p className="mt-1 text-xs font-medium text-slate-500">
        {formatEmployeeCode(item.employee?.employeeCode)}
        {item.employee?.department?.name ? ` · ${item.employee.department.name}` : ""}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {issueLabels[item.issueType] || item.issueType} · {item.source || "--"} · {item.status || "--"}
      </p>
    </div>
    <div className="shrink-0 text-right">
      <p className="text-xs font-semibold text-slate-500">
        {String(item.date || "").slice(0, 10)}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">
        {formatTime(item.checkIn)} - {formatTime(item.checkOut)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {item.lateMinutes || 0}p muộn · {item.earlyMinutes || 0}p sớm
      </p>
    </div>
  </div>
);

const IssueIcon = ({ issueType }) => {
  if (issueType === "NO_ATTENDANCE_RECORD" || issueType === "ABSENT") {
    return <UserX size={14} className="shrink-0 text-rose-600" />;
  }
  if (issueType === "MISSING_CHECKOUT" || issueType === "MISSING_CHECKIN") {
    return <LogOut size={14} className="shrink-0 text-violet-600" />;
  }
  return <Clock3 size={14} className="shrink-0 text-amber-600" />;
};

TrendBar.displayName = "TrendBar";
Legend.displayName = "Legend";
IssueRow.displayName = "IssueRow";
IssueIcon.displayName = "IssueIcon";
AttendanceInsightsDashboard.displayName = "AttendanceInsightsDashboard";

export default AttendanceInsightsDashboard;
