import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Clock,
  Briefcase,
  Zap,
  Coffee,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import Card from "../../../components/common/Card";
import { statCardColors } from "../utils/constants";
import {
  formatLeaveDays,
  getAnnualLeaveHistoryRows,
} from "../utils/leaveStats";

const OT_TYPE_LABELS = {
  weekday: "Ngày thường",
  weekend: "Cuối tuần",
  holiday: "Ngày lễ",
  weekday_night: "Đêm ngày thường",
  weekend_night: "Đêm cuối tuần",
  holiday_night: "Đêm ngày lễ",
};

const OT_TYPE_ORDER = [
  "weekday",
  "weekend",
  "holiday",
  "weekday_night",
  "weekend_night",
  "holiday_night",
];

const IGNORED_OT_KEYS = new Set([
  "total",
  "totalhours",
  "status",
  "hours",
  "approvedhours",
  "pendinghours",
  "rejectedhours",
  "details",
  "breakdown",
  "bytype",
  "othours",
]);

const normalizeOTTypeKey = (key) =>
  String(key || "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/-/g, "_")
    .toLowerCase();

const toHours = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const toDays = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatDays = (value) => `${toDays(value).toFixed(2)} công`;

const addOTHours = (target, key, hours) => {
  const normalizedKey = normalizeOTTypeKey(key);
  if (!normalizedKey || IGNORED_OT_KEYS.has(normalizedKey.replace(/_/g, ""))) {
    return;
  }

  const numberHours = toHours(hours);
  if (numberHours <= 0) return;

  target[normalizedKey] = (target[normalizedKey] || 0) + numberHours;
};

const accumulateOTBreakdown = (source, target) => {
  if (!source) return;

  if (Array.isArray(source)) {
    source.forEach((item) => {
      if (!item || typeof item !== "object") return;

      const typeKey = item.type || item.otType || item.key || item.name;
      const hours =
        item.hours ?? item.totalHours ?? item.approvedHours ?? item.value;

      if (typeKey) {
        addOTHours(target, typeKey, hours);
      }
    });
    return;
  }

  if (typeof source !== "object") return;

  Object.entries(source).forEach(([key, value]) => {
    if (value && typeof value === "object") {
      const typeKey = value.type || value.otType || value.key || key;
      const hours =
        value.hours ?? value.totalHours ?? value.approvedHours ?? value.value;

      if (hours !== undefined) {
        addOTHours(target, typeKey, hours);
      }
      return;
    }

    addOTHours(target, key, value);
  });
};

const getOTBreakdown = (timesheetData, attendanceData) => {
  const summaryBreakdown = {};
  const overtime = timesheetData?.overtime;

  [
    overtime?.details,
    overtime?.breakdown,
    overtime?.byType,
    overtime?.otHours,
    overtime,
    timesheetData?.otHours,
    timesheetData?.finalOtHours,
  ].forEach((source) => accumulateOTBreakdown(source, summaryBreakdown));

  if (Object.keys(summaryBreakdown).length > 0) {
    return summaryBreakdown;
  }

  const monthlyBreakdown = {};
  (attendanceData || []).forEach((record) => {
    if (record?.finalOtHours) {
      accumulateOTBreakdown(record.finalOtHours, monthlyBreakdown);
      return;
    }

    if (record?.otHours) {
      accumulateOTBreakdown(record.otHours, monthlyBreakdown);
      return;
    }

    if (Array.isArray(record?.overtimeId)) {
      record.overtimeId.forEach((ot) => {
        addOTHours(
          monthlyBreakdown,
          ot?.otType,
          ot?.approvedHours ?? ot?.totalHours,
        );
      });
    }
  });

  return monthlyBreakdown;
};

const StatCard = memo(
  ({
    icon,
    label,
    value,
    sub,
    color,
    isWarning,
    detailContent,
    detailTitle,
    detailClassName = "w-64",
  }) => {
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const detailRef = useRef(null);

    useEffect(() => {
      if (!isDetailOpen) return;

      const handleClickOutside = (event) => {
        if (!detailRef.current?.contains(event.target)) {
          setIsDetailOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [isDetailOpen]);

    return (
      <Card
        className={`relative flex items-start gap-3 p-4 border ${
          isWarning
            ? "border-red-300 ring-1 ring-red-50"
            : statCardColors[color].split(" ")[2]
        }`}
      >
        <div className={`p-2.5 rounded-lg shrink-0 ${statCardColors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
            {label}
          </p>
          <h4 className="text-xl font-bold text-gray-800 mt-0.5">{value}</h4>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>

        {detailContent && (
          <div ref={detailRef} className="absolute right-3 top-3">
            <button
              type="button"
              onClick={() => setIsDetailOpen((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-orange-50 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
              title={detailTitle || "Xem chi tiết"}
              aria-label={detailTitle || "Xem chi tiết"}
            >
              <HelpCircle size={15} />
            </button>

            {isDetailOpen && (
              <div className={`absolute right-0 top-full z-30 mt-2 rounded-lg border border-gray-200 bg-white p-3 text-left shadow-xl ${detailClassName}`}>
                {detailContent}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  },
);

const OTDetailPopover = memo(({ totalHours, details }) => (
  <>
    <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
      <span className="text-xs font-bold uppercase text-gray-700">
        Chi tiết OT
      </span>
      <span className="text-xs font-bold text-orange-600">
        {Number(totalHours || 0).toFixed(2)}h
      </span>
    </div>
    <div className="flex flex-col gap-1.5">
      {details.map(([key, hours]) => (
        <div key={key} className="flex items-center justify-between text-xs">
          <span className="text-gray-600">{OT_TYPE_LABELS[key] || key}</span>
          <span className="font-mono font-bold text-orange-600">
            {Number(hours).toFixed(2)}h
          </span>
        </div>
      ))}
    </div>
  </>
));

OTDetailPopover.displayName = "OTDetailPopover";

const AnnualLeaveDetailPopover = memo(({ leave, historyRows, hasHistorySource }) => (
  <>
    <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
      <span className="text-xs font-bold uppercase text-gray-700">
        Lịch sử phép năm
      </span>
      <span className="font-mono text-xs font-bold text-purple-600">
        {formatLeaveDays(leave?.remaining ?? leave?.currentBalance)}
      </span>
    </div>

    {historyRows.length ? (
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {historyRows.map((item) => (
          <div key={item.key} className="rounded-md border border-gray-100 bg-gray-50 p-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
                  {item.reason}
                </p>
              </div>
              <span
                className={`shrink-0 font-mono text-xs font-bold ${
                  item.tone === "positive"
                    ? "text-green-600"
                    : item.tone === "negative"
                      ? "text-red-600"
                      : "text-gray-500"
                }`}
              >
                {item.amount > 0 ? "+" : ""}
                {formatLeaveDays(item.amount)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-gray-400">
              <span>{item.dateLabel}</span>
              <span>{item.userLabel}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="rounded-md border border-dashed border-gray-200 bg-gray-50 p-3 text-center text-xs text-gray-500">
        {hasHistorySource
          ? "Chưa có lịch sử công phép."
          : "Chưa tải được lịch sử công phép."}
      </div>
    )}
  </>
));

AnnualLeaveDetailPopover.displayName = "AnnualLeaveDetailPopover";

const WORK_BREAKDOWN_LABELS = {
  attendance: "Công chấm thực tế",
  holiday_paid: "Ngày lễ có công",
  paid_leave: "Nghỉ phép có lương",
  statutory_leave: "Nghỉ chế độ",
  rest_day: "Ngày nghỉ luân phiên",
  other: "Điều chỉnh khác",
  excluded_holiday_raw: "Công ngày lễ đã loại trừ",
};

const getWorkBreakdownLabel = (item) =>
  WORK_BREAKDOWN_LABELS[item?.key] || item?.label || "Khác";

const WorkDetailPopover = memo(({ work }) => {
  const breakdown =
    work?.breakdown?.length > 0
      ? work.breakdown
      : [
          {
            key: "attendance",
            label: "Công chấm thực tế",
            days: work?.workedDaysOnly || 0,
            included: true,
          },
          {
            key: "holiday_paid",
            label: "Ngày lễ có công",
            days: work?.holidayPaidDays || 0,
            included: true,
          },
          {
            key: "paid_leave",
            label: "Nghỉ phép có lương",
            days: work?.paidLeaveDays || 0,
            included: true,
          },
        ].filter((item) => toDays(item.days) > 0);

  const includedItems = breakdown.filter((item) => item.included !== false);
  const excludedItems = breakdown.filter((item) => item.included === false);

  return (
    <>
      <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
        <span className="text-xs font-bold uppercase text-gray-700">
          Chi tiết tổng công
        </span>
        <span className="font-mono text-xs font-bold text-blue-600">
          {formatDays(work?.payableWorkDays ?? work?.actualWorkDays)}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {includedItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-2 py-1.5 text-xs">
            <span className="text-gray-700">{getWorkBreakdownLabel(item)}</span>
            <span className="font-mono font-bold text-blue-600">
              +{formatDays(item.days)}
            </span>
          </div>
        ))}
      </div>

      {excludedItems.length > 0 && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          {excludedItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500">
                Không tính: {getWorkBreakdownLabel(item)}
              </span>
              <span className="font-mono font-bold text-gray-400">
                {formatDays(item.days)}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
});

WorkDetailPopover.displayName = "WorkDetailPopover";

StatCard.displayName = "StatCard";

const TimesheetStats = memo(({ timesheetData, attendanceData = [], leaveBalance = null }) => {
  const otBreakdown = useMemo(
    () => getOTBreakdown(timesheetData, attendanceData),
    [timesheetData, attendanceData],
  );
  const otDetails = useMemo(
    () =>
      Object.entries(otBreakdown)
        .filter(([, hours]) => toHours(hours) > 0)
        .sort(([a], [b]) => {
          const indexA = OT_TYPE_ORDER.indexOf(a);
          const indexB = OT_TYPE_ORDER.indexOf(b);
          if (indexA === -1 && indexB === -1) return a.localeCompare(b);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        }),
    [otBreakdown],
  );
  const totalOTHours =
    timesheetData?.overtime?.totalHours ??
    otDetails.reduce((sum, [, hours]) => sum + toHours(hours), 0);
  const annualLeaveHistoryRows = useMemo(
    () => getAnnualLeaveHistoryRows(leaveBalance),
    [leaveBalance],
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Shift Info Card */}
      <Card className="font-bold text-gray-800 border-green-100 flex flex-col justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-wide">
          <Clock size={16} color="green" /> Ca làm việc chuẩn
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="opacity-80">Sáng:</span>
            <span className="font-mono font-bold text-lg">
              {timesheetData?.shift?.morning || "08:00 - 11:30"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-white/10 pt-1">
            <span className="opacity-80">Chiều:</span>
            <span className="font-mono font-bold text-lg">
              {timesheetData?.shift?.afternoon || "13:00 - 17:30"}
            </span>
          </div>
        </div>
      </Card>

      {/* Work Hours */}
      <StatCard
        icon={<Briefcase size={20} />}
        label="Tổng giờ làm"
        value={`${timesheetData?.work?.totalHours || 0}h`}
        sub={`${timesheetData?.work?.actualWorkDays}/ ${timesheetData?.work?.standardWorkDays} công`}
        color="blue"
        detailTitle="Xem chi tiết công"
        detailContent={
          timesheetData?.work ? (
            <WorkDetailPopover work={timesheetData.work} />
          ) : null
        }
      />

      {/* OT Hours */}
      <StatCard
        icon={<Zap size={20} />}
        label="Tổng giờ OT"
        value={`${totalOTHours || 0}h`}
        sub={timesheetData?.overtime?.status || "Chưa có"}
        color="orange"
        detailContent={
          otDetails.length > 0 ? (
            <OTDetailPopover
              totalHours={totalOTHours}
              details={otDetails}
            />
          ) : null
        }
      />

      {/* Leave Days */}
      <StatCard
        icon={<Coffee size={20} />}
        label="Phép năm"
        value={`${timesheetData?.leave?.remaining || 0}/${
          timesheetData?.leave?.totalLimit || 12
        }`}
        sub={`Còn lại: ${timesheetData?.leave?.remaining || 0}`}
        color="purple"
        detailTitle="Xem chi tiết phép năm"
        detailClassName="w-80"
        detailContent={
          timesheetData?.leave ? (
            <AnnualLeaveDetailPopover
              leave={leaveBalance || timesheetData.leave}
              historyRows={annualLeaveHistoryRows}
              hasHistorySource={Boolean(leaveBalance)}
            />
          ) : null
        }
      />

      {/* Late Count */}
      <StatCard
        icon={<AlertCircle size={20} />}
        label="Đi muộn"
        value={`${timesheetData?.late?.count || 0}`}
        sub="Lần vi phạm"
        color="red"
        isWarning={timesheetData?.late?.count > 0}
      />
    </div>
  );
});

TimesheetStats.displayName = "TimesheetStats";

export default TimesheetStats;
