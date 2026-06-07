import { useMemo, useState } from "react";
import "antd/dist/reset.css";
import { CheckCircle2, Clock, UserCheck, X, XCircle } from "lucide-react";
import { TimePicker } from "antd";
import dayjs from "../../untils/dayjs";
import { formatEmployeeCode } from "../../utils/employeeDisplay";

const statusLabel = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  CANCELLED: "Đã hủy",
  CANCELED: "Đã hủy",
};

const normalizeStatus = (status) => {
  if (status === "CANCELED") return "CANCELLED";
  return status || "PENDING";
};

const parseTime = (value) => (value ? dayjs(value, ["HH:mm", dayjs.ISO_8601], true) : null);

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
        return "border-green-200 bg-green-50 text-green-700";
      case "REJECTED":
      case "CANCELLED":
        return "border-red-200 bg-red-50 text-red-700";
      default:
        return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }
  })();

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {statusLabel[statusKey] || statusKey}
    </span>
  );
};

const ApprovalSummary = ({ levels }) => {
  const currentLevel =
    levels.find((level) => normalizeStatus(level?.status) === "PENDING") || levels[levels.length - 1];

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
          <UserCheck size={16} />
          <span>Cấp duyệt</span>
        </div>
        <span className="text-xs font-medium text-blue-700">{levels.length || 0} level</span>
      </div>

      {currentLevel ? (
        <div className="mb-3 rounded-md border border-blue-100 bg-white p-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-800">
              Đang xử lý level {currentLevel.level || "--"}
            </p>
            <StatusBadge status={currentLevel.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Người được gán: {getPersonLabel(currentLevel.approver)}
          </p>
        </div>
      ) : (
        <p className="mb-3 text-sm text-gray-600">Đơn OT này chưa có dữ liệu cấp duyệt.</p>
      )}

      {levels.length > 0 && (
        <div className="space-y-2">
          {levels.map((level) => {
            const statusKey = normalizeStatus(level?.status);
            const isApproved = statusKey === "APPROVED";
            const isRejected = statusKey === "REJECTED";

            return (
              <div
                key={level?._id || level?.level}
                className="flex items-start justify-between gap-3 rounded-md bg-white px-2 py-2"
              >
                <div className="flex min-w-0 items-start gap-2">
                  {isApproved ? (
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-600" />
                  ) : isRejected ? (
                    <XCircle size={15} className="mt-0.5 shrink-0 text-red-600" />
                  ) : (
                    <Clock size={15} className="mt-0.5 shrink-0 text-yellow-600" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-700">Level {level?.level || "--"}</p>
                    <p className="truncate text-xs text-gray-500">{getPersonLabel(level?.approver)}</p>
                  </div>
                </div>
                <StatusBadge status={statusKey} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ApproveOTModalContent = ({ onClose, otData, onConfirm }) => {
  const approvalLevels = useMemo(() => getApprovalChain(otData), [otData]);
  const [approvedStartTime, setApprovedStartTime] = useState(() =>
    parseTime(otData.approvedStartTime || otData.startTime)
  );
  const [approvedEndTime, setApprovedEndTime] = useState(() =>
    parseTime(otData.approvedEndTime || otData.endTime)
  );

  const handleConfirm = () => {
    if (!approvedStartTime || !approvedEndTime) {
      alert("Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc!");
      return;
    }

    onConfirm(otData._id, {
      status: "APPROVED",
      approvedStartTime: dayjs(approvedStartTime).format("HH:mm"),
      approvedEndTime: dayjs(approvedEndTime).format("HH:mm"),
    });
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Duyệt đơn OT</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs font-medium uppercase text-gray-400">Nhân sự</p>
              <p className="mt-1 font-semibold text-gray-800">{otData.employeeId?.fullName || "--"}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {formatEmployeeCode(otData.employeeId?.employeeCode, "")}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs font-medium uppercase text-gray-400">Tổng giờ đăng ký</p>
              <p className="mt-1 font-semibold text-gray-800">{otData.totalHours || 0} giờ</p>
            </div>
          </div>

          <ApprovalSummary levels={approvalLevels} />

          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Giờ bắt đầu duyệt <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={approvedStartTime}
                onChange={(value) => setApprovedStartTime(value)}
                format="HH:mm"
                className="w-full"
                placeholder="Chọn giờ bắt đầu"
                minuteStep={5}
                size="large"
                status={!approvedStartTime ? "error" : ""}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Giờ kết thúc duyệt <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={approvedEndTime}
                onChange={(value) => setApprovedEndTime(value)}
                format="HH:mm"
                className="w-full"
                placeholder="Chọn giờ kết thúc"
                minuteStep={5}
                size="large"
                status={!approvedEndTime ? "error" : ""}
              />
            </div>

            <p className="text-xs text-gray-500">
              Có thể chỉnh thời gian duyệt trong phạm vi giờ nhân sự đã đăng ký.
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t bg-gray-50 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            <CheckCircle2 size={16} />
            Duyệt
          </button>
        </div>
      </div>
    </div>
  );
};

const ApproveOTModal = ({ isOpen, onClose, otData, onConfirm }) => {
  if (!isOpen || !otData) return null;

  return <ApproveOTModalContent onClose={onClose} otData={otData} onConfirm={onConfirm} />;
};

export default ApproveOTModal;
