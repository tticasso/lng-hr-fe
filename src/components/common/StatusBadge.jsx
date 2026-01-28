import React from "react";

const StatusBadge = ({ status }) => {
  // Map status text sang màu sắc (Chuẩn hóa chữ thường để dễ so sánh)
  const getStyle = (st) => {
    switch (st.toLowerCase()) {
      case "active":
      case "hired":
      case "official":
        return "bg-green-100 text-success"; // Nền nhạt, chữ đậm
      case "pending":
      case "probation":
      case "interviewing":
        return "bg-yellow-100 text-warning";
      case "rejected":
      case "inactive":
      case "terminated":
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
