import { useMemo } from "react";

const pad2 = (n) => String(n).padStart(2, "0");

const LEAVE_ATTENDANCE_STATUSES = new Set([
  "PAID_LEAVE",
  "UNPAID_LEAVE",
  "SICK_LEAVE",
  "MATERNITY_LEAVE",
  "PATERNITY_LEAVE",
]);

const ACTIVE_REQUEST_STATUSES = new Set(["PENDING", "APPROVED"]);

const EMPLOYER_PAID_LEAVE_TYPES = new Set([
  "ANNUAL",
  "BEREAVEMENT",
  "WEDDING",
  "PERSONAL_PAID",
]);

const STATUTORY_LEAVE_STATUS_BY_TYPE = {
  SICK: "SICK_LEAVE",
  MATERNITY: "MATERNITY_LEAVE",
  PATERNITY: "PATERNITY_LEAVE",
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toISODateKey = (value) => {
  if (!value) return null;

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${pad2(parsed.getMonth() + 1)}-${pad2(parsed.getDate())}`;
    }
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
  }

  return null;
};

const getRecordDateKey = (record) =>
  toISODateKey(record?.date || record?.workDate || record?.isoDate || record?.day);

const dateKeyToLocalDate = (dateKey) => {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const getDateRangeKeys = (fromDate, toDate = fromDate) => {
  const startKey = toISODateKey(fromDate);
  const endKey = toISODateKey(toDate || fromDate);
  const cursor = dateKeyToLocalDate(startKey);
  const end = dateKeyToLocalDate(endKey);

  if (!cursor || !end || cursor > end) return [];

  const keys = [];
  let guard = 0;

  while (cursor <= end && guard < 370) {
    keys.push(`${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`);
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }

  return keys;
};

const getLeaveAttendanceStatus = (leave) => {
  if (!leave) return null;
  if (STATUTORY_LEAVE_STATUS_BY_TYPE[leave.leaveType]) {
    return STATUTORY_LEAVE_STATUS_BY_TYPE[leave.leaveType];
  }
  if (EMPLOYER_PAID_LEAVE_TYPES.has(leave.leaveType)) return "PAID_LEAVE";
  return "UNPAID_LEAVE";
};

const isActiveRequest = (request) =>
  !request?.status || ACTIVE_REQUEST_STATUSES.has(request.status);

const buildLeaveMap = (leaveRequests = []) => {
  const map = {};

  leaveRequests.filter(isActiveRequest).forEach((leave) => {
    getDateRangeKeys(leave.fromDate || leave.date, leave.toDate || leave.date).forEach((dateKey) => {
      const current = map[dateKey];
      if (!current || leave.status === "APPROVED") {
        map[dateKey] = leave;
      }
    });
  });

  return map;
};

const buildOTMap = (otRequests = []) => {
  const map = {};

  otRequests.filter(isActiveRequest).forEach((ot) => {
    const dateKey = toISODateKey(ot.date);
    if (!dateKey) return;
    map[dateKey] = [...(map[dateKey] || []), ot];
  });

  return map;
};

const buildAttendanceMap = (attendanceData = []) => {
  const map = {};

  attendanceData.forEach((record) => {
    const dateKey = getRecordDateKey(record);
    if (dateKey) map[dateKey] = record;
  });

  return map;
};

const getHolidayName = (holiday) =>
  holiday?.name || holiday?.title || holiday?.holidayName || holiday?.description || "";

const buildHolidayMap = (holidayData = [], attendanceData = []) => {
  const map = {};

  holidayData.forEach((holiday) => {
    const dateKey = toISODateKey(holiday.date);
    if (dateKey) map[dateKey] = holiday;
  });

  attendanceData.forEach((record) => {
    const dateKey = getRecordDateKey(record);
    const holiday = record?.holidayId;
    const holidayName = getHolidayName(holiday) || record?.holidayName;

    if (dateKey && (record?.status === "HOLIDAY" || holidayName)) {
      map[dateKey] = {
        ...(map[dateKey] || {}),
        ...(typeof holiday === "object" ? holiday : {}),
        date: record.date,
        name: holidayName || getHolidayName(map[dateKey]),
        holidayType: holiday?.holidayType || map[dateKey]?.holidayType || "PUBLIC_HOLIDAY",
        isWorkDay: holiday?.isWorkDay ?? map[dateKey]?.isWorkDay ?? false,
      };
    }
  });

  return map;
};

const sumOTBreakdown = (breakdown) => {
  if (!breakdown || typeof breakdown !== "object") return 0;
  return Object.values(breakdown).reduce((sum, hours) => sum + toNumber(hours), 0);
};

const dedupeOTRequests = (requests = []) => {
  const map = new Map();

  requests.filter(Boolean).forEach((request, index) => {
    const key = request._id || request.id || `${request.date || ""}-${request.startTime || ""}-${request.endTime || ""}-${index}`;
    map.set(String(key), request);
  });

  return Array.from(map.values());
};

const getOTHoursFromRequests = (requests = []) =>
  requests.reduce((sum, ot) => {
    const approvedHours = toNumber(ot.approvedHours);
    const requestedHours = toNumber(ot.totalHours);
    return sum + (approvedHours || requestedHours);
  }, 0);

const buildOTTimeRanges = (requests = []) =>
  requests.map((ot) => ({
    startTime: ot.approvedStartTime || ot.startTime || null,
    endTime: ot.approvedEndTime || ot.endTime || null,
    otType: ot.otType,
    totalHours: ot.totalHours,
    approvedHours: ot.approvedHours,
    status: ot.status,
    reason: ot.reason,
  }));

export const useCalendarData = (
  selectedMonth,
  selectedYear,
  todayInfo,
  attendanceData,
  holidayData,
  leaveRequests = [],
  otRequests = [],
) => {
  const calendarDays = useMemo(() => {
    const days = [];
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i += 1) {
      days.push({ day: 0, inMonth: false });
    }

    const attendanceMap = buildAttendanceMap(attendanceData);
    const holidayMap = buildHolidayMap(holidayData, attendanceData);
    const leaveMap = buildLeaveMap(leaveRequests);
    const otMap = buildOTMap(otRequests);

    for (let i = 1; i <= daysInMonth; i += 1) {
      const dateObj = new Date(selectedYear, selectedMonth, i);
      const dayOfWeek = dateObj.getDay();
      const isoDate = `${selectedYear}-${pad2(selectedMonth + 1)}-${pad2(i)}`;

      const apiData = attendanceMap[isoDate] || null;
      const leaveInfo = apiData?.leaveId || apiData?.leaveRequest || leaveMap[isoDate] || null;
      const overtimeRequests = dedupeOTRequests([
        ...(Array.isArray(apiData?.overtimeId) ? apiData.overtimeId : []),
        ...(otMap[isoDate] || []),
      ]);
      const holidayInfo = holidayMap[isoDate];

      let type = "work";
      const status = [];
      const checkIn = apiData?.checkIn || null;
      const checkOut = apiData?.checkOut || null;
      const lateMinutes = toNumber(apiData?.lateMinutes);
      const earlyMinutes = toNumber(apiData?.earlyMinutes);
      let holidayName = "";

      if (holidayInfo) {
        const holidayType = holidayInfo.holidayType || holidayInfo.type;
        type =
          holidayType === "SUBSTITUTE_WORK_DAY" || holidayInfo.isWorkDay
            ? "substitute_work"
            : "holiday";
        holidayName = getHolidayName(holidayInfo);
      } else if (!apiData && !leaveInfo && dayOfWeek === 0) {
        type = "weekend";
      }

      if (apiData?.isRotationOff || apiData?.status === "OFF" || apiData?.status === "REST_DAY") {
        type = "rotation_off";
        status.push("rotation_off");
      } else if (!holidayInfo) {
        if (LEAVE_ATTENDANCE_STATUSES.has(apiData?.status) || leaveInfo) {
          type = "leave";
          status.push("leave");
        } else if (apiData?.status === "ABSENT") {
          type = "work";
          status.push("absent");
        } else if (!apiData && dayOfWeek === 6) {
          type = "weekend";
        }
      }

      if (lateMinutes > 0) status.push("late");
      if (earlyMinutes > 0) status.push("early");

      const finalOTHours = sumOTBreakdown(apiData?.finalOtHours);
      const requestOTHours = getOTHoursFromRequests(overtimeRequests);
      const otHours = finalOTHours || requestOTHours;
      const otTimeRanges = buildOTTimeRanges(overtimeRequests);

      if (otHours > 0 || otTimeRanges.length > 0) {
        status.push("ot");
      }

      const isToday =
        i === todayInfo.day &&
        selectedMonth === todayInfo.month &&
        selectedYear === todayInfo.year;

      const effectiveApiData = apiData || (leaveInfo || overtimeRequests.length
        ? {
            date: isoDate,
            status: leaveInfo ? getLeaveAttendanceStatus(leaveInfo) : "PRESENT",
            leaveId: leaveInfo,
            overtimeId: overtimeRequests,
          }
        : null);

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
        apiData: effectiveApiData,
        holidayInfo,
        leaveInfo,
      });
    }

    return days;
  }, [
    selectedMonth,
    selectedYear,
    todayInfo,
    attendanceData,
    holidayData,
    leaveRequests,
    otRequests,
  ]);

  return { calendarDays };
};
