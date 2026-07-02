import { useState, useEffect } from "react";
import { attendancesAPI } from "../../../apis/attendancesAPI";
import { holidayAPI } from "../../../apis/holidayAPI";
import { leaveAPI } from "../../../apis/leaveAPI";
import { leavebalanceAPI } from "../../../apis/leavebalaneAPI";
import { OTApi } from "../../../apis/OTAPI";

const pad2 = (n) => String(n).padStart(2, "0");

const getResponsePayload = (response) => response?.data?.data ?? response?.data;

const asArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getDailyAttendanceFromTimesheet = (payload) => {
  const candidates = [
    payload?.attendances,
    payload?.attendanceData,
    payload?.attendanceRecords,
    payload?.dailyAttendances,
    payload?.dailyRecords,
    payload?.records,
    payload?.days,
    payload?.calendarDays,
  ];

  return candidates.find(Array.isArray) || [];
};

const getDateKey = (record) => {
  const value = record?.date || record?.workDate || record?.isoDate || record?.day;
  if (!value) return null;
  if (typeof value === "string") return value.split("T")[0];
  if (value instanceof Date) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }
  return null;
};

const mergeAttendanceRecords = (...recordGroups) => {
  const map = new Map();

  recordGroups.flat().forEach((record) => {
    const dateKey = getDateKey(record);
    if (!dateKey) return;
    map.set(dateKey, {
      ...(map.get(dateKey) || {}),
      ...record,
    });
  });

  return Array.from(map.values()).sort((a, b) => {
    const aKey = getDateKey(a) || "";
    const bKey = getDateKey(b) || "";
    return aKey.localeCompare(bKey);
  });
};

/**
 * Custom hook để fetch tất cả data cho Timesheet
 */
export const useTimesheetData = (selectedMonth, selectedYear) => {
  const [timesheetData, setTimesheetData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidayData, setHolidayData] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [otRequests, setOTRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAllTimesheetData = async () => {
      try {
        setLoading(true);
        setError(null);

        const month = selectedMonth + 1; // 0-11 → 1-12
        const year = selectedYear;

        // Tính startDate và endDate cho tháng
        const startDate = `${year}-${pad2(month)}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${pad2(month)}-${pad2(lastDay)}`;

        // Fetch tất cả data song song
        const [
          resTimesheet,
          resAttendance,
          resHoliday,
          resLeaveRequests,
          resLeaveBalance,
          resOTRequests,
        ] = await Promise.all([
          attendancesAPI.getdatamoth(month, year),
          attendancesAPI.getme(month, year),
          holidayAPI.get(startDate, endDate),
          leaveAPI.getbyUSER(1, 100).catch(() => null),
          leavebalanceAPI.getMine().catch(() => null),
          OTApi.getMy({ page: 1, limit: 100, month, year }).catch(() => null),
        ]);

        if (isMounted) {
          const timesheetPayload = getResponsePayload(resTimesheet);
          const attendancePayload = getResponsePayload(resAttendance);
          const holidayPayload = getResponsePayload(resHoliday);

          setTimesheetData(timesheetPayload);
          setAttendanceData(
            mergeAttendanceRecords(
              asArray(attendancePayload),
              getDailyAttendanceFromTimesheet(timesheetPayload),
            ),
          );
          setHolidayData(asArray(holidayPayload));
          setLeaveRequests(asArray(getResponsePayload(resLeaveRequests)));
          setLeaveBalance(getResponsePayload(resLeaveBalance) || null);
          setOTRequests(asArray(getResponsePayload(resOTRequests)));
        }
      } catch (err) {
        console.error("Timesheet API ERROR:", err);
        if (isMounted) {
          setError(err);
          setTimesheetData(null);
          setAttendanceData([]);
          setHolidayData([]);
          setLeaveRequests([]);
          setLeaveBalance(null);
          setOTRequests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAllTimesheetData();

    return () => {
      isMounted = false;
    };
  }, [selectedMonth, selectedYear]);

  return {
    timesheetData,
    attendanceData,
    holidayData,
    leaveRequests,
    leaveBalance,
    otRequests,
    loading,
    error,
  };
};
