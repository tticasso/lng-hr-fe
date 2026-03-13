// Status mapping
export const statusMap = {
  APPROVED: "Đã duyệt",
  PENDING: "Chờ duyệt",
  REJECTED: "Từ chối",
};

// Day labels for calendar header
export const dayLabels = [
  "CN",
  "Thứ 2", 
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7"
];

// Color configuration for stat cards
export const statCardColors = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  red: "bg-red-50 text-red-600 border-red-100",
  green: "bg-green-50 text-green-600 border-green-100",
};

// Legend items for calendar
export const legendItems = {
  dayTypes: [
    { color: "bg-red-50 border-red-200", label: "Ngày nghỉ lễ" },
    { color: "bg-yellow-50 border-yellow-200", label: "Ngày làm việc bù" },
    { color: "bg-orange-100 border-orange-200", label: "Cuối tuần" },
    { color: "bg-purple-50 border-purple-200", label: "Nghỉ có lương" },
    { color: "bg-orange-50 border-orange-200", label: "Nghỉ không lương" },
    { color: "bg-green-100 border-green-200", label: "Ngày đã qua" },
    { color: "bg-blue-100 border-blue-400 ring-1 ring-blue-400", label: "Hôm nay" },
  ],
  statusTypes: [
    { color: "bg-red-500", label: "Đi muộn" },
    { color: "bg-blue-500", label: "Về sớm" },
    { color: "bg-orange-500", label: "Có OT" },
    { color: "bg-purple-500", label: "Nghỉ phép" },
  ],
};