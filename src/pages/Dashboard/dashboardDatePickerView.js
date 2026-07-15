import dayjs from "dayjs";

export const DASHBOARD_DATE_PICKER_FORMAT = "DD/MM/YYYY";

export const toDashboardPickerDate = (value) => {
  if (!value) return null;
  const date = dayjs(value);
  return date.isValid() ? date : null;
};

export const fromDashboardPickerDate = (value) => {
  if (!value || !value.isValid?.()) return "";
  return value.format("YYYY-MM-DD");
};

export const isAfterDashboardMaxDate = (value, maxDate) => {
  if (!value || !maxDate) return false;
  const max = dayjs(maxDate).endOf("day");
  return value.isAfter(max);
};
