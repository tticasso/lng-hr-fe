export const buildPayrollQueryParams = (filters = {}) => {
  const employeeId = String(filters.employeeId || "").trim();
  return employeeId ? { limit: 1000, employeeId } : { limit: 1000 };
};

export const buildSelectedPayrollPayload = (selectedMonth, selectedRows = []) => {
  const [year, month] = selectedMonth.split("-");
  return {
    month: parseInt(month, 10),
    year: parseInt(year, 10),
    payrollIds: selectedRows,
  };
};

export const getSelectedPayrollsByStatus = (payrolls = [], selectedRows = [], statuses = []) => {
  const selected = new Set(selectedRows);
  const allowedStatuses = new Set(statuses);
  return payrolls.filter((item) => selected.has(item._id) && allowedStatuses.has(item.status));
};

export const getSelectedDraftPayrollIds = (payrolls = [], selectedRows = []) => {
  return getSelectedPayrollsByStatus(payrolls, selectedRows, ["DRAFT"]).map((item) => item._id);
};
