import PayrollOverviewFilters from "./overview/PayrollOverviewFilters";
import PayrollOverviewHeader from "./overview/PayrollOverviewHeader";
import PayrollOverviewTable from "./overview/PayrollOverviewTable";
import PayrollSummaryCards from "./overview/PayrollSummaryCards";
import { usePayrollOverview } from "./overview/usePayrollOverview";
import PayrollAdjustmentModal from "../../components/modals/PayrollAdjustmentModal";

const AllPayRoll = () => {
  const {
    departments,
    fetchPayrollData,
    filteredData,
    filters,
    formatMoney,
    handleExportExcel,
    handleFilterChange,
    handlePayment,
    handleSelectAll,
    handleSelectRow,
    handleSendPayrollEmailsBulk,
    handleSendPayrollEmail,
    handleReopenPayroll,
    handleOpenAdjustments,
    handleOpenBulkAdjustments,
    handleCloseAdjustments,
    isAllSelected,
    isSomeSelected,
    loading,
    sendingBulkEmails,
    adjustmentModalPayroll,
    selectedPayrollItems,
    selectedMonth,
    selectedRows,
    setSelectedMonth,
    summary,
  } = usePayrollOverview();

  const filtersNode = (
    <PayrollOverviewFilters
      filters={filters}
      departments={departments}
      onFilterChange={handleFilterChange}
      selectedCount={selectedRows.length}
      totalCount={filteredData.length}
    />
  );

  return (
    <div className="min-w-0 space-y-6 pb-6">
      <PayrollOverviewHeader
        selectedMonth={selectedMonth}
        onChangeMonth={(e) => setSelectedMonth(e.target.value)}
        onRefresh={fetchPayrollData}
        onPayment={handlePayment}
        onBulkAdjustments={handleOpenBulkAdjustments}
        onSendEmailsBulk={handleSendPayrollEmailsBulk}
        onExport={handleExportExcel}
        loading={loading}
        sendingBulkEmails={sendingBulkEmails}
        selectedCount={selectedRows.length}
        exportDisabled={filteredData.length === 0}
        emailDisabled={summary.emailReadyCount === 0}
      />

      <PayrollSummaryCards summary={summary} formatMoney={formatMoney} />

      <PayrollOverviewTable
        filtersNode={filtersNode}
        loading={loading}
        rows={filteredData}
        selectedRows={selectedRows}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        onSelectAll={handleSelectAll}
        onSelectRow={handleSelectRow}
        onSendPayrollEmail={handleSendPayrollEmail}
        onReopenPayroll={handleReopenPayroll}
        onManageAdjustments={handleOpenAdjustments}
      />

      <PayrollAdjustmentModal
        isOpen={Boolean(adjustmentModalPayroll)}
        onClose={handleCloseAdjustments}
        payroll={adjustmentModalPayroll}
        bulkPayrolls={adjustmentModalPayroll?.__bulk ? selectedPayrollItems : []}
        selectedMonth={selectedMonth}
        onChanged={fetchPayrollData}
      />
    </div>
  );
};

export default AllPayRoll;
