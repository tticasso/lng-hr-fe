import { useState, useEffect } from "react";
import { attendancesAPI } from "../../../apis/attendancesAPI";
import { leaveAPI } from "../../../apis/leaveAPI";
import { OTApi } from "../../../apis/OTAPI";
import { announcementAPI } from "../../../apis/announcements";

/**
 * Custom hook để fetch tất cả data cho Dashboard
 * Gộp tất cả API calls chạy song song
 */
export const useDashboardData = () => {
  const [mySheetData, setMySheetData] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOTRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        // Chạy song song tất cả API calls
        const [resMySheet, resLeave, resOT, resAnnouncement] = await Promise.all([
          attendancesAPI.getdatamoth(month, year),
          leaveAPI.getbyUSER(),
          OTApi.get(),
          announcementAPI.get(),
        ]);

        if (isMounted) {
          setMySheetData(resMySheet.data.data);
          setLeaveRequests(resLeave.data.data || []);
          setOTRequests(resOT.data.data || []);

          // Process announcements
          const latestAnnouncements = (resAnnouncement.data.data || [])
            .slice(0, 3)
            .map((item) => {
              let tag = "News";
              let type = "success";

              if (item.category === "SCHEDULED") {
                tag = "Scheduled";
                type = "primary";
              } else if (item.category === "EVENT") {
                tag = "Event";
                type = "primary";
              } else if (item.category === "NEWS") {
                tag = "News";
                type = "success";
              }

              if (item.priority === "URGENT") {
                type = "error";
                tag = "Important";
              } else if (item.priority === "HIGH") {
                type = "error";
              }

              return {
                id: item._id,
                title: item.title,
                date: new Date(item.createdAt).toLocaleDateString("vi-VN"),
                tag: tag,
                type: type,
                rawData: item,
              };
            });

          setAnnouncements(latestAnnouncements);
        }
      } catch (err) {
        console.error("Dashboard API ERROR:", err);
        if (isMounted) {
          setError(err);
          setMySheetData(null);
          setLeaveRequests([]);
          setOTRequests([]);
          setAnnouncements([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    mySheetData,
    leaveRequests,
    otRequests,
    announcements,
    loading,
    error,
  };
};
