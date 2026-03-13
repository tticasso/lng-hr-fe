import React from "react";

const StatusBadge = ({ status }) => {
  // Map status text sang màu sắc (Hỗ trợ cả tiếng Việt và tiếng Anh)
  const getStyle = (st) => {
    const status = st.toLowerCase();
    switch (status) {
      case "active":
      case "hired":
      case "official":
      case "đang làm việc":
        return "bg-green-100 text-success"; // Nền nhạt, chữ đậm
      case "pending":
      case "Chờ duyệt":
      case "probation":
      case "interviewing":
      case "thử việc":
        return "bg-yellow-100 text-warning";
      case "rejected":
      case "inactive":
      case "terminated":
      case "resigned":
      case "đã nghỉ việc":
      case "đã sa thải":
        return "bg-red-100 text-error";
      default:
        return "bg-gray-100 text-secondary";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
