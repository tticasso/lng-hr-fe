import { useMemo, useState, lazy, Suspense } from "react";
import { toast } from "react-toastify";

import {
  useTimesheetData,
  useTimesheetModals,
  useCalendarData,
  useMonthNavigation,
} from "./hooks";

import {
  TimesheetHeader,
  TimesheetStats,
  CalendarGrid,
  DayDetailPanel,
  CalendarLegend,
  TimesheetAttendanceTable,
} from "./components";

const LeaveRequestModal = lazy(() => import("../../components/modals/CreateLeaveModal"));
const ModalOT = lazy(() => import("../../components/modals/OTModal"));

const MyTimesheet = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  const {
    selectedMonth,
    selectedYear,
    todayInfo,
    handlePreviousMonth,
    handleNextMonth,
  } = useMonthNavigation();

  const { timesheetData, attendanceData, holidayData, loading } =
    useTimesheetData(selectedMonth, selectedYear);

  const { calendarDays } = useCalendarData(
    selectedMonth,
    selectedYear,
    todayInfo,
    attendanceData,
    holidayData,
  );

  const {
    isLeaveModalOpen,
    defaultFromDate,
    openLeaveModal,
    closeLeaveModal,
    submitLeaveRequest,
    isOTModalOpen,
    otPrefillDate,
    openOTModal,
    closeOTModal,
    submitOTRequest,
  } = useTimesheetModals();

  const defaultLeaveType = useMemo(() => {
    const remaining = timesheetData?.leave?.remaining || 0;
    return remaining > 0 ? "ANNUAL" : "UNPAID";
  }, [timesheetData?.leave?.remaining]);

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleLeaveRequest = () => {
    if (!selectedDate?.inMonth || !selectedDate?.isoDate) {
      toast.info("Vui long chon ngay tren lich truoc khi xin nghi.");
      return;
    }

    openLeaveModal(selectedDate.isoDate);
  };

  const handleOTRequest = () => {
    if (!selectedDate?.inMonth || !selectedDate?.isoDate) {
      toast.info("Vui long chon ngay tren lich truoc khi dang ky OT.");
      return;
    }

    openOTModal(selectedDate.isoDate);
  };

  return (
    <div className="space-y-6 max-w-full">
      <Suspense fallback={<div>Loading...</div>}>
        {isOTModalOpen && (
          <ModalOT
            open={isOTModalOpen}
            onClose={closeOTModal}
            onSubmit={submitOTRequest}
            initialValues={{
              otType: "WEEKDAY",
              date: otPrefillDate,
            }}
          />
        )}

        {isLeaveModalOpen && (
          <LeaveRequestModal
            defaultFromDate={defaultFromDate}
            defaultLeaveType={defaultLeaveType}
            onClose={closeLeaveModal}
            onConfirm={submitLeaveRequest}
          />
        )}
      </Suspense>

      <TimesheetHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      <div className="md:hidden">
        <TimesheetAttendanceTable
          calendarDays={calendarDays}
          loading={loading}
        />
      </div>

      <div className="hidden space-y-6 md:block">
        <TimesheetStats
          timesheetData={timesheetData}
          attendanceData={attendanceData}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <CalendarGrid
            className="lg:col-span-8 xl:col-span-9"
            calendarDays={calendarDays}
            loading={loading}
            selectedDate={selectedDate}
            onDayClick={handleDayClick}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            todayInfo={todayInfo}
          />

          <div className="space-y-6 lg:col-span-4 xl:col-span-3">
            <DayDetailPanel
              selectedDate={selectedDate}
              todayInfo={todayInfo}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onLeaveRequest={handleLeaveRequest}
              onOTRequest={handleOTRequest}
            />
            <CalendarLegend />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTimesheet;
