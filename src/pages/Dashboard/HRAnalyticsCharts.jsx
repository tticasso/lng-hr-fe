import { memo } from "react";
import { BarChart3, CircleGauge, PieChart } from "lucide-react";

import Card from "../../components/common/Card";
import {
  buildAttendanceChartSeries,
  buildRequestStatusSeries,
  buildWorkforceComposition,
} from "./hrAnalyticsView";

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value || 0)));

const HRAnalyticsCharts = memo(({ hrOverview, hrRequestsSummary, counts }) => {
  const attendanceSeries = buildAttendanceChartSeries(hrOverview);
  const workforceSeries = buildWorkforceComposition(hrOverview);
  const requestSeries = buildRequestStatusSeries(hrRequestsSummary, counts);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
      <Card className="border-slate-200 bg-white shadow-sm lg:col-span-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-700" />
              <h3 className="text-lg font-bold text-slate-950">Phân tích chấm công trong ngày</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              So sánh tỷ lệ có mặt và các bất thường cần xử lý trước khi chốt công.
            </p>
          </div>
          <span className="w-fit rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            Dữ liệu vận hành
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px]">
          <div className="min-h-[260px] rounded-lg border border-slate-100 bg-slate-50 p-4">
            <AttendanceBarChart series={attendanceSeries} />
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
            {attendanceSeries.map((item) => (
              <div key={item.key} className="rounded-lg border border-slate-100 bg-white p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                  <span className="text-xs font-bold text-slate-400">{item.percent}%</span>
                </div>
                <p className="text-2xl font-bold text-slate-950">{item.value}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${item.className}`}
                    style={{ width: `${clamp(item.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:col-span-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <PieChart size={17} className="text-blue-700" />
                <h3 className="text-base font-bold text-slate-950">Cơ cấu nhân sự</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">Theo trạng thái hiện tại.</p>
            </div>
          </div>

          <div className="grid grid-cols-[150px_1fr] items-center gap-4">
            <DonutChart series={workforceSeries} />
            <div className="space-y-3">
              {workforceSeries.map((item) => (
                <LegendRow key={item.key} item={item} />
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CircleGauge size={17} className="text-blue-700" />
            <h3 className="text-base font-bold text-slate-950">Phân bổ request</h3>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">Tổng request</p>
            <p className="mt-1 text-3xl font-bold text-slate-950">{requestSeries.total}</p>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-200">
              {requestSeries.segments.map((segment) => (
                <div
                  key={segment.key}
                  className={segment.className}
                  style={{ width: `${clamp(segment.percent)}%` }}
                  title={`${segment.label}: ${segment.value}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {requestSeries.segments.map((segment) => (
              <LegendRow key={segment.key} item={segment} compact />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

const AttendanceBarChart = ({ series }) => {
  const maxBarHeight = 148;
  const chartHeight = 210;
  const baseline = 168;
  const barWidth = 58;
  const gap = 54;
  const startX = 54;

  return (
    <svg className="h-[240px] w-full" role="img" viewBox="0 0 520 230">
      <title>Attendance analytics chart</title>
      {[0, 25, 50, 75, 100].map((tick) => {
        const y = baseline - (tick / 100) * maxBarHeight;
        return (
          <g key={tick}>
            <line stroke="#e2e8f0" strokeDasharray="4 6" x1="32" x2="500" y1={y} y2={y} />
            <text fill="#94a3b8" fontSize="11" x="0" y={y + 4}>
              {tick}%
            </text>
          </g>
        );
      })}

      {series.map((item, index) => {
        const height = Math.max(item.value > 0 ? 10 : 0, (clamp(item.percent) / 100) * maxBarHeight);
        const x = startX + index * (barWidth + gap);
        const y = baseline - height;

        return (
          <g key={item.key}>
            <rect fill="#e2e8f0" height={maxBarHeight} rx="8" width={barWidth} x={x} y={baseline - maxBarHeight} />
            <rect fill={item.color} height={height} rx="8" width={barWidth} x={x} y={y} />
            <text fill="#0f172a" fontSize="18" fontWeight="700" textAnchor="middle" x={x + barWidth / 2} y={y - 10}>
              {item.value}
            </text>
            <text fill="#64748b" fontSize="12" fontWeight="600" textAnchor="middle" x={x + barWidth / 2} y={chartHeight}>
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart = ({ series }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative h-[150px] w-[150px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" fill="none" r={radius} stroke="#e2e8f0" strokeWidth="16" />
        {series.map((item) => {
          const dash = (clamp(item.percent) / 100) * circumference;
          const segment = (
            <circle
              key={item.key}
              cx="60"
              cy="60"
              fill="none"
              r={radius}
              stroke={item.color}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              strokeWidth="16"
            />
          );
          offset += dash;
          return segment;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-950">
          {series.reduce((sum, item) => sum + item.value, 0)}
        </span>
        <span className="text-xs font-semibold text-slate-500">nhân sự</span>
      </div>
    </div>
  );
};

const LegendRow = ({ item, compact = false }) => (
  <div className={compact ? "rounded-lg border border-slate-100 bg-white p-3" : "flex items-center justify-between gap-3"}>
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.className}`} />
      <span className="text-sm font-semibold text-slate-700">{item.label}</span>
    </div>
    <div className={compact ? "mt-2 flex items-end justify-between gap-2" : "text-right"}>
      <span className="text-lg font-bold text-slate-950">{item.value}</span>
      <span className="text-xs font-semibold text-slate-500">{item.percent}%</span>
    </div>
  </div>
);

HRAnalyticsCharts.displayName = "HRAnalyticsCharts";

export default HRAnalyticsCharts;
