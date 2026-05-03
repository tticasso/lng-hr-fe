import PayrollOverviewFilters from "./overview/PayrollOverviewFilters";
import PayrollOverviewHeader from "./overview/PayrollOverviewHeader";
import PayrollOverviewTable from "./overview/PayrollOverviewTable";
import PayrollSummaryCards from "./overview/PayrollSummaryCards";
import { usePayrollOverview } from "./overview/usePayrollOverview";

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
    handleSendPayrollEmail,
    isAllSelected,
    isSomeSelected,
    loading,
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
    <div className="space-y-6">
      <PayrollOverviewHeader
        selectedMonth={selectedMonth}
        onChangeMonth={(e) => setSelectedMonth(e.target.value)}
        onRefresh={fetchPayrollData}
        onPayment={handlePayment}
        onExport={handleExportExcel}
        loading={loading}
        selectedCount={selectedRows.length}
        exportDisabled={filteredData.length === 0}
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
      />
    </div>
  );
};

export default AllPayRoll;
