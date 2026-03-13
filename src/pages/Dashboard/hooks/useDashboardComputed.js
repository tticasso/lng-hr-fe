import { useMemo } from "react";
import { leaveTypeMap, otTypeMap } from "../constants";

/**
 * Custom hook để tính toán các giá trị computed trong Dashboard
 */
export const useDashboardComputed = (mySheetData, leaveRequests, otRequests) => {
  // Summary stats cho tháng hiện tại (chỉ trả về data, không có JSX)
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

  // Requests (3 mới nhất)
  const requests = useMemo(() => {
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
        status:ot.status,
        type: "ot",
        rawData: ot,
      })),
    ]
      .sort((a, b) => new Date(b.rawData.createdAt) - new Date(a.rawData.createdAt))
      .slice(0, 3);
  }, [leaveRequests, otRequests]);

  // Counts (pending và approved)
  const { pendingCount, approvedCount } = useMemo(() => {
    console.log("otRequests :",otRequests)
    const allRequests = [
      ...leaveRequests.map((leave) => ({
        status: leave.status,
      })),
      ...otRequests.map((ot) => ({
        status: ot.status,
      })),
    ];

    return {
      pendingCount: allRequests.filter((r) => r.status === "PENDING").length,
      approvedCount: allRequests.filter((r) => r.status === "APPROVED").length,
    };
  }, [leaveRequests, otRequests]);

  return {
    summaryStats,
    requests,
    pendingCount,
    approvedCount,
  };
};
