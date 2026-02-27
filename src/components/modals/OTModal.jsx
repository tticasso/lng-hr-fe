// src/components/modals/ModalOT.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, DatePicker, Select, TimePicker, Input } from "antd";
import dayjs from "../../untils/dayjs";

const { TextArea } = Input;

const OT_TYPE_OPTIONS = [
  { value: "WEEKDAY", label: "Ngày thường" },
  { value: "WEEKEND", label: "Cuối tuần" },
  { value: "HOLIDAY", label: "Ngày lễ" },
];

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

    setDate(initialValues?.date ? dayjs(initialValues.date) : null);
    // setOtType(initialValues?.otType || "WEEKDAY");

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
    // if (!otType) return false;
    if (!startTime || !endTime) return false;

    // endTime phải sau startTime
    if (dayjs(endTime).isSameOrBefore(dayjs(startTime))) return false;
    return true;
  }, [date, startTime, endTime]);

  const handleOk = async () => {
    if (!canSubmit) return;

    const payload = makePayload({ date, startTime, endTime, reason });

    try {
      setConfirmLoading(true);
      await onSubmit?.(payload);
      onClose?.();
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo đơn OT"
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      okText="Gửi đơn"
      cancelText="Hủy"
      confirmLoading={confirmLoading}
      okButtonProps={{ disabled: !canSubmit }}
      destroyOnClose
    >
      <div className="flex flex-col gap-4">
        {/* Date */}
        <div>
          <p className="text-sm font-medium mb-1">Ngày OT</p>
          <DatePicker
            value={date}
            onChange={(v) => setDate(v)}
            format="DD/MM/YYYY"
            placeholder="Chọn ngày"
            className="w-full"
          />
          {/* <p className="text-xs text-gray-500 mt-1">
            Hiển thị: dd/mm/yyyy — Gửi lên backend: YYYY-MM-DD
          </p> */}
        </div>

        {/* otType */}
        {/* <div>
          <p className="text-sm font-medium mb-1">Loại ngày OT</p>
          <Select
            value={otType}
            onChange={(v) => setOtType(v)}
            options={OT_TYPE_OPTIONS}
            className="w-full"
            placeholder="Chọn loại OT"
          />
        </div> */}

        {/* time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <p className="text-sm font-medium mb-1">Giờ bắt đầu</p>
            <TimePicker
              value={startTime}
              onChange={(v) => setStartTime(v)}
              format="HH:mm"
              className="w-full"
              placeholder="Chọn giờ"
              minuteStep={5}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Giờ kết thúc</p>
            <TimePicker
              value={endTime}
              onChange={(v) => setEndTime(v)}
              format="HH:mm"
              className="w-full"
              placeholder="Chọn giờ"
              minuteStep={5}
            />
          </div>
        </div>

        {/* reason */}
        <div>
          <p className="text-sm font-medium mb-1">Lý do xin OT</p>
          <TextArea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do..."
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalOT;
