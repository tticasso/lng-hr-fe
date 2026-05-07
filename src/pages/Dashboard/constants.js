import { leaveTypeLabel } from "../leave/shared";

// Map leaveType và otType sang tên tiếng Việt
export const leaveTypeMap = leaveTypeLabel;

export const otTypeMap = {
  WEEKDAY: "OT Ngày thường",
  WEEKEND: "OT Cuối tuần",
  HOLIDAY: "OT Ngày lễ",
  WEEKDAY_NIGHT:"OT Đêm",
  WEEKEND_NIGHT:"OT Đêm cuối tuần"
};
