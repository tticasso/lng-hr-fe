/**
 * Helper functions for calendar operations
 */

export const pad2 = (n) => String(n).padStart(2, "0");

export const isWeekend = (dayOfWeek) => dayOfWeek === 0 || dayOfWeek === 6;

export const isPastDay = (day, currentMonth, currentYear, todayInfo) => {
  const isCurrentMonth = currentYear === todayInfo.year && currentMonth === todayInfo.month;
  
  if (isCurrentMonth) {
    return day < todayInfo.day;
  }
  
  return (
    currentYear < todayInfo.year ||
    (currentYear === todayInfo.year && currentMonth < todayInfo.month)
  );
};

export const getDayStyle = (day, selectedDate, currentMonth, currentYear, todayInfo) => {
  // Ô trống tháng trước
  if (!day.inMonth) return "bg-gray-50/50";

  // Kiểm tra xem ô này có đang được chọn không
  const isSelected = selectedDate?.isoDate === day.isoDate;

  // Base class
  let baseClass =
    "relative border-b border-r border-gray-200 p-1.5 h-28 transition-all cursor-pointer flex flex-col justify-between group ";

  // Nếu đang được chọn, thêm background đậm hơn
  if (isSelected) {
    baseClass += "z-10 ";
  }

  // Ngày Lễ (PUBLIC_HOLIDAY)
  if (day.type === "holiday")
    return `${baseClass} ${isSelected ? "bg-red-200" : "bg-red-50"}`;

  // Ngày làm việc bù (SUBSTITUTE_WORK_DAY)
  if (day.type === "substitute_work")
    return `${baseClass} ${isSelected ? "bg-yellow-200" : "bg-yellow-50"}`;

  // Cuối tuần (T7, CN)
  if (day.type === "weekend")
    return `${baseClass} ${isSelected ? "bg-orange-300" : "bg-orange-100"} text-gray-400`;

  // Nghỉ phép
  if (day.type === "leave") {
    if (day.apiData?.status === "PAID_LEAVE") {
      return `${baseClass} ${isSelected ? "bg-purple-200" : "bg-purple-50"}`;
    } else {
      return `${baseClass} ${isSelected ? "bg-orange-200" : "bg-orange-50"}`;
    }
  }

  // Ngày hôm nay - viền xanh nước biển
  if (day.isToday)
    return `${baseClass} ${isSelected ? "bg-blue-200" : "bg-blue-100"} ring-2 ring-inset ring-blue-400`;

  // Ngày đã qua (trước ngày hiện tại) - màu xanh
  if (isPastDay(day.day, currentMonth, currentYear, todayInfo)) {
    return `${baseClass} ${isSelected ? "bg-green-200" : "bg-green-100"}`;
  }

  // Ngày trong tương lai - màu trắng
  return `${baseClass} ${isSelected ? "bg-blue-100" : "bg-white"}`;
};