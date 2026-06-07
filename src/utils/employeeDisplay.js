export const formatEmployeeCode = (value, fallback = "--") => {
  const code = String(value || "").trim();
  return code ? code.toUpperCase() : fallback;
};

export const getEmployeeName = (employee, fallback = "--") => (
  employee?.fullName || employee?.name || employee?.username || fallback
);

export const getEmployeeLabel = (employee, fallback = "--") => {
  if (!employee) return fallback;
  if (typeof employee === "string") return employee;

  const name = getEmployeeName(employee, fallback);
  const code = formatEmployeeCode(employee.employeeCode, "");

  return code ? `${name} (${code})` : name;
};
