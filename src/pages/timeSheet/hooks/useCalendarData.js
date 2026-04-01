import { useMemo } from "react";

/**
 * Custom hook để generate calendar data từ attendance và holiday data
 */
export const useCalendarData = (
  selectedMonth,
  selectedYear,
  todayInfo,
  attendanceData,
  holidayData
) => {
  const pad2 = (n) => String(n).padStart(2, "0");

  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Padding ngày tháng trước
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: 0, inMonth: false });
    }

    // Tạo map từ API data
    const attendanceMap = {};
    attendanceData.forEach((record) => {
      let dateKey;
      if (record.date) {
        if (typeof record.date === "string") {
          dateKey = record.date.split("T")[0];
        } else if (record.date instanceof Date) {
          const d = record.date;
          dateKey = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }
      }
      if (dateKey) {
        attendanceMap[dateKey] = record;
      }
    });

    // Tạo map cho holiday data
    const holidayMap = {};
    holidayData.forEach((holiday) => {
      let dateKey;
      if (holiday.date) {
        if (typeof holiday.date === "string") {
          dateKey = holiday.date.split("T")[0];
        } else if (holiday.date instanceof Date) {
          const d = holiday.date;
          dateKey = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        }
      }
      if (dateKey) {
        holidayMap[dateKey] = holiday;
      }
    });

    // Generate days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateObj = new Date(selectedYear, selectedMonth, i);
      const dayOfWeek = dateObj.getDay();
      const isoDate = `${selectedYear}-${pad2(selectedMonth + 1)}-${pad2(i)}`;

      const apiData = attendanceMap[isoDate];
      const holidayInfo = holidayMap[isoDate];

      let type = "work";
      let status = [];
      let checkIn = null;
      let checkOut = null;
      let otHours = 0;
      let otTimeRanges = [];
      let holidayName = "";
      let lateMinutes = 0;
      let earlyMinutes = 0;

      // Kiểm tra ngày lễ
      if (holidayInfo) {
        type =
          holidayInfo.holidayType === "SUBSTITUTE_WORK_DAY"
            ? "substitute_work"
            : "holiday";
        holidayName = holidayInfo.name;
      } else if (!apiData && (dayOfWeek === 0 || dayOfWeek === 6)) {
        type = "weekend";
      }

      // Xử lý dữ liệu từ API
      if (apiData) {
        checkIn = apiData.checkIn || null;
        checkOut = apiData.checkOut || null;
        lateMinutes = apiData.lateMinutes || 0;
        earlyMinutes = apiData.earlyMinutes || 0;

        // Kiểm tra nghỉ luân phiên
        if (apiData.isRotationOff && apiData.status === "OFF") {
          type = "rotation_off";
          status.push("rotation_off");
        } else if (!holidayInfo) {
          if (apiData.status === "PAID_LEAVE" || apiData.status === "UNPAID_LEAVE") {
            type = "leave";
            status.push("leave");
          } else if (apiData.status === "PRESENT") {
            type = "work";
          } else if (apiData.status === "ABSENT") {
            type = "work";
            status.push("absent");
          }
        }

        if (lateMinutes > 0) status.push("late");
        if (earlyMinutes > 0) status.push("early");

        const totalOT =
          (apiData.finalOtHours?.weekday || 0) +
          (apiData.finalOtHours?.weekend || 0) +
          (apiData.finalOtHours?.holiday || 0);

        if (apiData.overtimeId && Array.isArray(apiData.overtimeId) && apiData.overtimeId.length > 0) {
          otTimeRanges = apiData.overtimeId.map((ot) => ({
            startTime: ot.approvedStartTime || ot.startTime,
            endTime: ot.approvedEndTime || ot.endTime,
            otType: ot.otType,
            totalHours: ot.totalHours,
            approvedHours: ot.approvedHours,
            status: ot.status,
          }));
          status.push("ot");
          otHours = totalOT;
        } else if (totalOT > 0) {
          status.push("ot");
          otHours = totalOT;
        }
      }

      const isToday =
        i === todayInfo.day &&
        selectedMonth === todayInfo.month &&
        selectedYear === todayInfo.year;

      days.push({
        day: i,
        inMonth: true,
        isToday,
        type,
        status,
        checkIn,
        checkOut,
        otHours,
        otTimeRanges,
        holidayName,
        lateMinutes,
        earlyMinutes,
        fullDate: `${pad2(i)}/${pad2(selectedMonth + 1)}/${selectedYear}`,
        isoDate,
        apiData,
        holidayInfo,
        leaveInfo: apiData?.leaveId || null,
      });
    }

    return days;
  }, [selectedMonth, selectedYear, todayInfo, attendanceData, holidayData]);

  return { calendarDays };
};
