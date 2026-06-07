import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Loader2,
  MinusCircle,
  Pencil,
  Plus,
  PlusCircle,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import { payrollAdjustmentAPI } from "../../apis/payrollAdjustmentAPI";
import { employeeApi } from "../../apis/employeeApi";
import {
  ADJUSTMENT_CODE_LABELS,
  ADJUSTMENT_TYPE_LABELS,
  formatMoney,
} from "../../pages/payroll/overview/payrollOverviewUtils";
import { formatEmployeeCode } from "../../utils/employeeDisplay";

const emptyForm = {
  employeeId: "",
  type: "EARNING",
  code: "BONUS",
  name: "",
  amount: "",
  note: "",
};

const formatInputMoney = (value) => {
  const num = Number(String(value || "").replace(/[^\d]/g, ""));
  return num ? new Intl.NumberFormat("vi-VN").format(num) : "";
};

const parseInputMoney = (value) => Number(String(value || "").replace(/[^\d]/g, "")) || 0;

const getEmployeeId = (employee) => employee?._id || employee?.id || employee;

const adjustmentTypeOptions = [
  {
    value: "EARNING",
    icon: PlusCircle,
    title: "Cộng thu nhập",
    description: "Thưởng, truy lĩnh hoặc khoản cộng vào tổng thu nhập.",
    tone: "green",
  },
  {
    value: "ALLOWANCE",
    icon: CheckCircle2,
    title: "Phụ cấp bổ sung",
    description: "Khoản phụ cấp phát sinh ngoài phụ cấp cố định.",
    tone: "blue",
  },
  {
    value: "DEDUCTION",
    icon: MinusCircle,
    title: "Khấu trừ",
    description: "Tạm ứng, phạt hoặc khoản trừ khỏi lương thực nhận.",
    tone: "red",
  },
];

const getTypeToneClass = (tone, active) => {
  const toneMap = {
    green: active
      ? "border-green-400 bg-green-50 text-green-800"
      : "border-gray-200 bg-white text-gray-700 hover:border-green-200 hover:bg-green-50",
    blue: active
      ? "border-blue-400 bg-blue-50 text-blue-800"
      : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50",
    red: active
      ? "border-red-400 bg-red-50 text-red-800"
      : "border-gray-200 bg-white text-gray-700 hover:border-red-200 hover:bg-red-50",
  };

  return toneMap[tone] || toneMap.green;
};

