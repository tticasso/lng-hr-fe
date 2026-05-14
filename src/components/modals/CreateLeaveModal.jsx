import React, { useEffect, useMemo, useState } from "react";
import { X, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Button from "../common/Button";
import { leaveAPI } from "../../apis/leaveAPI";
import {
  canUseHRControlledLeaveTypes,
  getLeaveTypeOptionsForRole,
  hrControlledLeaveTypes,
} from "../../pages/leave/shared";
import { useAuth } from "../../context/AuthContext";
import { employeeApi } from "../../apis/employeeApi";

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

const getEntityId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const LeaveRequestModal = ({
  onClose,
  onConfirm,
  defaultFromDate = "",
  defaultLeaveType = "ANNUAL",
  initialValues = null,
  title = "Đơn xin nghỉ",
  submitLabel = "Xác nhận",
}) => {
  const { user } = useAuth();
  const currentRole = user?.accountId?.role || user?.role || null;
  const currentEmployeeId = getEntityId(user);
  const canUseControlledLeaveTypes = canUseHRControlledLeaveTypes(currentRole);
  const initialEmployeeId = getEntityId(initialValues?.employeeId) || currentEmployeeId;
  const allowedLeaveTypeOptions = useMemo(
    () => getLeaveTypeOptionsForRole(currentRole, initialValues?.leaveType || ""),
    [currentRole, initialValues?.leaveType],
  );
  const normalizedDefaultLeaveType = allowedLeaveTypeOptions.some(
    (option) => option.value === defaultLeaveType,
  )
    ? defaultLeaveType
    : "ANNUAL";
  const [isShortLeave, setIsShortLeave] = useState(
    Boolean(initialValues?.leaveScope && initialValues.leaveScope !== "FULL_DAY"),
  );
  const isEditing = Boolean(initialValues?._id);

  // ✅ formData lưu ISO để payload luôn chuẩn
  const [formData, setFormData] = useState({
    leaveType: initialValues?.leaveType || normalizedDefaultLeaveType,
    fromDate: initialValues?.fromDate ? dateToISO(new Date(initialValues.fromDate)) : defaultFromDate,
    toDate: initialValues?.toDate ? dateToISO(new Date(initialValues.toDate)) : "",
    reason: initialValues?.reason || "",
    leaveScope: initialValues?.leaveScope === "FULL_DAY" ? "" : (initialValues?.leaveScope || ""),
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(initialEmployeeId);

  // ✅ Sync ngày và loại nghỉ từ Timesheet mỗi lần mở modal
  useEffect(() => {
    if (initialValues) {
      setIsShortLeave(Boolean(initialValues.leaveScope && initialValues.leaveScope !== "FULL_DAY"));
      setFormData({
        leaveType: initialValues.leaveType || normalizedDefaultLeaveType,
        fromDate: initialValues.fromDate ? dateToISO(new Date(initialValues.fromDate)) : defaultFromDate,
        toDate: initialValues.toDate ? dateToISO(new Date(initialValues.toDate)) : "",
        reason: initialValues.reason || "",
        leaveScope: initialValues.leaveScope === "FULL_DAY" ? "" : (initialValues.leaveScope || ""),
      });
      return;
    }

    setFormData((p) => ({
      ...p,
      leaveType: normalizedDefaultLeaveType,
      fromDate: defaultFromDate || p.fromDate,
      toDate: defaultFromDate ? (p.toDate || defaultFromDate) : p.toDate,
    }));
  }, [defaultFromDate, initialValues, normalizedDefaultLeaveType]);

  useEffect(() => {
    setSelectedEmployeeId(initialEmployeeId);
  }, [initialEmployeeId]);

  useEffect(() => {
    if (!canUseControlledLeaveTypes) return;

    let isMounted = true;

    const fetchEmployees = async () => {
      setEmployeesLoading(true);
      try {
        const response = await employeeApi.getAll({ limit: 1000 });
        if (!isMounted) return;
        setEmployees(response.data?.data || response.data || []);
      } catch (error) {
        if (isMounted) setEmployees([]);
      } finally {
        if (isMounted) setEmployeesLoading(false);
      }
    };

    fetchEmployees();

    return () => {
      isMounted = false;
    };
  }, [canUseControlledLeaveTypes]);

  const validate = () => {
    const e = {};

    if (!formData.leaveType) e.leaveType = "Vui lòng chọn loại nghỉ";
    if (canUseControlledLeaveTypes && !selectedEmployeeId) {
      e.employeeId = "Vui lòng chọn nhân viên";
    }
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
    setPreview(null);
    setPreviewError("");
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const payload = useMemo(() => {
    return {
      leaveType: formData.leaveType,
      ...(canUseControlledLeaveTypes && selectedEmployeeId ? { employeeId: selectedEmployeeId } : {}),
      fromDate: formData.fromDate, // ISO
      toDate: isShortLeave ? formData.fromDate : formData.toDate, // ISO
      reason: formData.reason.trim(),
      leaveScope: isShortLeave ? formData.leaveScope : "FULL_DAY",
    };
  }, [canUseControlledLeaveTypes, formData, isShortLeave, selectedEmployeeId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onConfirm?.(payload);
  };

  const handlePreview = async () => {
    if (!validate()) return;

    setPreviewLoading(true);
    setPreview(null);
    setPreviewError("");

    try {
      const response = await leaveAPI.preview(payload);
      setPreview(response?.data?.data || response?.data || null);
    } catch (error) {
      setPreviewError(
        error.normalizedMessage ||
        error.response?.data?.message ||
        "Không thể xem trước đơn nghỉ"
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors[field]
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

  const employeeOptions = useMemo(() => {
    const list = Array.isArray(employees) ? [...employees] : [];
    const initialEmployee = initialValues?.employeeId;
    const initialId = getEntityId(initialEmployee);

    if (
      initialId &&
      typeof initialEmployee === "object" &&
      !list.some((employee) => getEntityId(employee) === initialId)
    ) {
      list.unshift(initialEmployee);
    }

    if (
      currentEmployeeId &&
      user &&
      !list.some((employee) => getEntityId(employee) === currentEmployeeId)
    ) {
      list.unshift(user);
    }

    return list;
  }, [currentEmployeeId, employees, initialValues?.employeeId, user]);

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
              {title}
            </h3>
          </div>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {canUseControlledLeaveTypes && (
            <div>
              <label className={labelClass}>Nhân viên áp dụng *</label>
              <select
                name="employeeId"
                value={selectedEmployeeId}
                onChange={(event) => {
                  setSelectedEmployeeId(event.target.value);
                  setPreview(null);
                  setPreviewError("");
                  if (errors.employeeId) setErrors((p) => ({ ...p, employeeId: "" }));
                }}
                disabled={isEditing || employeesLoading}
                className={inputClass("employeeId")}
              >
                <option value="">
                  {employeesLoading ? "Đang tải nhân viên..." : "-- Chọn nhân viên --"}
                </option>
                {employeeOptions.map((employee) => {
                  const employeeId = getEntityId(employee);
                  return (
                    <option key={employeeId} value={employeeId}>
                      {employee.fullName || "Chưa có tên"} ({employee.employeeCode || "--"})
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                HR/Admin có thể tạo hoặc ghi nhận đơn nghỉ cho nhân viên khác.
              </p>
              <ErrorMsg field="employeeId" />
            </div>
          )}

          {/* Leave Type */}
          <div>
            <label className={labelClass}>Loại nghỉ *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className={inputClass("leaveType")}
            >
              {allowedLeaveTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {!canUseControlledLeaveTypes && (
              <p className="mt-1 text-xs text-gray-500">
                Một số loại nghỉ đặc biệt có lương cần HR/Admin tạo hoặc hướng dẫn hồ sơ.
              </p>
            )}
            {canUseControlledLeaveTypes && hrControlledLeaveTypes.includes(formData.leaveType) && (
              <p className="mt-1 text-xs font-medium text-amber-700">
                Loại nghỉ này thuộc nhóm HR kiểm soát, cần kiểm tra hồ sơ/chính sách trước khi duyệt.
              </p>
            )}
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
                  setPreview(null);
                  setPreviewError("");
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
                  setPreview(null);
                  setPreviewError("");
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
                <option value="MORNING">Nghỉ ca sáng (08:00 - 12:00)</option>
                <option value="AFTERNOON">Nghỉ ca chiều (13:30 - 17:30)</option>
                <option value="FULL_DAY">Nghỉ cả ngày (08:00 - 17:30)</option>
              </select>
              <ErrorMsg field="leaveScope" />
            </div>
          )}

          {!isEditing && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-900">Kiểm tra trước khi gửi</p>
                <p className="text-xs text-blue-700">
                  Tính số ngày nghỉ thực tế, ngày lễ và lịch bị trùng.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePreview}
                disabled={previewLoading}
                className="shrink-0"
              >
                {previewLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                Xem trước
              </Button>
            </div>

            {previewError && (
              <p className="mt-3 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle size={14} /> {previewError}
              </p>
            )}

            {preview && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div className="rounded-md bg-white p-2">
                  <p className="text-xs text-gray-500">Số ngày tính phép</p>
                  <p className="font-bold text-blue-700">{preview.totalDays ?? 0}</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-xs text-gray-500">Có thể tạo</p>
                  <p className={`font-bold ${preview.isPossible ? "text-green-700" : "text-red-700"}`}>
                    {preview.isPossible ? "Có" : "Không"}
                  </p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-xs text-gray-500">Ngày lễ</p>
                  <p className="font-bold text-gray-800">{preview.holidayCount ?? 0}</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-xs text-gray-500">Trùng lịch</p>
                  <p className="font-bold text-gray-800">{preview.conflictCount ?? 0}</p>
                </div>
                {preview.balance && (
                  <div className="col-span-2 rounded-md bg-white p-2 sm:col-span-4">
                    <p className="text-xs text-gray-500">Số dư phép năm</p>
                    <p className={`font-bold ${preview.balance.isEnough ? "text-green-700" : "text-red-700"}`}>
                      Còn {preview.balance.currentBalance ?? 0} ngày
                      {" · "}
                      Sau khi gửi: {preview.balance.remainingAfterRequest ?? 0}
                    </p>
                    {preview.balance.message && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {preview.balance.message}
                      </p>
                    )}
                  </div>
                )}
                {Array.isArray(preview.holidays) && preview.holidays.length > 0 && (
                  <p className="col-span-2 text-xs text-gray-600 sm:col-span-4">
                    Ngày lễ: {preview.holidays.join(", ")}
                  </p>
                )}
                {Array.isArray(preview.conflicts) && preview.conflicts.length > 0 && (
                  <p className="col-span-2 text-xs text-gray-600 sm:col-span-4">
                    Don trung: {preview.conflicts.map((item) => item.type || item.id).join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" className="bg-blue-600 text-white">
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestModal;
