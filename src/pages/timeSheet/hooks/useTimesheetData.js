import { useState, useEffect } from "react";
import { attendancesAPI } from "../../../apis/attendancesAPI";
import { holidayAPI } from "../../../apis/holidayAPI";

/**
 * Custom hook để fetch tất cả data cho Timesheet
 */
export const useTimesheetData = (selectedMonth, selectedYear) => {
  const [timesheetData, setTimesheetData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [holidayData, setHolidayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pad2 = (n) => String(n).padStart(2, "0");

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
        const [resTimesheet, resAttendance, resHoliday] = await Promise.all([
          attendancesAPI.getdatamoth(month, year),
          attendancesAPI.getme(month, year),
          holidayAPI.get(startDate, endDate),
        ]);

        if (isMounted) {
          setTimesheetData(resTimesheet.data.data);
          setAttendanceData(resAttendance.data.data || []);
          setHolidayData(resHoliday.data?.data || []);
        }
      } catch (err) {
        console.error("Timesheet API ERROR:", err);
        if (isMounted) {
          setError(err);
          setTimesheetData(null);
          setAttendanceData([]);
          setHolidayData([]);
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
    loading,
    error,
  };
};
