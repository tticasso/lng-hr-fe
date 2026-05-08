import { useState, useEffect } from "react";
import { attendancesAPI } from "../../../apis/attendancesAPI";
import { leaveAPI } from "../../../apis/leaveAPI";
import { OTApi } from "../../../apis/OTAPI";
import { announcementAPI } from "../../../apis/announcements";
import { dashboardAPI } from "../../../apis/dashboardAPI";
import { getAnnouncementDashboardMeta } from "../../../shared/announcementSchedule";

const DASHBOARD_REQUEST_LIMIT = 5;
const DASHBOARD_ANNOUNCEMENT_LIMIT = 3;
const DASHBOARD_EVENT_LIMIT = 4;

export const useDashboardData = () => {
  const [mySheetData, setMySheetData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOTRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
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

        const [leaveResult, otResult, announcementResult, eventResult] = await Promise.allSettled([
          leaveAPI.getbyUSER(1, DASHBOARD_REQUEST_LIMIT),
          OTApi.getMy({ page: 1, limit: DASHBOARD_REQUEST_LIMIT }),
          announcementAPI.get({ page: 1, limit: DASHBOARD_ANNOUNCEMENT_LIMIT }),
          dashboardAPI.getUpcomingEvents({ limit: DASHBOARD_EVENT_LIMIT, days: 90 }),
        ]);

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
      } catch (err) {
        console.error("Dashboard API ERROR:", err);
        if (isMounted) {
          setError(err);
          setMySheetData(null);
          setLeaveRequests([]);
          setOTRequests([]);
          setAnnouncements([]);
          setUpcomingEvents([]);
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
  }, []);

  return {
    mySheetData,
    leaveRequests,
    otRequests,
    announcements,
    upcomingEvents,
    loading,
    error,
  };
};
