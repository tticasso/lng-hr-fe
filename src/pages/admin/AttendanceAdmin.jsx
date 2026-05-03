import EditAttendanceModal from "../../components/modals/EditAttendanceModal";
import AttendanceAdminHeader from "./attendance/AttendanceAdminHeader";
import AttendanceDetailDrawer from "./attendance/AttendanceDetailDrawer";
import AttendanceFilters from "./attendance/AttendanceFilters";
import AttendanceOverviewTable from "./attendance/AttendanceOverviewTable";
import { useAttendanceAdmin } from "./attendance/useAttendanceAdmin";

const AttendanceAdmin = () => {
  const {
    OT_TYPE_LABELS,
    departments,
    employeeDetail,
    errorCount,
    fileInputRef,
    filteredAttendanceData,
    filters,
    handleEmployeeClick,
    handleExportExcel,
    handleFileChange,
    handleFilterChange,
    handleImportClick,
    handleNextPeriod,
    handleOpenEditModal,
    handlePreviousPeriod,
    handleSaveAttendance,
    handleSyncData,
    handleSyncHoliday,
    isEditModalOpen,
    isPeriodLocked,
    loading,
    loadingDetail,
    month,
    openOTDetailId,
    selectedAttendanceLog,
    selectedEmployee,
    setIsEditModalOpen,
    setIsPeriodLocked,
    setOpenOTDetailId,
    setSelectedEmployee,
    year,
  } = useAttendanceAdmin();

  const filtersNode = (
    <AttendanceFilters
      filters={filters}
      departments={departments}
      onFilterChange={handleFilterChange}
      errorCount={errorCount}
    />
  );

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col gap-4 lg:h-[calc(100vh-100px)] lg:gap-6">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={handleFileChange}
      />

      <AttendanceAdminHeader
        month={month}
        year={year}
        isPeriodLocked={isPeriodLocked}
        onPreviousPeriod={handlePreviousPeriod}
        onNextPeriod={handleNextPeriod}
        onImport={handleImportClick}
        onExport={handleExportExcel}
        onSyncData={handleSyncData}
        onSyncHoliday={handleSyncHoliday}
        onToggleLock={() => setIsPeriodLocked((prev) => !prev)}
        isExportDisabled={filteredAttendanceData.length === 0}
      />

      <AttendanceOverviewTable
        filtersNode={filtersNode}
        loading={loading}
        employees={filteredAttendanceData}
        selectedEmployee={selectedEmployee}
        onEmployeeClick={handleEmployeeClick}
        openOTDetailId={openOTDetailId}
        setOpenOTDetailId={setOpenOTDetailId}
        otTypeLabels={OT_TYPE_LABELS}
      />

      <AttendanceDetailDrawer
        selectedEmployee={selectedEmployee}
        loadingDetail={loadingDetail}
        employeeDetail={employeeDetail}
        openOTDetailId={openOTDetailId}
        setOpenOTDetailId={setOpenOTDetailId}
        onClose={() => setSelectedEmployee(null)}
        onOpenEditModal={handleOpenEditModal}
        otTypeLabels={OT_TYPE_LABELS}
      />

      <EditAttendanceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        attendanceLog={selectedAttendanceLog}
        employee={selectedEmployee}
        onSave={handleSaveAttendance}
      />
    </div>
  );
};

export default AttendanceAdmin;
