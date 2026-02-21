import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Save, CheckCircle } from "lucide-react";
import { Button } from "antd";

const ApproveOTModal = ({ isOpen, onClose, otData, onConfirm }) => {
  const [approvedHours, setApprovedHours] = useState("");

  useEffect(() => {
    if (isOpen && otData) {
      // Điền sẵn tổng giờ vào input
      setApprovedHours(otData.totalHours || "");
    }
  }, [isOpen, otData]);

  if (!isOpen || !otData) return null;

  const handleConfirm = () => {
    const hours = parseFloat(approvedHours);
    if (isNaN(hours) || hours <= 0) {
      alert("Vui lòng nhập số giờ hợp lệ!");
      return;
    }
    onConfirm(otData._id, hours);
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

          {/* Input số giờ duyệt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian muốn duyệt <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max={otData.totalHours || 24}
              value={approvedHours}
              onChange={(e) => setApprovedHours(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Nhập số giờ duyệt"
            />
            <p className="text-xs text-gray-500 mt-1">
              Bạn có thể chỉnh sửa số giờ duyệt (tối đa {otData.totalHours || 0} giờ)
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
