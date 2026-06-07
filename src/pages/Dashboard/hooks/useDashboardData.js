import { useState, useEffect } from "react";
import { attendancesAPI } from "../../../apis/attendancesAPI";
import { leaveAPI } from "../../../apis/leaveAPI";
import { OTApi } from "../../../apis/OTAPI";
import { announcementAPI } from "../../../apis/announcements";
import { dashboardAPI } from "../../../apis/dashboardAPI";
import { getAnnouncementDashboardMeta } from "../../../shared/announcementSchedule";
import { hasAnyPermission } from "../../../utils/authPermissions";
import { ACCESS, ACCESS_GROUPS } from "../../../config/accessControl";

const DASHBOARD_REQUEST_LIMIT = 5;
const DASHBOARD_ANNOUNCEMENT_LIMIT = 3;
const DASHBOARD_EVENT_LIMIT = 4;
const DASHBOARD_LATE_ATTENDANCE_LIMIT = 5;
const DASHBOARD_DAILY_ALERT_LIMIT = 5;

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getRoleName = (user) => user?.accountId?.role?.name || user?.role?.name || user?.role || "";

export const isHRDashboardUser = (user) =>
  hasAnyPermission(user, [
    ...ACCESS_GROUPS.PAYROLL_OPS,
    ...ACCESS.EMPLOYEES,
    ...ACCESS.LEAVE_BALANCE,
    ...ACCESS.HR_DASHBOARD,
  ]);

const canReadAttendance = (user) => {
  const roleName = getRoleName(user);
  if (["ADMIN", "HR", "MANAGER", "LEADER", "DIRECTOR"].includes(roleName)) return true;

  return hasAnyPermission(user, ACCESS.ATTENDANCE_ADMIN);
};

export const useDashboardData = (user, selectedDate = formatLocalDate(new Date())) => {
  const [mySheetData, setMySheetData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOTRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [hrOverview, setHROverview] = useState(null);
  const [hrRequestsSummary, setHRRequestsSummary] = useState(null);
  const [lateAttendanceDashboard, setLateAttendanceDashboard] = useState(null);
  const [absentAttendanceDashboard, setAbsentAttendanceDashboard] = useState(null);
  const [missingCheckOutDashboard, setMissingCheckOutDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Critical data for above-the-fold widgets. Do not block the dashboard on secondary lists.
        const resMySheet = await attendancesAPI.getdatamoth(month, year);
        if (!isMounted) return;

        setMySheetData(resMySheet.data.data);
        setLoading(false);

        const secondaryRequests = [
          isHRDashboardUser(user)
            ? Promise.resolve({ data: { data: [] } })
            : leaveAPI.getbyUSER(1, DASHBOARD_REQUEST_LIMIT),
          isHRDashboardUser(user)
            ? Promise.resolve({ data: { data: [] } })
            : OTApi.getMy({ page: 1, limit: DASHBOARD_REQUEST_LIMIT }),
          isHRDashboardUser(user)
            ? Promise.resolve({ data: { data: [] } })
            : announcementAPI.get({ page: 1, limit: DASHBOARD_ANNOUNCEMENT_LIMIT }),
          isHRDashboardUser(user)
            ? Promise.resolve({ data: { data: [] } })
            : dashboardAPI.getUpcomingEvents({ limit: DASHBOARD_EVENT_LIMIT, days: 90 }),
          isHRDashboardUser(user)
            ? dashboardAPI.getHRRequestsSummary({ page: 1, limit: DASHBOARD_REQUEST_LIMIT })
            : Promise.resolve({ data: { data: null } }),
        ];

        if (canReadAttendance(user)) {
          const dailyAttendanceParams = {
            date: selectedDate,
            page: 1,
            limit: DASHBOARD_DAILY_ALERT_LIMIT,
          };

          secondaryRequests.push(
            isHRDashboardUser(user)
              ? dashboardAPI.getHROverview({ date: dailyAttendanceParams.date })
              : Promise.resolve({ data: { data: null } })
          );

          secondaryRequests.push(
            dashboardAPI.getLateAttendances({
              ...dailyAttendanceParams,
              limit: DASHBOARD_LATE_ATTENDANCE_LIMIT,
            }),
            dashboardAPI.getAbsentAttendances(dailyAttendanceParams),
            dashboardAPI.getMissingCheckOuts(dailyAttendanceParams)
          );
        }

        const [
          leaveResult,
          otResult,
          announcementResult,
          eventResult,
          hrRequestsResult,
          hrOverviewResult,
          lateAttendanceResult,
          absentAttendanceResult,
          missingCheckOutResult,
        ] = await Promise.allSettled(secondaryRequests);

        if (!isMounted) return;

        if (leaveResult.status === "fulfilled") {
          setLeaveRequests(leaveResult.value.data?.data || []);
        }

        if (otResult.status === "fulfilled") {
          setOTRequests(otResult.value.data?.data || []);
        }

        if (announcementResult.status === "fulfilled") {
          const latestAnnouncements = (announcementResult.value.data?.data || [])
            .slice(0, DASHBOARD_ANNOUNCEMENT_LIMIT)
            .map((item) => {
              const { tag, type } = getAnnouncementDashboardMeta(item);

              return {
                id: item._id,
                title: item.title,
                date: new Date(item.createdAt).toLocaleDateString("vi-VN"),
                tag,
                type,
                rawData: item,
              };
            });

          setAnnouncements(latestAnnouncements);
        }

        if (eventResult.status === "fulfilled") {
          setUpcomingEvents(eventResult.value.data?.data || []);
        } else {
          setUpcomingEvents([]);
        }

        if (hrRequestsResult?.status === "fulfilled") {
          setHRRequestsSummary(hrRequestsResult.value.data?.data || null);
        } else {
          setHRRequestsSummary(null);
        }

        if (hrOverviewResult?.status === "fulfilled") {
          setHROverview(hrOverviewResult.value.data?.data || null);
        } else {
          setHROverview(null);
        }

        if (lateAttendanceResult?.status === "fulfilled") {
          setLateAttendanceDashboard(lateAttendanceResult.value.data?.data || null);
        } else {
          setLateAttendanceDashboard(null);
        }

        if (absentAttendanceResult?.status === "fulfilled") {
          setAbsentAttendanceDashboard(absentAttendanceResult.value.data?.data || null);
        } else {
          setAbsentAttendanceDashboard(null);
        }

        if (missingCheckOutResult?.status === "fulfilled") {
          setMissingCheckOutDashboard(missingCheckOutResult.value.data?.data || null);
        } else {
          setMissingCheckOutDashboard(null);
        }
      } catch (err) {
        console.error("Dashboard API ERROR:", err);
        if (isMounted) {
          setError(err);
          setMySheetData(null);
          setLeaveRequests([]);
          setOTRequests([]);
          setAnnouncements([]);
          setUpcomingEvents([]);
          setHROverview(null);
          setHRRequestsSummary(null);
          setLateAttendanceDashboard(null);
          setAbsentAttendanceDashboard(null);
          setMissingCheckOutDashboard(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, user]);

  return {
    mySheetData,
    leaveRequests,
    otRequests,
    announcements,
    upcomingEvents,
    hrOverview,
    hrRequestsSummary,
    lateAttendanceDashboard,
    absentAttendanceDashboard,
    missingCheckOutDashboard,
    loading,
    error,
  };
};
