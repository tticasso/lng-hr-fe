import React, { useEffect, useMemo, useState } from "react";
import { X, FileText, AlertCircle } from "lucide-react";
import Button from "../common/Button";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const pad2 = (n) => String(n).padStart(2, "0");

// ISO (YYYY-MM-DD) -> Date (local, không lệch timezone)
const isoToDate = (iso) => {
  if (!iso || typeof iso !== "string") return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

// Date -> ISO (YYYY-MM-DD) theo local date (không dùng toISOString để tránh lệch ngày)
const dateToISO = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

const LeaveRequestModal = ({ onClose, onConfirm, defaultFromDate = "" }) => {
  const [isShortLeave, setIsShortLeave] = useState(false);

  // ✅ formData lưu ISO để payload luôn chuẩn
  const [formData, setFormData] = useState({
    leaveType: "ANNUAL",
    fromDate: defaultFromDate, // ISO
    toDate: "", // ISO
    reason: "",
    leaveScope: "",
  });

  const [errors, setErrors] = useState({});

  // ✅ Sync ngày từ Timesheet mỗi lần mở modal với ngày khác
  useEffect(() => {
    if (!defaultFromDate) return;
    setFormData((p) => ({
      ...p,
      fromDate: defaultFromDate,
      toDate: p.toDate || defaultFromDate,
    }));
  }, [defaultFromDate]);

  const validate = () => {
    const e = {};

    if (!formData.leaveType) e.leaveType = "Vui lòng chọn loại nghỉ";
    if (!formData.reason.trim()) e.reason = "Vui lòng nhập lý do nghỉ";
    if (!formData.fromDate) e.fromDate = "Vui lòng chọn ngày bắt đầu";

    if (isShortLeave) {
      if (!formData.leaveScope) e.leaveScope = "Vui lòng chọn ca nghỉ";
    } else {
      if (!formData.toDate) e.toDate = "Vui lòng chọn ngày kết thúc";
      if (
        formData.fromDate &&
        formData.toDate &&
        new Date(formData.toDate) < new Date(formData.fromDate)
      ) {
        e.toDate = "Ngày kết thúc phải >= ngày bắt đầu";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const payload = useMemo(() => {
    return {
      leaveType: formData.leaveType,
      fromDate: formData.fromDate, // ISO
      toDate: isShortLeave ? formData.fromDate : formData.toDate, // ISO
      reason: formData.reason.trim(),
      leaveScope: isShortLeave ? formData.leaveScope : "FULL_DAY",
    };
  }, [formData, isShortLeave]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onConfirm?.(payload);
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
      errors[field]
        ? "border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:ring-blue-500"
    }`;

  const labelClass =
    "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide";

  const ErrorMsg = ({ field }) =>
    errors[field] && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={12} /> {errors[field]}
      </p>
    );

  // ✅ style input của react-datepicker để giống input thường (Tailwind)
  const datePickerInputClass = (field) =>
    `${inputClass(field)} bg-white`; // react-datepicker render <input> bên trong

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              Đơn xin nghỉ
            </h3>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Leave Type */}
          <div>
            <label className={labelClass}>Loại nghỉ *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className={inputClass("leaveType")}
            >
              <option value="ANNUAL">Nghỉ phép năm (Annual Leave)</option>
              <option value="UNPAID">Nghỉ không lương (Unpaid Leave)</option>
              <option value="SICK">Nghỉ ốm / bệnh (Sick Leave)</option>
              <option value="MATERNITY">Nghỉ thai sản (Maternity Leave)</option>
            </select>
            <ErrorMsg field="leaveType" />
          </div>

          {/* Reason */}
          <div>
            <label className={labelClass}>Lý do *</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className={inputClass("reason")}
            />
            <ErrorMsg field="reason" />
          </div>

          {/* Hình thức nghỉ */}
          <div>
            <label className={labelClass}>Hình thức nghỉ *</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!isShortLeave ? "primary" : "secondary"}
                onClick={() => {
                  setIsShortLeave(false);
                  setFormData((p) => ({ ...p, leaveScope: "" }));
                }}
              >
                Nghỉ dài ngày
              </Button>
              <Button
                type="button"
                variant={isShortLeave ? "primary" : "secondary"}
                onClick={() => setIsShortLeave(true)}
              >
                Nghỉ ngắn ngày
              </Button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Từ ngày *</label>

              <DatePicker
                selected={isoToDate(formData.fromDate)}
                onChange={(date) => {
                  const iso = dateToISO(date);
                  setFormData((p) => ({
                    ...p,
                    fromDate: iso,
                    // nếu nghỉ dài ngày và toDate đang trống -> set theo fromDate
                    toDate: isShortLeave ? p.toDate : (p.toDate || iso),
                  }));
                  if (errors.fromDate) setErrors((p) => ({ ...p, fromDate: "" }));
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Chọn ngày"
                className={datePickerInputClass("fromDate")}
                popperPlacement="bottom-start"
              />

              <ErrorMsg field="fromDate" />
            </div>

            {!isShortLeave && (
              <div>
                <label className={labelClass}>Đến ngày *</label>

                <DatePicker
                  selected={isoToDate(formData.toDate)}
                  onChange={(date) => {
                    const iso = dateToISO(date);
                    setFormData((p) => ({ ...p, toDate: iso }));
                    if (errors.toDate) setErrors((p) => ({ ...p, toDate: "" }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Chọn ngày"
                  className={datePickerInputClass("toDate")}
                  popperPlacement="bottom-start"
                  minDate={isoToDate(formData.fromDate) || undefined} // ✅ chặn chọn nhỏ hơn fromDate
                />

                <ErrorMsg field="toDate" />
              </div>
            )}
          </div>

          {/* Ca nghỉ */}
          {isShortLeave && (
            <div>
              <label className={labelClass}>Ca nghỉ *</label>
              <select
                name="leaveScope"
                value={formData.leaveScope}
                onChange={handleChange}
                className={inputClass("leaveScope")}
              >
                <option value="">-- Chọn ca --</option>
                <option value="MORNING">MORNING (08:00 - 12:00)</option>
                <option value="AFTERNOON">AFTERNOON (13:30 - 17:30)</option>
              </select>
              <ErrorMsg field="leaveScope" />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 text-white">
              Xác nhận
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
