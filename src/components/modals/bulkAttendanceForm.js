export const splitEmployeeCodes = (value = "") =>
  value
    .split(/[\n,;]/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

export const buildBulkAttendancePayload = (formData, dryRun) => {
  const payload = {
    dates: formData.dates,
    reasonType: formData.reasonType,
    note: formData.note,
    checkOut: formData.checkOut,
    employeeCodes: splitEmployeeCodes(formData.employeeCodesText),
    excludeEmployeeCodes: splitEmployeeCodes(formData.excludeEmployeeCodesText),
    departmentIds: formData.departmentIds,
    overwrite: formData.updateMode === "CHECK_OUT_ONLY" || formData.overwrite,
    dryRun,
  };

  if (formData.updateMode === "FULL") {
    payload.checkIn = formData.checkIn;
    payload.status = formData.status;
    payload.workDayValue = Number(formData.workDayValue);
  }

  return payload;
};

export const buildBulkAttendanceDeletePayload = (formData, dryRun) => ({
  dates: formData.dates,
  employeeCodes: splitEmployeeCodes(formData.employeeCodesText),
  excludeEmployeeCodes: splitEmployeeCodes(formData.excludeEmployeeCodesText),
  departmentIds: formData.departmentIds,
  dryRun,
  confirm: !dryRun,
});
