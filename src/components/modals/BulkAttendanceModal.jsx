import { useState } from "react";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { AlertTriangle, Check, CheckCircle2, Loader2, Trash2, Users, X } from "lucide-react";

import Button from "../common/Button";
import { buildBulkAttendanceDeletePayload, buildBulkAttendancePayload } from "./bulkAttendanceForm";

const reasonOptions = [
  { value: "COMPANY_MOVE", label: "Công ty chuyển đồ" },
  { value: "DEVICE_FAILURE", label: "Máy chấm công lỗi" },
  { value: "SPECIAL_WORK_DAY", label: "Ngày làm việc đặc biệt" },
  { value: "MANUAL_BULK", label: "Điều chỉnh hàng loạt" },
];

const statusOptions = [
  { value: "PRESENT", label: "Có công" },
  { value: "HALF_DAY", label: "Nửa ngày" },
  { value: "REST_DAY", label: "Nghỉ luân phiên" },
  { value: "HOLIDAY", label: "Ngày lễ" },
];

const fieldClass = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const Section = ({ number, title, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {number}
      </span>
      <h4 className="font-semibold text-gray-900">{title}</h4>
    </div>
    {children}
  </section>
);

const BulkAttendanceModal = ({
  departments = [],
  defaultDate,
  isOpen,
  loading = false,
  operation = "WRITE",
  onClose,
  onSubmit,
  result,
}) => {
  const isDelete = operation === "DELETE";
  const [formData, setFormData] = useState({
    dates: defaultDate ? [defaultDate] : [],
    updateMode: "FULL",
    reasonType: "COMPANY_MOVE",
    note: "",
    checkIn: "08:00",
    checkOut: "17:30",
    status: "PRESENT",
    workDayValue: "1",
    employeeCodesText: "",
    excludeEmployeeCodesText: "",
    departmentIds: [],
    overwrite: false,
  });
  const [isPreview, setIsPreview] = useState(false);

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsPreview(false);
  };

  const handleClose = () => {
    setIsPreview(false);
    onClose?.();
  };

  const handleSubmit = async (dryRun) => {
    const payload = isDelete
      ? buildBulkAttendanceDeletePayload(formData, dryRun)
      : buildBulkAttendancePayload(formData, dryRun);
    const response = await onSubmit?.(payload);
    if (dryRun && response) setIsPreview(true);
    if (!dryRun && response) handleClose();
  };

  const isCheckoutOnly = formData.updateMode === "CHECK_OUT_ONLY";
  const hasEmployeeScope = Boolean(formData.employeeCodesText.trim()) || formData.departmentIds.length > 0;
  const canSubmit = formData.dates.length > 0 && (isDelete ? hasEmployeeScope : Boolean(formData.checkOut));
  const departmentOptions = departments.map((department) => ({
    value: department._id,
    label: department.name,
  }));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl lg:max-h-none">
        <header className="flex items-start justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Users size={20} className="text-blue-600" />
              {isDelete ? "Xóa công hàng loạt" : "Tạo công hàng loạt"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isDelete
                ? "Chọn người và ngày, xem trước rồi xác nhận xóa vĩnh viễn."
                : "Chọn người, chọn ngày rồi xem trước trước khi cập nhật."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 lg:overflow-visible">
          {!isPreview ? (
            <div className="space-y-4">
              {!isDelete && <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-200 p-1">
                {[
                  ["FULL", "Gán đầy đủ ca"],
                  ["CHECK_OUT_ONLY", "Chỉ sửa giờ ra"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleFieldChange("updateMode", value)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      formData.updateMode === value
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>}

              <div className="grid items-start gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                <Section number="1" title="Chọn nhân viên">
                <div className="space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Mã nhân viên</span>
                    <textarea
                      rows={2}
                      value={formData.employeeCodesText}
                      onChange={(event) => handleFieldChange("employeeCodesText", event.target.value)}
                      placeholder="J2501, J2502, J2503"
                      className={`${fieldClass} font-mono`}
                    />
                  </label>

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="h-px flex-1 bg-gray-200" /> hoặc chọn theo phòng ban <span className="h-px flex-1 bg-gray-200" />
                  </div>

                  <Select
                    mode="multiple"
                    allowClear
                    value={formData.departmentIds}
                    options={departmentOptions}
                    onChange={(values) => handleFieldChange("departmentIds", values)}
                    placeholder="Chọn phòng ban"
                    maxTagCount="responsive"
                    className="w-full"
                  />

                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-gray-500 hover:text-gray-700">
                      Loại trừ nhân viên
                    </summary>
                    <textarea
                      rows={2}
                      value={formData.excludeEmployeeCodesText}
                      onChange={(event) => handleFieldChange("excludeEmployeeCodesText", event.target.value)}
                      placeholder="J2510, J2511"
                      className={`${fieldClass} mt-2 font-mono`}
                    />
                  </details>

                  <p className="text-xs text-gray-500">
                    {isDelete
                      ? "Bắt buộc chọn mã nhân viên hoặc phòng ban để tránh xóa nhầm."
                      : "Bỏ trống cả mã nhân viên và phòng ban sẽ áp dụng cho toàn bộ nhân viên active/probation."}
                  </p>
                </div>
              </Section>

              <Section number="2" title="Chọn ngày">
                <DatePicker
                  multiple
                  allowClear
                  format="DD/MM/YYYY"
                  value={formData.dates.map((date) => dayjs(date))}
                  onChange={(values) => handleFieldChange(
                    "dates",
                    (values || []).map((value) => value.format("YYYY-MM-DD")),
                  )}
                  placeholder="Chọn một hoặc nhiều ngày"
                  maxTagCount="responsive"
                  className="w-full"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Đã chọn {formData.dates.length} ngày.
                </p>
              </Section>
                </div>

              {!isDelete && <Section number="3" title="Nội dung cập nhật">
                <div className="space-y-4">
                  <div className={`grid grid-cols-1 gap-3 ${isCheckoutOnly ? "sm:grid-cols-2" : "sm:grid-cols-4"}`}>
                    {!isCheckoutOnly && (
                      <label>
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Giờ vào</span>
                        <input
                          type="time"
                          value={formData.checkIn}
                          onChange={(event) => handleFieldChange("checkIn", event.target.value)}
                          className={fieldClass}
                        />
                      </label>
                    )}
                    <label>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700">Giờ ra</span>
                      <input
                        type="time"
                        value={formData.checkOut}
                        onChange={(event) => handleFieldChange("checkOut", event.target.value)}
                        className={fieldClass}
                      />
                    </label>
                    {!isCheckoutOnly && (
                      <label>
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Trạng thái</span>
                        <select
                          value={formData.status}
                          onChange={(event) => handleFieldChange("status", event.target.value)}
                          className={fieldClass}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </label>
                    )}
                    {!isCheckoutOnly && (
                      <label>
                        <span className="mb-1.5 block text-sm font-medium text-gray-700">Giá trị công</span>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.25"
                          value={formData.workDayValue}
                          onChange={(event) => handleFieldChange("workDayValue", event.target.value)}
                          className={fieldClass}
                        />
                      </label>
                    )}
                    <label className={isCheckoutOnly ? "" : "sm:col-span-2"}>
                      <span className="mb-1.5 block text-sm font-medium text-gray-700">Lý do</span>
                      <select
                        value={formData.reasonType}
                        onChange={(event) => handleFieldChange("reasonType", event.target.value)}
                        className={fieldClass}
                      >
                        {reasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {isCheckoutOnly && (
                    <div className="grid gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 sm:grid-cols-3">
                      {["Giữ nguyên giờ vào", "Tính lại công tự động", "Bỏ qua ngày chưa có attendance"].map((item) => (
                        <span key={item} className="flex items-center gap-2">
                          <Check size={15} className="shrink-0" /> {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Ghi chú</span>
                    <textarea
                      rows={2}
                      value={formData.note}
                      onChange={(event) => handleFieldChange("note", event.target.value)}
                      placeholder="Nội dung điều chỉnh"
                      className={fieldClass}
                    />
                  </label>

                  {!isCheckoutOnly && (
                    <label className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                      <input
                        type="checkbox"
                        checked={formData.overwrite}
                        onChange={(event) => handleFieldChange("overwrite", event.target.checked)}
                        className="mt-1"
                      />
                      Ghi đè attendance đã có; nếu không bật, chỉ tạo bản ghi còn thiếu.
                    </label>
                  )}
                </div>
              </Section>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`rounded-xl border p-5 ${isDelete ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}`}>
                <div className={`flex items-center gap-2 font-semibold ${isDelete ? "text-red-900" : "text-blue-900"}`}>
                  {isDelete ? <Trash2 size={18} /> : <CheckCircle2 size={18} />} {isDelete ? "Sẵn sàng xóa" : "Sẵn sàng cập nhật"}
                </div>
                <p className={`mt-2 text-sm ${isDelete ? "text-red-800" : "text-blue-800"}`}>
                  {result?.matchedEmployees || 0} nhân viên × {result?.dateCount || 1} ngày, dự kiến {isDelete ? "xóa" : "xử lý"} {result?.targetRecords || 0} bản ghi.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(isDelete
                    ? [["Sẽ xóa", result?.targetRecords], ["Nhân viên", result?.matchedEmployees], ["Ngày", result?.dateCount]]
                    : [["Sẽ xử lý", result?.targetRecords], ["Đã có công", result?.existingRecords], ["Bỏ qua", result?.skippedExisting], ["Thiếu attendance", result?.skippedMissing]]
                  ).map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white p-3">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="mt-1 text-xl font-bold text-gray-900">{value || 0}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertTriangle size={17} className="mt-0.5 shrink-0" />
                {isDelete ? "Xác nhận sẽ xóa vĩnh viễn các attendance đã xem trước và có thể ảnh hưởng payroll." : "Xác nhận sẽ cập nhật attendance và có thể ảnh hưởng payroll."}
              </div>
            </div>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
          {!isPreview ? (
            <>
              <Button variant="secondary" onClick={handleClose} disabled={loading}>Đóng</Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={loading || !canSubmit}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Xem trước
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsPreview(false)} disabled={loading}>
                Quay lại chỉnh sửa
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {isDelete ? "Xác nhận xóa" : "Xác nhận cập nhật"}
              </Button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default BulkAttendanceModal;