const PayrollAdjustmentModal = ({
  isOpen,
  onClose,
  payroll,
  bulkPayrolls = [],
  selectedMonth,
  onChanged,
  canRunPayroll = false,
}) => {
  const [adjustments, setAdjustments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [year, month] = useMemo(() => selectedMonth.split("-"), [selectedMonth]);
  const payrollEmployee = payroll?.employeeId;
  const lockedEmployeeId = getEmployeeId(payrollEmployee);
  const bulkEmployeeIds = useMemo(
    () => [
      ...new Set(
        bulkPayrolls
          .map((item) => getEmployeeId(item.employeeId))
          .filter(Boolean),
      ),
    ],
    [bulkPayrolls],
  );
  const isBulkMode = !lockedEmployeeId && bulkEmployeeIds.length > 0;
  const isPayrollLocked = ["FINALIZED", "PAID"].includes(payroll?.status);

  const employeeOptions = useMemo(() => {
    if (lockedEmployeeId && payrollEmployee) {
      return [payrollEmployee];
    }
    return employees;
  }, [employees, lockedEmployeeId, payrollEmployee]);

  const preview = useMemo(() => {
    const amount = parseInputMoney(form.amount);
    const isDeduction = form.type === "DEDUCTION";
    const currentAdjustment = editingId
      ? adjustments.find((item) => item._id === editingId)
      : null;
    const oldAmount = Number(currentAdjustment?.amount || 0);
    const oldIsDeduction = currentAdjustment?.type === "DEDUCTION";
    const oldGrossImpact = currentAdjustment && !oldIsDeduction ? oldAmount : 0;
    const oldDeductionImpact = currentAdjustment && oldIsDeduction ? oldAmount : 0;
    const newGrossImpact = !isDeduction ? amount : 0;
    const newDeductionImpact = isDeduction ? amount : 0;
    const grossDelta = newGrossImpact - oldGrossImpact;
    const deductionDelta = newDeductionImpact - oldDeductionImpact;
    const netDelta = grossDelta - deductionDelta;
    const targetCount = isBulkMode ? bulkEmployeeIds.length : 1;
    const grossIncome = Number(payroll?.grossIncome || 0);
    const totalDeduction = Number(payroll?.totalDeduction || 0);
    const netIncome = Number(payroll?.netIncome || 0);

    return {
      amount,
      targetCount,
      isDeduction,
      grossDelta,
      deductionDelta,
      netDelta,
      nextGrossIncome: grossIncome + grossDelta,
      nextTotalDeduction: totalDeduction + deductionDelta,
      nextNetIncome: netIncome + netDelta,
      totalNetDelta: netDelta * targetCount,
      hasPayrollSnapshot: Boolean(payroll?._id && !payroll?.__bulk),
    };
  }, [adjustments, bulkEmployeeIds.length, editingId, form.amount, form.type, isBulkMode, payroll]);

  const fetchAdjustments = async () => {
    if (!isOpen) return;

    try {
      setLoading(true);
      const params = {
        month: Number(month),
        year: Number(year),
        status: "ACTIVE",
        limit: 200,
      };
      if (lockedEmployeeId) params.employeeId = lockedEmployeeId;

      const res = await payrollAdjustmentAPI.getAll(params);
      setAdjustments(res.data?.data || []);
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải khoản điều chỉnh");
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (lockedEmployeeId || isBulkMode) return;
    try {
      const res = await employeeApi.getAll({ limit: 500 });
      setEmployees(res.data?.data || []);
    } catch (error) {
      setEmployees([]);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      ...emptyForm,
      employeeId: lockedEmployeeId || "",
    });
    setEditingId(null);
    fetchEmployees();
    fetchAdjustments();
  }, [isOpen, selectedMonth, lockedEmployeeId, isBulkMode]);

  if (!isOpen) return null;

  const showReviewWarning = (result) => {
    const reviews = result?.payrollsRequireReview || [];
    if (reviews.length === 0) return;

    const names = reviews
      .slice(0, 3)
      .map((item) => item.employeeCode || item.fullName)
      .filter(Boolean)
      .join(", ");

    toast.warning(
      `Có ${reviews.length} phiếu lương đã chốt cần mở lại/tính lại${names ? `: ${names}` : ""}.`,
      { autoClose: 8000 },
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      employeeId: lockedEmployeeId || "",
    });
  };

  const handleEdit = (item) => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để điều chỉnh bảng lương");
      return;
    }

    if (isBulkMode) {
      toast.warning("Chế độ hàng loạt chỉ dùng để thêm khoản điều chỉnh mới");
      return;
    }

    setEditingId(item._id);
    setForm({
      employeeId: getEmployeeId(item.employeeId) || "",
      type: item.type || "EARNING",
      code: item.code || "OTHER",
      name: item.name || "",
      amount: formatInputMoney(item.amount),
      note: item.note || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để điều chỉnh bảng lương");
      return;
    }

    const payload = {
      employeeId: lockedEmployeeId || form.employeeId,
      month: Number(month),
      year: Number(year),
      type: form.type,
      code: form.code,
      name: form.name.trim(),
      amount: parseInputMoney(form.amount),
      note: form.note.trim(),
    };

    if (!isBulkMode && !payload.employeeId) {
      toast.warning("Vui lòng chọn nhân viên");
      return;
    }
    if (!payload.name) {
      toast.warning("Vui lòng nhập tên khoản điều chỉnh");
      return;
    }
    if (payload.amount <= 0) {
      toast.warning("Số tiền phải lớn hơn 0");
      return;
    }

    try {
      setSaving(true);
      const res = isBulkMode
        ? await payrollAdjustmentAPI.createBulk({
            ...payload,
            employeeIds: bulkEmployeeIds,
            employeeId: undefined,
          })
        : editingId
        ? await payrollAdjustmentAPI.update(editingId, payload)
        : await payrollAdjustmentAPI.create(payload);
      const result = res.data?.data || {};

      toast.success(
        isBulkMode
          ? `Đã thêm khoản điều chỉnh cho ${result.createdCount || bulkEmployeeIds.length} nhân viên`
          : editingId
          ? "Đã cập nhật khoản điều chỉnh"
          : "Đã thêm khoản điều chỉnh",
      );
      showReviewWarning(result);
      resetForm();
      await fetchAdjustments();
      onChanged?.();
    } catch (error) {
      toast.error(error.normalizedMessage || "Lưu khoản điều chỉnh thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (item) => {
    if (!canRunPayroll) {
      toast.error("Bạn không có quyền WRITE_PAYROLLS để điều chỉnh bảng lương");
      return;
    }

    if (!window.confirm(`Hủy khoản điều chỉnh "${item.name}"?`)) return;

    try {
      const res = await payrollAdjustmentAPI.cancel(item._id);
      const result = res.data?.data || {};
      toast.success("Đã hủy khoản điều chỉnh");
      showReviewWarning(result);
      await fetchAdjustments();
      onChanged?.();
      if (editingId === item._id) resetForm();
    } catch (error) {
      toast.error(error.normalizedMessage || "Hủy khoản điều chỉnh thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Khoản điều chỉnh lương</h3>
            <p className="mt-1 text-sm text-gray-500">
              Kỳ lương tháng {month}/{year}
              {isBulkMode
                ? ` - ${bulkEmployeeIds.length} nhân viên đã chọn`
                : payrollEmployee?.fullName
                ? ` - ${payrollEmployee.fullName}`
                : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {isPayrollLocked && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            Phiếu lương này đã chốt/thanh toán. Bạn vẫn có thể lưu điều chỉnh, nhưng cần mở lại và tính lại phiếu để áp dụng.
          </div>
        )}

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[380px_minmax(0,1fr)]">
          <form onSubmit={handleSubmit} className="min-h-0 space-y-4 overflow-auto border-r border-gray-200 p-5">
            {isBulkMode ? (
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
                <div className="flex items-start gap-2">
                  <Users size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Áp dụng cho {bulkEmployeeIds.length} nhân viên</p>
                    <p className="mt-1 text-xs text-purple-700">
                      Khoản này sẽ được tạo riêng cho từng nhân viên đã chọn trong kỳ lương hiện tại.
                    </p>
                  </div>
                </div>
              </div>
            ) : !lockedEmployeeId && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Nhân viên</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm((prev) => ({ ...prev, employeeId: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Chọn nhân viên</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.fullName} ({formatEmployeeCode(employee.employeeCode)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Loại khoản điều chỉnh
              </label>
              <div className="grid grid-cols-1 gap-2">
                {adjustmentTypeOptions.map((option) => {
                  const Icon = option.icon;
                  const active = form.type === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, type: option.value }))}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${getTypeToneClass(option.tone, active)}`}
                    >
                      <Icon size={18} className="mt-0.5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{option.title}</span>
                        <span className="mt-0.5 block text-xs opacity-80">{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mã khoản</label>
                <select
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  {Object.entries(ADJUSTMENT_CODE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tên khoản</label>
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="VD: Truy lĩnh phụ cấp tháng trước"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Số tiền</label>
              <input
                value={form.amount}
                onChange={(e) => setForm((prev) => ({ ...prev, amount: formatInputMoney(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                placeholder="Lý do điều chỉnh"
              />
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-800">
                <Calculator size={16} />
                Xem trước ảnh hưởng
              </div>

              {preview.amount <= 0 ? (
                <p className="text-sm text-blue-700/70">
                  Nhập số tiền để xem khoản này sẽ làm lương tăng hoặc giảm như thế nào.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-white/80 p-3">
                      <p className="text-xs uppercase text-blue-500">Mỗi nhân viên</p>
                      <p className={`mt-1 font-mono text-lg font-bold ${preview.netDelta < 0 ? "text-red-600" : "text-green-700"}`}>
                        {preview.netDelta < 0 ? "-" : "+"}
                        {formatMoney(Math.abs(preview.netDelta))}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/80 p-3">
                      <p className="text-xs uppercase text-blue-500">Số nhân viên</p>
                      <p className="mt-1 font-mono text-lg font-bold text-blue-900">
                        {preview.targetCount}
                      </p>
                    </div>
                  </div>

                  {isBulkMode ? (
                    <div className="rounded-lg bg-white/80 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-600">Tổng ảnh hưởng dự kiến</span>
                        <span className={`font-mono font-bold ${preview.totalNetDelta < 0 ? "text-red-600" : "text-green-700"}`}>
                          {preview.totalNetDelta < 0 ? "-" : "+"}
                          {formatMoney(Math.abs(preview.totalNetDelta))}
                        </span>
                      </div>
                    </div>
                  ) : preview.hasPayrollSnapshot ? (
                    <div className="space-y-2 rounded-lg bg-white/80 p-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-600">Tổng thu nhập</span>
                        <span className="font-mono text-gray-800">
                          {formatMoney(payroll.grossIncome)} → {formatMoney(preview.nextGrossIncome)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-gray-600">Tổng khấu trừ</span>
                        <span className="font-mono text-gray-800">
                          {formatMoney(payroll.totalDeduction)} → {formatMoney(preview.nextTotalDeduction)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-blue-100 pt-2">
                        <span className="font-semibold text-gray-700">Thực nhận</span>
                        <span className={`font-mono font-bold ${preview.netDelta < 0 ? "text-red-600" : "text-green-700"}`}>
                          {formatMoney(payroll.netIncome)} → {formatMoney(preview.nextNetIncome)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-700/80">
                      Khoản này sẽ được áp dụng khi chạy tính lương cho kỳ đã chọn.
                    </p>
                  )}

                  {isPayrollLocked && (
                    <p className="rounded-md bg-amber-100 px-3 py-2 text-xs font-medium text-amber-800">
                      Phiếu đã chốt/thanh toán: preview chỉ để tham khảo. Cần mở lại và tính lại lương để số tiền này đi vào phiếu.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                {editingId ? "Cập nhật" : "Thêm khoản"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Hủy sửa
                </button>
              )}
            </div>
          </form>

          <div className="min-h-0 overflow-auto p-5">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-gray-500">
                <Loader2 size={22} className="mr-2 animate-spin text-blue-600" />
                Đang tải...
              </div>
            ) : adjustments.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
                Chưa có khoản điều chỉnh
              </div>
            ) : (
              <div className="space-y-3">
                {adjustments.map((item) => {
                  const employee = item.employeeId || {};
                  const isDeduction = item.type === "DEDUCTION";
                  return (
                    <div key={item._id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isDeduction ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                              {ADJUSTMENT_TYPE_LABELS[item.type] || item.type}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            {employee.fullName ? `${employee.fullName} (${formatEmployeeCode(employee.employeeCode)})` : "--"} - {ADJUSTMENT_CODE_LABELS[item.code] || item.code}
                          </p>
                          {item.note ? <p className="mt-2 text-sm text-gray-500">{item.note}</p> : null}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={`font-mono text-sm font-bold ${isDeduction ? "text-red-600" : "text-green-600"}`}>
                            {isDeduction ? "-" : "+"}{formatMoney(item.amount)}
                          </p>
                          <div className="mt-2 flex flex-col justify-end gap-1 sm:flex-row">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center justify-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                              title="Sửa"
                            >
                              <Pencil size={15} />
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancel(item)}
                              className="inline-flex items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                              title="Hủy"
                            >
                              <Trash2 size={15} />
                              Hủy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollAdjustmentModal;

