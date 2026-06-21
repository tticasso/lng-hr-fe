import { memo } from "react";

import { ROUTES } from "../../config/routes";
import DailyAbsentAttendances from "./DailyAbsentAttendances";
import DailyLateAttendances from "./DailyLateAttendances";
import DailyMissingCheckOuts from "./DailyMissingCheckOuts";
import RequestsTable from "./RequestsTable";
import AttendanceHealthCard from "./AttendanceHealthCard";
import HRAnalyticsCharts from "./HRAnalyticsCharts";
import HRAnalyticsOverview from "./HRAnalyticsOverview";
import RequestAnalyticsCard from "./RequestAnalyticsCard";

const HRAnalyticsDashboard = memo(({
  hrOverview,
  hrRequestsSummary,
  requests,
  pendingCount,
  approvedCount,
  rejectedCount,
  cancelledCount,
  lateAttendanceDashboard,
  absentAttendanceDashboard,
  missingCheckOutDashboard,
  selectedDate,
  maxDate,
  onDateChange,
  onResetDate,
  onDailyAlertOpen,
  onNavigate,
}) => {
  const requestCounts = {
    pendingCount,
    approvedCount,
    rejectedCount,
    cancelledCount,
    requests,
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <HRAnalyticsOverview
        hrOverview={hrOverview}
        selectedDate={selectedDate}
        maxDate={maxDate}
        onDateChange={onDateChange}
        onResetDate={onResetDate}
      />

      <HRAnalyticsCharts
        hrOverview={hrOverview}
        hrRequestsSummary={hrRequestsSummary}
        counts={requestCounts}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <AttendanceHealthCard
          hrOverview={hrOverview}
          onViewAttendance={() => onNavigate(ROUTES.ATTENDANCE)}
        />
        <RequestAnalyticsCard
          hrRequestsSummary={hrRequestsSummary}
          counts={requestCounts}
          onViewRequests={() => onNavigate(ROUTES.REQUESTS)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-12">
          <RequestsTable
            requests={requests}
            pendingCount={pendingCount}
            approvedCount={approvedCount}
            rejectedCount={rejectedCount}
            cancelledCount={cancelledCount}
            title="Request queue mới nhất"
            emptyText="Chưa có request nào cần hiển thị"
            buttonLabel="Xem toàn bộ request"
            onNavigate={() => onNavigate(ROUTES.REQUESTS)}
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Bất thường trong ngày</h2>
            <p className="text-sm text-slate-500">
              Các danh sách cần HR kiểm tra trước khi chốt công hoặc xử lý request.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 lg:gap-6">
          <DailyLateAttendances
            data={lateAttendanceDashboard}
            onViewAll={() => onDailyAlertOpen("late")}
          />
          <DailyAbsentAttendances
            data={absentAttendanceDashboard}
            onViewAll={() => onDailyAlertOpen("absent")}
          />
          <DailyMissingCheckOuts
            data={missingCheckOutDashboard}
            onViewAll={() => onDailyAlertOpen("missingCheckOut")}
          />
        </div>
      </div>
    </div>
  );
});

HRAnalyticsDashboard.displayName = "HRAnalyticsDashboard";

export default HRAnalyticsDashboard;
