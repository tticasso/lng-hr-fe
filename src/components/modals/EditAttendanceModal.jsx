import React, { useState, useEffect } from "react";
import { X, Save, Paperclip, Trash2 } from "lucide-react";
import { TimePicker } from "antd";
import Button from "../common/Button";
import { toast } from "react-toastify";
import dayjs from "../../untils/dayjs";
import { attendancesAPI } from "../../apis/attendancesAPI";

const EditAttendanceModal = ({ isOpen, onClose, attendanceLog, employee, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    reason: "",
    attachment: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (attendanceLog) {
      setFormData({
        checkIn: attendanceLog.checkIn || "",
        checkOut: attendanceLog.checkOut || "",
        reason: "",
        attachment: null,
      });
    }
  }, [attendanceLog]);

  const handleTimeChange = (field, time) => {
    // Convert dayjs to HH:mm string
    const timeString = time ? time.format("HH:mm") : "";
    setFormData({ ...formData, [field]: timeString });
  };

  const handleSave = () => {
    // Validate
    if (!formData.checkIn || !formData.checkOut) {
      toast.error("Vui lòng nhập đầy đủ giờ vào và giờ ra");
      return;
    }

    if (!formData.reason.trim()) {
      toast.error("Vui lòng nhập lý do điều chỉnh");
      return;
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(formData.checkIn) || !timeRegex.test(formData.checkOut)) {
      toast.error("Định dạng giờ không hợp lệ (HH:mm)");
      return;
    }

    console.group("💾 [EDIT ATTENDANCE] Saving changes");
    console.log("📋 Form Data:", formData);
    console.log("👤 Employee:", employee);
    console.log("📝 Attendance Log:", attendanceLog);
    console.groupEnd();

    if (onSave) {
      onSave(formData);
    }

    // toast.success("Đã lưu thay đổi chấm công");
    onClose();
  };

  const handleDelete = async () => {
    if (!attendanceLog?._id) {
      toast.error("Không tìm thấy ID bản ghi chấm công");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa bản ghi chấm công ngày ${new Date(attendanceLog.date).toLocaleDateString("vi-VN")} của ${employee?.fullName}?`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await attendancesAPI.delete(attendanceLog._id);
      toast.success("Đã xóa bản ghi chấm công thành công");
      
      if (onDelete) {
        onDelete(attendanceLog._id);
      }
      
      onClose();
    } catch (error) {
      console.error("Error deleting attendance:", error);
      toast.error(error.response?.data?.message || "Xóa bản ghi chấm công thất bại");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800">Hiệu chỉnh dữ liệu công</h3>
            {attendanceLog && employee && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(attendanceLog.date).toLocaleDateString("vi-VN")} • {employee.fullName}
              </p>
            )}
          </div>
          <button onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Giờ vào (Mới)
              </label>
              <TimePicker
                value={formData.checkIn ? dayjs(formData.checkIn, "HH:mm") : null}
                onChange={(time) => handleTimeChange("checkIn", time)}
                format="HH:mm"
                placeholder="Chọn giờ vào"
                className="w-full"
                size="large"
                minuteStep={5}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Giờ ra (Mới)
              </label>
              <TimePicker
                value={formData.checkOut ? dayjs(formData.checkOut, "HH:mm") : null}
                onChange={(time) => handleTimeChange("checkOut", time)}
                format="HH:mm"
                placeholder="Chọn giờ ra"
                className="w-full"
                size="large"
                minuteStep={5}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do điều chỉnh <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nhập lý do (VD: Quên chấm công, Máy hỏng...)"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đính kèm minh chứng
              <span className="text-red-500"> (chưa sử dụng)</span>
            </label>
            <label
              htmlFor="attachment-upload"
              className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer transition"
            >
              <Paperclip size={16} className="mr-2" />
              <span className="text-xs">
                {formData.attachment ? formData.attachment.name : "Upload ảnh/file"}
              </span>
            </label>
            <input
              type="file"
              className="hidden"
              onChange={(e) =>
                setFormData({ ...formData, attachment: e.target.files?.[0] || null })
              }
              id="attachment-upload"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <Button
            variant="secondary"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200 flex items-center gap-2"
          >
            <Trash2 size={16} />
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={handleSave}
              disabled={isDeleting}
            >
              <Save size={16} /> Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAttendanceModal;
