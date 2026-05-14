import { useMemo } from "react";
import { leaveTypeMap, otTypeMap } from "../constants";

export const useDashboardComputed = (mySheetData, leaveRequests, otRequests, hrRequestsSummary = null) => {
  const summaryStats = useMemo(
    () => [
      {
        label: "Ngày công thực tế",
        value: mySheetData?.work?.actualWorkDays?.toFixed(2) || "0.00",
        unit: "công",
        iconType: "briefcase",
        bg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        label: "Giờ tăng ca (OT)",
        value: mySheetData?.overtime?.totalHours?.toFixed(2) || "0.00",
        unit: "giờ",
        iconType: "clock",
        bg: "bg-orange-100",
        iconColor: "text-orange-600",
      },
      {
        label: "Phép năm còn lại",
        value: mySheetData?.leave?.remaining?.toFixed(2) || "0.00",
        unit: "ngày",
        iconType: "coffee",
        bg: "bg-green-100",
        iconColor: "text-green-600",
      },
    ],
    [mySheetData]
  );

  const requests = useMemo(() => {
    if (hrRequestsSummary?.requests) {
      return hrRequestsSummary.requests.map((request) => ({
        id: request.id,
        title: `${request.type === "LEAVE" ? (leaveTypeMap[request.title] || request.title) : (otTypeMap[request.title] || request.title)} - ${request.employee?.fullName || "Unknown"}`,
        date: request.date ? new Date(request.date).toLocaleDateString("vi-VN") : "--",
        status: request.status,
        type: request.type?.toLowerCase(),
        rawData: request,
      }));
    }

    return [
      ...leaveRequests.map((leave) => ({
        id: leave._id,
        title: leaveTypeMap[leave.leaveType] || leave.leaveType,
        date: new Date(leave.createdAt).toLocaleDateString("vi-VN"),
        status: leave.status,
        type: "leave",
        rawData: leave,
      })),
      ...otRequests.map((ot) => ({
        id: ot._id,
        title: otTypeMap[ot.otType] || ot.otType,
        date: new Date(ot.createdAt).toLocaleDateString("vi-VN"),
        status: ot.status,
        type: "ot",
        rawData: ot,
      })),
    ]
      .sort((a, b) => new Date(b.rawData.createdAt) - new Date(a.rawData.createdAt))
      .slice(0, 3);
  }, [leaveRequests, otRequests, hrRequestsSummary]);

  const { pendingCount, approvedCount, rejectedCount, cancelledCount } = useMemo(() => {
    if (hrRequestsSummary?.summary) {
      return {
        pendingCount: hrRequestsSummary.summary.pending?.total || 0,
        approvedCount: hrRequestsSummary.summary.approved?.total || 0,
        rejectedCount: hrRequestsSummary.summary.rejected?.total || 0,
        cancelledCount: hrRequestsSummary.summary.cancelled?.total || 0,
      };
    }

    const allRequests = [
      ...leaveRequests.map((leave) => ({ status: leave.status })),
      ...otRequests.map((ot) => ({ status: ot.status })),
    ];

    return {
      pendingCount: allRequests.filter((request) => request.status === "PENDING").length,
      approvedCount: allRequests.filter((request) => request.status === "APPROVED").length,
      rejectedCount: allRequests.filter((request) => request.status === "REJECTED" || request.status === "Rejected").length,
      cancelledCount: allRequests.filter((request) => request.status === "CANCELLED").length,
    };
  }, [leaveRequests, otRequests, hrRequestsSummary]);

  return {
    summaryStats,
    requests,
    pendingCount,
    approvedCount,
    rejectedCount,
    cancelledCount,
  };
};
