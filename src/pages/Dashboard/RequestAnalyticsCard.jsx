import { memo } from "react";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";

import Card from "../../components/common/Card";
import { getRequestAnalytics } from "./hrAnalyticsView";

const segments = [
  { key: "pending", label: "Chờ duyệt", color: "bg-amber-500", text: "text-amber-700", icon: Clock },
  { key: "approved", label: "Đã duyệt", color: "bg-emerald-500", text: "text-emerald-700", icon: CheckCircle2 },
  { key: "rejected", label: "Từ chối", color: "bg-rose-500", text: "text-rose-700", icon: XCircle },
  { key: "cancelled", label: "Đã hủy", color: "bg-slate-400", text: "text-slate-600", icon: XCircle },
];

const RequestAnalyticsCard = memo(({ hrRequestsSummary, counts, onViewRequests }) => {
  const analytics = getRequestAnalytics(hrRequestsSummary, counts);
  const denominator = analytics.total || 1;

  return (
    <Card className="h-full border-slate-200 bg-white shadow-sm lg:col-span-4">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Request funnel</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">Trạng thái phê duyệt</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <FileText size={19} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Tổng request</p>
            <p className="mt-2 text-4xl font-bold text-slate-950">{analytics.total}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase text-slate-500">Tỷ lệ duyệt</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{analytics.approvedRate}%</p>
          </div>
        </div>

        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-slate-200">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className={segment.color}
              style={{ width: `${(analytics[segment.key] / denominator) * 100}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {segments.map((segment) => {
          const Icon = segment.icon;

          return (
            <div key={segment.key} className="rounded-lg border border-slate-100 p-3">
              <div className={`mb-2 flex items-center gap-1.5 text-xs font-semibold ${segment.text}`}>
                <Icon size={14} />
                {segment.label}
              </div>
              <p className="text-xl font-bold text-slate-950">{analytics[segment.key]}</p>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onViewRequests}
        className="mt-5 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Mở request queue
      </button>
    </Card>
  );
});

RequestAnalyticsCard.displayName = "RequestAnalyticsCard";

export default RequestAnalyticsCard;
