import { memo } from "react";
import { CircleGauge, PieChart } from "lucide-react";

import Card from "../../components/common/Card";
import {
  buildRequestStatusSeries,
  buildWorkforceComposition,
} from "./hrAnalyticsView";

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value || 0)));

const HRAnalyticsCharts = memo(({ hrOverview, hrRequestsSummary, counts }) => {
  const workforceSeries = buildWorkforceComposition(hrOverview);
  const requestSeries = buildRequestStatusSeries(hrRequestsSummary, counts);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
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
  );
});

const DonutChart = ({ series }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative h-[150px] w-[150px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" fill="none" r={radius} stroke="#e2e8f0" strokeWidth="16" />
        {series.filter((item) => item.percent > 0).map((item) => {
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
    <div className={compact ? "mt-2 flex items-end justify-between gap-2" : "flex items-baseline justify-end gap-2 text-right"}>
      <span className="text-lg font-bold text-slate-950">{item.value}</span>
      <span className="text-xs font-semibold text-slate-500">{item.percent}%</span>
    </div>
  </div>
);

HRAnalyticsCharts.displayName = "HRAnalyticsCharts";

export default HRAnalyticsCharts;
