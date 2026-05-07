import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Users, X } from "lucide-react";

import Button from "../common/Button";

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

const splitCodes = (value) =>
  value
    .split(/[\n,;]/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

const BulkAttendanceModal = ({
  departments = [],
  defaultDate,
  isOpen,
  loading = false,
  onClose,
  onSubmit,
  result,
}) => {
  const [formData, setFormData] = useState({
    date: defaultDate || "",
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

  const selectedDepartmentNames = useMemo(
    () =>
      departments
        .filter((department) => formData.departmentIds.includes(department._id))
        .map((department) => department.name),
    [departments, formData.departmentIds],
  );

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleDepartment = (departmentId) => {
    setFormData((prev) => {
      const isSelected = prev.departmentIds.includes(departmentId);
      return {
        ...prev,
        departmentIds: isSelected
          ? prev.departmentIds.filter((id) => id !== departmentId)
          : [...prev.departmentIds, departmentId],
      };
    });
  };

  const buildPayload = (dryRun) => ({
    date: formData.date || defaultDate || "",
    reasonType: formData.reasonType,
    note: formData.note,
    checkIn: formData.checkIn,
    checkOut: formData.checkOut,
    status: formData.status,
    workDayValue: Number(formData.workDayValue),
    employeeCodes: splitCodes(formData.employeeCodesText),
    excludeEmployeeCodes: splitCodes(formData.excludeEmployeeCodesText),
    departmentIds: formData.departmentIds,
    overwrite: formData.overwrite,
    dryRun,
  });

  const handleSubmit = (dryRun) => {
    onSubmit?.(buildPayload(dryRun));
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Users size={20} className="text-blue-600" />
              Tạo công hàng loạt
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Dùng khi máy chấm công lỗi, công ty có sự kiện đặc biệt hoặc cần cấp công thủ công cho nhiều nhân viên.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Ngày áp dụng
                  </span>
                  <input
                    type="date"
                    value={formData.date || defaultDate || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Lý do
                  </span>
                  <select
                    value={formData.reasonType}
                    onChange={(e) => handleFieldChange("reasonType", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {reasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Giờ vào
                  </span>
                  <input
                    type="time"
                    value={formData.checkIn}
                    onChange={(e) => handleFieldChange("checkIn", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Giờ ra
                  </span>
                  <input
                    type="time"
                    value={formData.checkOut}
                    onChange={(e) => handleFieldChange("checkOut", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Trạng thái
                  </span>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFieldChange("status", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                    Giá trị công
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.25"
                    value={formData.workDayValue}
                    onChange={(e) => handleFieldChange("workDayValue", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  Ghi chú
                </span>
                <textarea
                  rows={3}
                  value={formData.note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                  placeholder="VD: Công ty chuyển đồ nên nhân viên không chấm công được."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <label className="flex items-start gap-3 text-sm text-amber-800">
                  <input
                    type="checkbox"
                    checked={formData.overwrite}
                    onChange={(e) => handleFieldChange("overwrite", e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    Ghi đè attendance đã có trong ngày này. Nếu không bật, hệ thống chỉ tạo cho nhân viên chưa có bản ghi.
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase text-gray-500">
                    Phòng ban áp dụng
                  </span>
                  <button
                    type="button"
                    onClick={() => handleFieldChange("departmentIds", [])}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Tất cả
                  </button>
                </div>
                <div className="max-h-44 space-y-2 overflow-auto rounded-lg border border-gray-200 p-3">
                  {departments.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có dữ liệu phòng ban.</p>
                  ) : (
                    departments.map((department) => (
                      <label key={department._id} className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={formData.departmentIds.includes(department._id)}
                          onChange={() => handleToggleDepartment(department._id)}
                        />
                        {department.name}
                      </label>
                    ))
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedDepartmentNames.length > 0
                    ? `Đang chọn: ${selectedDepartmentNames.join(", ")}`
                    : "Không chọn phòng ban nghĩa là áp dụng cho toàn bộ nhân viên active/probation."}
                </p>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  Chỉ áp dụng mã nhân viên
                </span>
                <textarea
                  rows={3}
                  value={formData.employeeCodesText}
                  onChange={(e) => handleFieldChange("employeeCodesText", e.target.value)}
                  placeholder="J2620, J2621 hoặc mỗi dòng một mã. Bỏ trống để lấy theo phòng ban/toàn bộ."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  Loại trừ mã nhân viên
                </span>
                <textarea
                  rows={2}
                  value={formData.excludeEmployeeCodesText}
                  onChange={(e) => handleFieldChange("excludeEmployeeCodesText", e.target.value)}
                  placeholder="J2501, J2502"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </div>

          {result && (
            <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
              <div className="mb-2 flex items-center gap-2 font-semibold">
                <CheckCircle2 size={16} />
                Kết quả xử lý
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <span>Nhân viên khớp: <b>{result.matchedEmployees || 0}</b></span>
                <span>Đã có công: <b>{result.existingRecords || 0}</b></span>
                <span>Tạo mới: <b>{result.created || 0}</b></span>
                <span>Cập nhật: <b>{result.updated || 0}</b></span>
                <span>Bỏ qua: <b>{result.skippedExisting || 0}</b></span>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <span>
              Đây là thao tác ảnh hưởng payroll. Nên bấm “Xem trước” trước, sau đó mới “Ghi attendance”.
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Đóng
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Xem trước
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Ghi attendance
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkAttendanceModal;
