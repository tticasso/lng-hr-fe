import { Calendar, Clock, FileText, Tag, User, X } from "lucide-react";

const otTypeLabel = {
  WEEKDAY: "Ngày thường",
  WEEKEND: "Cuối tuần",
  HOLIDAY: "Ngày lễ",
};

const statusLabel = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  CANCELED: "Đã hủy",
};

const normalizeStatus = (status) => {
  if (status === "CANCELED") return "CANCELLED";
  return status;
};

const formatDate = (isoString) => {
  if (!isoString) return "--";
  return new Date(isoString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (isoString) => {
  if (!isoString) return "--";
  return new Date(isoString).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatHours = (value) => {
  if (value === null || value === undefined) return "--";
  return Number(value).toFixed(2);
};

const StatusBadge = ({ status }) => {
  const statusKey = normalizeStatus(status);
  const cls = (() => {
    switch (statusKey) {
      case "APPROVED":
        return "border border-green-200 bg-green-50 text-green-700";
      case "PENDING":
        return "border border-yellow-200 bg-yellow-50 text-yellow-700";
      case "REJECTED":
      case "CANCELLED":
        return "border border-red-200 bg-red-50 text-red-700";
      default:
        return "border border-gray-200 bg-gray-50 text-gray-700";
    }
  })();

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>
      {statusLabel[statusKey] || statusKey}
    </span>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4">
    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
      <Icon size={16} />
      <span>{label}</span>
    </div>
    <div className="text-sm font-semibold text-gray-800">{value || "--"}</div>
  </div>
);

const OTDetailModal = ({ isOpen, onClose, otData }) => {
  if (!isOpen || !otData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
          <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn OT</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-white"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              icon={User}
              label="Nhân sự"
              value={otData.employeeId?.fullName || "--"}
            />
            <InfoItem
              icon={Tag}
              label="Mã nhân viên"
              value={otData.employeeId?.employeeCode || "--"}
            />
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-500">
                <Tag size={16} />
                <span>Trạng thái</span>
              </div>
              <StatusBadge status={otData.status} />
            </div>
            <InfoItem icon={Calendar} label="Ngày OT" value={formatDate(otData.date)} />
            <InfoItem
              icon={Clock}
              label="Giờ đăng ký"
              value={
                otData.startTime && otData.endTime
                  ? `${otData.startTime} - ${otData.endTime}`
                  : "--"
              }
            />
            <InfoItem
              icon={Tag}
              label="Loại OT"
              value={otTypeLabel[otData.otType] || otData.otType || "--"}
            />
            <InfoItem
              icon={Clock}
              label="Giờ duyệt"
              value={
                otData.approvedStartTime && otData.approvedEndTime
                  ? `${otData.approvedStartTime} - ${otData.approvedEndTime}`
                  : "--"
              }
            />
            <InfoItem
              icon={Clock}
              label="Tổng giờ duyệt"
              value={`${formatHours(otData.approvedHours)} giờ`}
            />
            <InfoItem
              icon={Calendar}
              label="Ngày tạo"
              value={formatDateTime(otData.createdAt)}
            />
          </div>

          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
              <FileText size={16} />
              <span>Lý do OT</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-700">
              {otData.reason || "Không có lý do cụ thể"}
            </p>
          </div>

          {otData.rejectionReason && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-red-700">
                <FileText size={16} />
                <span>Lý do từ chối</span>
              </div>
              <p className="text-sm leading-relaxed text-red-700">{otData.rejectionReason}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTDetailModal;
