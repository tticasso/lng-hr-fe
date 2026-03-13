import { useState, useMemo, lazy, Suspense } from "react";
import { toast } from "react-toastify";

// Hooks
import {
  useTimesheetData,
  useTimesheetModals,
  useCalendarData,
  useMonthNavigation,
} from "./hooks";

// Components
import {
  TimesheetHeader,
  TimesheetStats,
  CalendarGrid,
  DayDetailPanel,
  CalendarLegend,
} from "./components";

// Lazy load modals
const LeaveRequestModal = lazy(() => import("../../components/modals/CreateLeaveModal"));
const ModalOT = lazy(() => import("../../components/modals/OTModal"));

const MyTimesheet = () => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Custom hooks
  const { selectedMonth, selectedYear, todayInfo, handlePreviousMonth, handleNextMonth } = 
    useMonthNavigation();

  const { timesheetData, attendanceData, holidayData, loading } = 
    useTimesheetData(selectedMonth, selectedYear);

  const { calendarDays } = 
    useCalendarData(selectedMonth, selectedYear, todayInfo, attendanceData, holidayData);

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

  // Default leave type based on remaining leave days
  const defaultLeaveType = useMemo(() => {
    const remaining = timesheetData?.leave?.remaining || 0;
    return remaining > 0 ? "ANNUAL" : "UNPAID";
  }, [timesheetData?.leave?.remaining]);

  // Handlers
  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const handleLeaveRequest = () => {
    if (!selectedDate?.inMonth || !selectedDate?.isoDate) {
      toast.info("Vui lòng chọn ngày trên lịch trước khi xin nghỉ.");
      return;
    }
    openLeaveModal(selectedDate.isoDate);
  };

  const handleOTRequest = () => {
    if (!selectedDate?.inMonth || !selectedDate?.isoDate) {
      toast.info("Vui lòng chọn ngày trên lịch trước khi đăng ký OT.");
      return;
    }
    openOTModal(selectedDate.isoDate);
  };

  return (
    <div className="space-y-6 max-w-full">
      <Suspense fallback={<div>Loading...</div>}>
        {/* OT Modal */}
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

        {/* Leave Modal */}
        {isLeaveModalOpen && (
          <LeaveRequestModal
            defaultFromDate={defaultFromDate}
            defaultLeaveType={defaultLeaveType}
            onClose={closeLeaveModal}
            onConfirm={submitLeaveRequest}
          />
        )}
      </Suspense>

      {/* Header */}
      <TimesheetHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Stats Cards */}
      <TimesheetStats timesheetData={timesheetData} />

      {/* Main Content: Calendar + Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Calendar Grid */}
        <CalendarGrid
          calendarDays={calendarDays}
          loading={loading}
          selectedDate={selectedDate}
          onDayClick={handleDayClick}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          todayInfo={todayInfo}
        />

        {/* Right Panel */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
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
  );
};

export default MyTimesheet;