// src/components/modals/ModalOT.jsx
import React, { useEffect, useMemo, useState } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { DatePicker, TimePicker } from "antd";
import dayjs from "../../untils/dayjs";

const makePayload = ({ date, startTime, endTime, reason }) => ({
  // backend cần "YYYY-MM-DD"
  date: date ? dayjs(date).format("YYYY-MM-DD") : "",
  // backend cần "HH:mm"
  startTime: startTime ? dayjs(startTime).format("HH:mm") : "",
  endTime: endTime ? dayjs(endTime).format("HH:mm") : "",
  reason: reason || "",
});

/**
 * ModalOT
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - onSubmit: (payload) => Promise<void> | void
 * - initialValues?: { date, otType, startTime, endTime, reason }
 */
const ModalOT = ({
  open,
  onClose,
  onSubmit,
  initialValues,
}) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [touched, setTouched] = useState({
    date: false,
    startTime: false,
    endTime: false,
    reason: false,
  });

  const [date, setDate] = useState(null); // dayjs
  const [otType, setOtType] = useState("WEEKDAY");
  const [startTime, setStartTime] = useState(null); // dayjs
  const [endTime, setEndTime] = useState(null); // dayjs
  const [reason, setReason] = useState("");

  useEffect(() => {
    console.log("[ModalOT] mounted / open =", open);
    return () => console.log("[ModalOT] unmounted");
  }, []);

  useEffect(() => {
    console.log("[ModalOT] open changed:", open);
  }, [open]);

  // reset/init when open
  useEffect(() => {
    if (!open) return;

    // Reset validation states when modal opens
    setShowValidation(false);
    setTouched({
      date: false,
      startTime: false,
      endTime: false,
      reason: false,
    });

    setDate(initialValues?.date ? dayjs(initialValues.date) : null);

    // cho phép initialValues dạng "20:00" hoặc full datetime
    setStartTime(
      initialValues?.startTime
        ? dayjs(initialValues.startTime, ["HH:mm", dayjs.ISO_8601], true)
        : null
    );
    setEndTime(
      initialValues?.endTime
        ? dayjs(initialValues.endTime, ["HH:mm", dayjs.ISO_8601], true)
        : null
    );

    setReason(initialValues?.reason || "");
  }, [open, initialValues]);

  const canSubmit = useMemo(() => {
    if (!date) return false;
    if (!startTime || !endTime) return false;
    
    // Validate lý do phải có nội dung
    if (!reason || reason.trim() === "") return false;
    
    return true;
  }, [date, startTime, endTime, reason]);

  const handleOk = async () => {
    setShowValidation(true);
    
    // Kiểm tra validation - nếu không đủ thì chỉ hiển thị errors, không call API
    if (!canSubmit) {
      return; // Dừng lại, không call API
    }

    const payload = makePayload({ date, startTime, endTime, reason });

    try {
      setConfirmLoading(true);
      await onSubmit?.(payload);
      onClose?.();
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleFieldTouch = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const shouldShowError = (field, condition) => {
    return (showValidation || touched[field]) && condition;
  };

  if (!open) return null;

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:ring-blue-500"
    }`;

  const labelClass =
    "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Clock size={18} className="text-orange-600" />
              Tạo đơn OT
            </h3>
          </div>
          <button onClick={onClose} disabled={confirmLoading}>
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className={labelClass}>Ngày OT *</label>
            <DatePicker
              value={date}
              onChange={(v) => {
                setDate(v);
                handleFieldTouch('date');
              }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
              className="w-full"
              size="large"
              status={shouldShowError('date', !date) ? "error" : ""}
            />
            {shouldShowError('date', !date) && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Vui lòng chọn ngày OT
              </p>
            )}
          </div>

          {/* time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Giờ bắt đầu *</label>
              <TimePicker
                value={startTime}
                onChange={(v) => {
                  setStartTime(v);
                  handleFieldTouch('startTime');
                }}
                format="HH:mm"
                className="w-full"
                placeholder="Chọn giờ"
                minuteStep={5}
                size="large"
                status={shouldShowError('startTime', !startTime) ? "error" : ""}
              />
              {shouldShowError('startTime', !startTime) && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Vui lòng chọn giờ bắt đầu
                </p>
              )}
            </div>
            <div>
              <label className={labelClass}>Giờ kết thúc *</label>
              <TimePicker
                value={endTime}
                onChange={(v) => {
                  setEndTime(v);
                  handleFieldTouch('endTime');
                }}
                format="HH:mm"
                className="w-full"
                placeholder="Chọn giờ"
                minuteStep={5}
                size="large"
                status={shouldShowError('endTime', !endTime) ? "error" : ""}
              />
              {shouldShowError('endTime', !endTime) && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Vui lòng chọn giờ kết thúc
                </p>
              )}
            </div>
          </div>

          {/* reason */}
          <div>
            <label className={labelClass}>Lý do xin OT *</label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                handleFieldTouch('reason');
              }}
              placeholder="Nhập lý do..."
              rows={3}
              className={inputClass(shouldShowError('reason', reason.trim() === ""))}
            />
            {shouldShowError('reason', reason.trim() === "") && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> Vui lòng nhập lý do xin OT
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={confirmLoading}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleOk}
              disabled={confirmLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {confirmLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang gửi...
                </>
              ) : (
                "Gửi đơn"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalOT;
