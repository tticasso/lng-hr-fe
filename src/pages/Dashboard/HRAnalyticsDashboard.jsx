import { memo } from "react";

import { ROUTES } from "../../config/routes";
import RequestsTable from "./RequestsTable";
import AttendanceInsightsDashboard from "./AttendanceInsightsDashboard";
import HRAnalyticsCharts from "./HRAnalyticsCharts";
import HRAnalyticsOverview from "./HRAnalyticsOverview";

const HRAnalyticsDashboard = memo(({
  hrOverview,
  hrRequestsSummary,
  requests,
  pendingCount,
  approvedCount,
  rejectedCount,
  cancelledCount,
  selectedDate,
  maxDate,
  onDateChange,
  onResetDate,
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

      <AttendanceInsightsDashboard
        selectedDate={selectedDate}
        onNavigateAttendance={() => onNavigate(ROUTES.ATTENDANCE)}
      />

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
    </div>
  );
});

HRAnalyticsDashboard.displayName = "HRAnalyticsDashboard";

export default HRAnalyticsDashboard;
