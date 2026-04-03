import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Save, CheckCircle } from "lucide-react";
import { Button, TimePicker } from "antd";
import dayjs from "../../untils/dayjs";

const ApproveOTModal = ({ isOpen, onClose, otData, onConfirm }) => {
  const [approvedStartTime, setApprovedStartTime] = useState(null);
  const [approvedEndTime, setApprovedEndTime] = useState(null);

  useEffect(() => {
    if (isOpen && otData) {
      // Điền sẵn giờ bắt đầu và kết thúc từ dữ liệu OT
      setApprovedStartTime(
        otData.startTime 
          ? dayjs(otData.startTime, ["HH:mm", dayjs.ISO_8601], true)
          : null
      );
      setApprovedEndTime(
        otData.endTime 
          ? dayjs(otData.endTime, ["HH:mm", dayjs.ISO_8601], true)
          : null
      );
    }
  }, [isOpen, otData]);

  if (!isOpen || !otData) return null;

  const handleConfirm = () => {
    if (!approvedStartTime || !approvedEndTime) {
      alert("Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc!");
      return;
    }

    const payload = {
      status: "APPROVED",
      approvedStartTime: dayjs(approvedStartTime).format("HH:mm"),
      approvedEndTime: dayjs(approvedEndTime).format("HH:mm")
    };
    
    onConfirm(otData._id, payload);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Duyệt đơn OT</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Thông tin nhân sự và tổng giờ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 min-w-[140px]">Nhân sự:</span>
              <span className="font-semibold text-gray-800">
                {otData.employeeId?.fullName || "--"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 min-w-[140px]">Tổng giờ đăng ký:</span>
              <span className="font-semibold text-gray-800">
                {otData.totalHours || 0} giờ
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t"></div>

          {/* Input giờ bắt đầu và kết thúc */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ bắt đầu duyệt <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={approvedStartTime}
                onChange={(v) => setApprovedStartTime(v)}
                format="HH:mm"
                className="w-full"
                placeholder="Chọn giờ bắt đầu"
                minuteStep={5}
                size="large"
                status={!approvedStartTime ? "error" : ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ kết thúc duyệt <span className="text-red-500">*</span>
              </label>
              <TimePicker
                value={approvedEndTime}
                onChange={(v) => setApprovedEndTime(v)}
                format="HH:mm"
                className="w-full"
                placeholder="Chọn giờ kết thúc"
                minuteStep={5}
                size="large"
                status={!approvedEndTime ? "error" : ""}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              Bạn có thể chỉnh sửa thời gian duyệt cho đơn OT này
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            style={{ width: 200, height: 50, borderRadius: 10,display:'flex',justifyContent:'center' }}
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Duyệt
          </button>
          {/* <Button
          style={{width:200,height:50,borderRadius:10}}
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
            <CheckCircle size={16} /> Duyệt
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default ApproveOTModal;
