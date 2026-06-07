import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Tag,
  User,
  X,
  XCircle,
} from "lucide-react";
import { formatEmployeeCode } from "../../utils/employeeDisplay";

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

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "--";
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
};

const getPersonName = (person) => {
  if (!person) return "--";
  if (typeof person === "string") return person;
  return person.fullName || person.username || person.name || "--";
};

const getPersonCode = (person) => {
  if (!person || typeof person === "string") return "--";
  return formatEmployeeCode(person.employeeCode);
};

const getPersonLabel = (person) => {
  if (!person) return "Chưa gán";
  if (typeof person === "string") return person;

  const name = person.fullName || person.username || person.name || "--";
  const code = formatEmployeeCode(person.employeeCode, "");
  return code ? `${name} (${code})` : name;
};

const getApprovalChain = (otData) => {
  const chain = Array.isArray(otData?.approvalChain) ? otData.approvalChain : [];
  return [...chain].sort((a, b) => (Number(a?.level) || 0) - (Number(b?.level) || 0));
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

const DetailField = ({ label, value, valueClassName = "font-medium text-sm text-gray-800" }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={valueClassName}>{value || "--"}</p>
  </div>
);

const OTPayBreakdown = ({ payDetails }) => {
  const items = Array.isArray(payDetails?.breakdown) ? payDetails.breakdown : [];

  if (!payDetails || items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <DollarSign size={16} />
          <span>Tiền OT</span>
        </div>
        <p className="text-sm text-gray-500">Chưa có dữ liệu tính tiền OT cho đơn này.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
          <DollarSign size={16} />
          <span>Tiền OT {payDetails.isEstimated ? "(tạm tính)" : ""}</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-green-700">Tổng tiền</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(payDetails.totalAmount)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-green-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-green-50 text-xs font-semibold uppercase text-green-700">
            <tr>
              <th className="px-3 py-2">Loại OT</th>
              <th className="px-3 py-2 text-right">Giờ</th>
              <th className="px-3 py-2 text-right">Hệ số</th>
              <th className="px-3 py-2 text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.type}>
                <td className="px-3 py-2 font-medium text-gray-800">{item.label || item.type}</td>
                <td className="px-3 py-2 text-right text-gray-700">{formatHours(item.hours)}h</td>
                <td className="px-3 py-2 text-right text-gray-700">x{Number(item.multiplier || 0).toFixed(2)}</td>
                <td className="px-3 py-2 text-right font-semibold text-gray-800">
                  {formatCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-green-800">
        <span>Đơn giá giờ: {formatCurrency(payDetails.hourlyRate)}</span>
        <span>Công chuẩn: {payDetails.standardWorkDays || 0} ngày</span>
        {Number(payDetails.salaryMultiplier) > 0 && (
          <span>Hệ số lương: {Number(payDetails.salaryMultiplier).toFixed(2)}</span>
        )}
      </div>
    </div>
  );
};

const ApprovalIcon = ({ status }) => {
  if (status === "APPROVED") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 size={16} className="text-green-600" />
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
        <XCircle size={16} className="text-red-600" />
      </div>
    );
  }

  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow-100">
      <AlertCircle size={16} className="text-yellow-600" />
    </div>
  );
};

const ApprovalTimeline = ({ levels }) => {
  if (!levels.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-400">Chưa có thông tin phê duyệt</p>
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg border border-purple-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <Tag className="text-purple-600" size={18} />
        <h3 className="font-semibold text-gray-800">Chuỗi phê duyệt</h3>
      </div>

      <div className="relative">
        {levels.map((level, index) => {
          const approvalStatus = normalizeStatus(level?.status);
          const isLast = index === levels.length - 1;

          return (
            <div key={level?._id || level?.level || index} className="relative flex gap-3 pb-4">
              {!isLast && (
                <div className="absolute bottom-0 left-[13px] top-[28px] w-0.5 bg-gray-200" />
              )}

              <div className="relative z-10 shrink-0">
                <ApprovalIcon status={approvalStatus} />
              </div>

              <div className="flex-1 pt-0.5">
                <div className="mb-1 flex flex-wrap items-center gap-1">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                    Cấp {level?.level || "--"}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      approvalStatus === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : approvalStatus === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {statusLabel[approvalStatus] || approvalStatus || "Chờ duyệt"}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-800">{getPersonName(level?.approver)}</p>
                <p className="text-xs text-gray-500">{getPersonCode(level?.approver)}</p>

                {level?.approvedBy && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    Xử lý bởi: {getPersonLabel(level.approvedBy)}
                  </p>
                )}

                {level?.approvedAt && (
                  <p className="mt-1 text-[10px] text-gray-400">
                    {formatDateTime(level.approvedAt)}
                  </p>
                )}

                {level?.comment && (
                  <div className="mt-1.5 rounded border-l-2 border-gray-300 bg-gray-50 p-1.5 text-xs text-gray-700">
                    <span className="text-[10px] font-medium text-gray-500">Nhận xét: </span>
                    {level.comment}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const OTDetailModal = ({ isOpen, onClose, otData }) => {
  if (!isOpen || !otData) return null;

  const approvalLevels = getApprovalChain(otData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <User className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-gray-800">Thông tin nhân sự</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailField label="Họ tên" value={otData.employeeId?.fullName || "--"} />
                  <DetailField label="Mã nhân viên" value={formatEmployeeCode(otData.employeeId?.employeeCode)} />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Calendar className="text-green-600" size={18} />
                  <h3 className="font-semibold text-gray-800">Thông tin OT</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label="Ngày OT" value={formatDate(otData.date)} />
                  <DetailField
                    label="Loại OT"
                    value={otTypeLabel[otData.otType] || otData.otType || "--"}
                  />
                  <div>
                    <p className="text-xs text-gray-500">Trạng thái</p>
                    <div className="mt-1">
                      <StatusBadge status={otData.status} />
                    </div>
                  </div>
                  <DetailField
                    label="Giờ đăng ký"
                    value={
                      otData.startTime && otData.endTime
                        ? `${otData.startTime} - ${otData.endTime}`
                        : "--"
                    }
                  />
                  <DetailField
                    label="Giờ duyệt"
                    value={
                      otData.approvedStartTime && otData.approvedEndTime
                        ? `${otData.approvedStartTime} - ${otData.approvedEndTime}`
                        : "--"
                    }
                  />
                  <DetailField
                    label="Tổng giờ duyệt"
                    value={`${formatHours(otData.approvedHours)} giờ`}
                    valueClassName="text-lg font-semibold text-blue-600"
                  />
                </div>
              </div>

              <OTPayBreakdown payDetails={otData.otPayDetails} />

              <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <FileText className="text-yellow-600" size={18} />
                  <h3 className="font-semibold text-gray-800">Lý do OT</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  {otData.reason || "Không có lý do cụ thể"}
                </p>
              </div>

              {otData.rejectionReason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="mb-2 flex items-center gap-3">
                    <FileText className="text-red-600" size={18} />
                    <h3 className="font-semibold text-red-800">Lý do từ chối</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-red-700">{otData.rejectionReason}</p>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="mb-2 flex items-center gap-3">
                  <Clock className="text-gray-600" size={18} />
                  <h3 className="font-semibold text-gray-800">Thời gian</h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailField label="Ngày tạo" value={formatDateTime(otData.createdAt)} />
                  <DetailField label="Cập nhật" value={formatDateTime(otData.updatedAt)} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ApprovalTimeline levels={approvalLevels} />
            </div>
          </div>
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
