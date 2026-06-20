import { useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
} from "lucide-react";

import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import { matchesSearchText } from "../../../utils/searchText";

const MODULE_LABELS = {
  ADMIN: "Quản trị",
  ANNOUNCEMENT: "Thông báo",
  ATTENDANCE: "Chấm công",
  AUTH: "Xác thực",
  DEPARTMENT: "Phòng ban",
  EMPLOYEE: "Nhân viên",
  HOLIDAY: "Ngày lễ",
  LEAVE: "Nghỉ phép",
  OT: "Làm thêm giờ",
  OVERTIME: "Làm thêm giờ",
  PAYROLL: "Bảng lương",
  PERMISSION: "Quyền hạn",
  REQUEST: "Yêu cầu",
  ROLE: "Vai trò",
  SYSTEM: "Hệ thống",
  USER: "Người dùng",
};

const ACTION_LABELS = {
  APPROVE_ATTENDANCE: "Duyệt chấm công",
  APPROVE_LEAVE: "Duyệt đơn nghỉ",
  APPROVE_OT: "Duyệt đơn OT",
  CREATE_ATTENDANCE: "Tạo chấm công",
  CREATE_DEPARTMENT: "Tạo phòng ban",
  CREATE_EMPLOYEE: "Tạo nhân viên",
  CREATE_HOLIDAYS: "Tạo lịch nghỉ",
  CREATE_LEAVE: "Tạo đơn nghỉ",
  CREATE_OT: "Tạo đơn OT",
  CREATE_PAYROLL: "Tạo bảng lương",
  CREATE_PERMISSION: "Tạo quyền",
  CREATE_ROLE: "Tạo vai trò",
  CREATE_USER: "Tạo người dùng",
  DELETE_ATTENDANCE: "Xóa chấm công",
  DELETE_DEPARTMENT: "Xóa phòng ban",
  DELETE_EMPLOYEE: "Xóa nhân viên",
  DELETE_HOLIDAYS: "Xóa lịch nghỉ",
  DELETE_LEAVE: "Xóa đơn nghỉ",
  DELETE_OT: "Xóa đơn OT",
  DELETE_PAYROLL: "Xóa bảng lương",
  DELETE_PERMISSION: "Xóa quyền",
  DELETE_ROLE: "Xóa vai trò",
  DELETE_USER: "Xóa người dùng",
  LOGIN_FAILED: "Đăng nhập thất bại",
  LOGIN_SUCCESS: "Đăng nhập thành công",
  MANAGE_PERMISSIONS: "Quản lý quyền hạn",
  MANAGE_ROLES: "Quản lý vai trò",
  MANAGE_SYSTEM: "Quản lý hệ thống",
  READ_ATTENDANCE: "Xem chấm công",
  READ_EMPLOYEES: "Xem nhân viên",
  RESET_PASSWORD: "Đặt lại mật khẩu",
  RESTORE_EMPLOYEE: "Khôi phục nhân viên",
  RUN_PAYROLL: "Chạy bảng lương",
  UPDATE_ACCOUNT: "Cập nhật tài khoản",
  UPDATE_ATTENDANCE: "Cập nhật chấm công",
  UPDATE_DEPARTMENT: "Cập nhật phòng ban",
  UPDATE_EMPLOYEE: "Cập nhật nhân viên",
  UPDATE_EMPLOYEE_BY_HR: "Cập nhật nhân viên bởi HR",
  UPDATE_EMPLOYEE_STATUS: "Cập nhật trạng thái nhân viên",
  UPDATE_HOLIDAYS: "Cập nhật lịch nghỉ",
  UPDATE_LEAVE: "Cập nhật đơn nghỉ",
  UPDATE_OT: "Cập nhật đơn OT",
  UPDATE_PAYROLL: "Cập nhật bảng lương",
  UPDATE_PERMISSION: "Cập nhật quyền",
  UPDATE_PROFILE: "Cập nhật hồ sơ",
  UPDATE_ROLE: "Cập nhật vai trò",
  UPDATE_USER: "Cập nhật người dùng",
  WEB_CHECK_IN: "Check-in web",
  WEB_CHECK_OUT: "Check-out web",
  WRITE_ATTENDANCE: "Chỉnh sửa chấm công",
  WRITE_DEPARTMENTS: "Chỉnh sửa phòng ban",
  WRITE_EMPLOYEES: "Chỉnh sửa nhân viên",
};

const FIELD_LABELS = {
  action: "Hành động",
  address: "Địa chỉ",
  approvedEndTime: "Giờ kết thúc duyệt",
  approvedHours: "Số giờ duyệt",
  approvedStartTime: "Giờ bắt đầu duyệt",
  annualLeaveBalance: "Phép năm còn lại",
  checkIn: "Giờ vào",
  checkOut: "Giờ ra",
  checkInIp: "IP check-in",
  checkOutIp: "IP check-out",
  code: "Mã",
  createdAt: "Thời gian tạo",
  date: "Ngày",
  department: "Phòng ban",
  description: "Mô tả",
  email: "Email",
  employeeCode: "Mã nhân viên",
  employeeName: "Nhân viên",
  endDate: "Ngày kết thúc",
  fullName: "Họ tên",
  isActive: "Trạng thái hoạt động",
  lateMinutes: "Số phút đi muộn",
  leaveType: "Loại nghỉ",
  module: "Phân hệ",
  name: "Tên",
  note: "Ghi chú",
  phone: "Số điện thoại",
  position: "Chức vụ",
  reason: "Lý do",
  role: "Vai trò",
  salary: "Lương",
  source: "Nguồn",
  startDate: "Ngày bắt đầu",
  startTime: "Giờ bắt đầu",
  status: "Trạng thái",
  title: "Tiêu đề",
  totalWorkDays: "Ngày công",
  type: "Loại",
  updatedAt: "Thời gian cập nhật",
  username: "Tên đăng nhập",
  workDayValue: "Giá trị công",
};

const TECHNICAL_KEY_PATTERNS = [
  /^_/,
  /(^|\.)(__v|id)$/i,
  /(^|\.)(.*Id|.*Ids)$/i,
  /password/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /secret/i,
  /stack/i,
  /trace/i,
  /raw/i,
  /headers/i,
  /body/i,
  /payload/i,
];

const DIRECT_CHANGE_KEYS = ["changes", "changedFields", "diff", "updates", "update", "dataChanges"];
const BEFORE_KEYS = ["before", "old", "oldData", "oldValue", "previous", "from"];
const AFTER_KEYS = ["after", "new", "newData", "newValue", "current", "to"];

const asArray = (value) => (Array.isArray(value) ? value : []);
const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");
const isPlainObject = (value) => value && typeof value === "object" && !Array.isArray(value);
const isTechnicalKey = (key) => TECHNICAL_KEY_PATTERNS.some((pattern) => pattern.test(String(key)));

const compact = (value) =>
  Object.entries(value).reduce((acc, [key, item]) => {
    if (item !== undefined && item !== null && item !== "") acc[key] = item;
    return acc;
  }, {});

const formatDateTime = (value) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const humanizeKey = (key = "") => {
  const lastKey = String(key).split(".").at(-1);
  if (FIELD_LABELS[lastKey]) return FIELD_LABELS[lastKey];

  return String(lastKey)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const labelModule = (value) => {
  const key = String(value || "").toUpperCase();
  return MODULE_LABELS[key] || value || "Không xác định";
};

const labelAction = (value) => {
  const key = String(value || "").toUpperCase();
  return ACTION_LABELS[key] || humanizeKey(value || "Hành động hệ thống");
};

const pickName = (value) => {
  if (!value) return "";
  if (typeof value !== "object") return String(value);

  return firstDefined(
    value.displayName,
    value.fullName,
    value.employeeName,
    value.name,
    value.title,
    value.username,
    value.email,
    value.employeeCode,
    value.code,
    value.officeName,
    value.roleName,
    value.permissionName,
  );
};

const formatValue = (value) => {
  if (value === undefined || value === null || value === "") return "Không có";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "number") return Number.isInteger(value) ? value : value.toFixed(2);
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value) || /^\d{4}-\d{2}-\d{2}$/.test(value)) return formatDateTime(value);
    if (/^[a-f\d]{24}$/i.test(value)) return "Bản ghi liên quan";
    return value;
  }
  if (Array.isArray(value)) {
    const readable = value.map(pickName).filter(Boolean);
    return readable.length ? readable.join(", ") : `${value.length} mục`;
  }
  if (isPlainObject(value)) {
    const name = pickName(value);
    if (name) return name;

    const visiblePairs = Object.entries(value)
      .filter(([key]) => !isTechnicalKey(key))
      .slice(0, 4)
      .map(([key, nestedValue]) => `${humanizeKey(key)}: ${formatValue(nestedValue)}`);

    return visiblePairs.length ? visiblePairs.join("; ") : "Thông tin liên quan";
  }

  return String(value);
};

const getActionName = (log) =>
  firstDefined(log?.display?.actionName, log?.action?.actionName, log?.actionName, log?.action?.permissionId?.name, log?.event, log?.type, log?.activity);

const getActorName = (log) =>
  firstDefined(
    log?.display?.actorName,
    log?.actor?.displayName,
    log?.actor?.fullName,
    log?.actor?.name,
    log?.actor?.username,
    log?.userId?.fullName,
    log?.userId?.username,
    log?.user?.fullName,
    log?.user?.username,
    log?.createdBy?.fullName,
    log?.createdBy?.username,
  ) || "Hệ thống";

const getTargetName = (log) =>
  firstDefined(
    log?.display?.targetName,
    log?.target?.name,
    log?.target?.title,
    log?.target?.fullName,
    log?.target?.employeeCode,
    log?.entity?.name,
    log?.entity?.title,
    log?.entityName,
    log?.resourceName,
    log?.subjectName,
    log?.metadata?.targetName,
    log?.metadata?.employeeName,
    log?.metadata?.fullName,
    log?.metadata?.title,
  ) || "Không có đối tượng cụ thể";

const getIpAddress = (log) => firstDefined(log?.display?.ipAddress, log?.ipAddress, log?.ip, log?.clientIp, log?.request?.ip, log?.metadata?.ip, log?.metadata?.ipAddress);
const getUserAgent = (log) => firstDefined(log?.display?.userAgent, log?.userAgent, log?.device, log?.browser, log?.request?.userAgent, log?.metadata?.userAgent, log?.metadata?.device);

const getSourceLayer = (log) => {
  const source = String(firstDefined(log?.source, log?.layer, log?.origin, log?.client, log?.metadata?.source) || "").toLowerCase();
  if (source.includes("front") || source.includes("client") || source.includes("browser")) return "Frontend";
  if (source.includes("back") || source.includes("server") || source.includes("api")) return "Backend";
  return log?.request?.path || log?.endpoint || log?.method ? "Backend" : "Hệ thống";
};

function extractChanges(log = {}) {
  for (const key of DIRECT_CHANGE_KEYS) {
    const changes = normalizeDirectChanges(log?.[key] || log?.metadata?.[key]);
    if (changes.length) return changes;
  }

  for (const beforeKey of BEFORE_KEYS) {
    for (const afterKey of AFTER_KEYS) {
      const changes = buildPairChanges(log?.[beforeKey], log?.[afterKey]);
      if (changes.length) return changes;

      const metadataChanges = buildPairChanges(log?.metadata?.[beforeKey], log?.metadata?.[afterKey]);
      if (metadataChanges.length) return metadataChanges;
    }
  }

  return [];
}

const normalizeLog = (log) => {
  const status = String(firstDefined(log?.status, log?.result, "SUCCESS")).toUpperCase();
  const createdAt = firstDefined(log?.createdAt, log?.timestamp, log?.time, log?.date);
  const module = firstDefined(log?.display?.module, log?.module, log?.action?.module, log?.action?.permissionId?.module, log?.entityType, log?.resourceType);
  const action = getActionName(log);
  const changes = extractChanges(log);

  return {
    raw: log,
    action,
    actionLabel: labelAction(action),
    actorName: getActorName(log),
    changesCount: changes.length,
    createdAt,
    id: firstDefined(log?._id, log?.id),
    ipAddress: getIpAddress(log),
    module,
    moduleLabel: labelModule(module),
    requestMethod: firstDefined(log?.request?.method, log?.method),
    requestPath: firstDefined(log?.request?.path, log?.endpoint, log?.url),
    sourceLayer: getSourceLayer(log),
    status,
    targetName: getTargetName(log),
    targetType: firstDefined(log?.display?.targetType, log?.target?.type, log?.targetType),
    userAgent: getUserAgent(log),
  };
};

const flattenObject = (value, prefix = "") => {
  if (!isPlainObject(value)) return [];

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isTechnicalKey(path)) return [];
    if (isPlainObject(nestedValue) && !pickName(nestedValue)) return flattenObject(nestedValue, path);
    return [[path, nestedValue]];
  });
};

const buildPairChanges = (before, after) => {
  if (!isPlainObject(before) && !isPlainObject(after)) return [];

  const beforeMap = new Map(flattenObject(before));
  const afterMap = new Map(flattenObject(after));
  const keys = new Set([...beforeMap.keys(), ...afterMap.keys()]);

  return Array.from(keys)
    .filter((key) => formatValue(beforeMap.get(key)) !== formatValue(afterMap.get(key)))
    .map((key) => ({ field: key, before: beforeMap.get(key), after: afterMap.get(key) }));
};

const normalizeDirectChanges = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!isPlainObject(item)) return null;
        const field = firstDefined(item.field, item.key, item.name, item.path);
        if (!field || isTechnicalKey(field)) return null;
        return { field, before: firstDefined(item.before, item.oldValue, item.from), after: firstDefined(item.after, item.newValue, item.to, item.value) };
      })
      .filter(Boolean);
  }

  if (isPlainObject(value)) {
    return Object.entries(value)
      .filter(([key]) => !isTechnicalKey(key))
      .map(([key, item]) => {
        if (isPlainObject(item)) return { field: key, before: firstDefined(item.before, item.oldValue, item.from), after: firstDefined(item.after, item.newValue, item.to, item.value) };
        return { field: key, before: undefined, after: item };
      });
  }

  return [];
};

const getDescription = (log) => firstDefined(log?.display?.description, log?.description, log?.message, log?.note, log?.metadata?.description, log?.metadata?.message);

const StatusBadge = ({ status }) => {
  const failed = ["FAILED", "FAILURE"].includes(status);
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-semibold ${failed ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {failed ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
      {failed ? "Thất bại" : "Thành công"}
    </span>
  );
};

const InlineStat = ({ label, value }) => (
  <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-950">{value}</span>
  </span>
);

const KeyValue = ({ label, value }) => (
  <div className="grid grid-cols-[112px_1fr] gap-3 border-b border-gray-100 py-2 last:border-b-0">
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="min-w-0 break-words text-sm font-medium text-gray-900">{value || "--"}</dd>
  </div>
);

const DetailSection = ({ title, children }) => (
  <section className="rounded border border-gray-200 bg-white">
    <div className="border-b border-gray-100 px-3 py-2">
      <h4 className="text-sm font-bold text-gray-900">{title}</h4>
    </div>
    <div className="p-3">{children}</div>
  </section>
);

const DetailPanel = ({ log, normalized }) => {
  const changes = useMemo(() => extractChanges(log || {}), [log]);
  const description = getDescription(log || {});
  const context = compact({
    "Nguồn": normalized?.sourceLayer,
    "IP": normalized?.ipAddress,
    "Thiết bị": normalized?.userAgent,
    "Method": normalized?.requestMethod,
    "Đường dẫn": normalized?.requestPath,
  });

  if (!log || !normalized) {
    return (
      <Card className="flex min-h-[420px] items-center justify-center border border-dashed border-gray-300 bg-gray-50 p-8 text-center shadow-none">
        <div>
          <Activity size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-800">Chọn log để xem chi tiết</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <DetailSection title="Tóm tắt">
        <dl>
          <KeyValue label="Hành động" value={normalized.actionLabel} />
          <KeyValue label="Kết quả" value={<StatusBadge status={normalized.status} />} />
          <KeyValue label="Người thực hiện" value={normalized.actorName} />
          <KeyValue label="Đối tượng" value={normalized.targetName} />
          <KeyValue label="Loại" value={normalized.targetType || normalized.moduleLabel} />
          <KeyValue label="Phân hệ" value={normalized.moduleLabel} />
          <KeyValue label="Thời gian" value={formatDateTime(normalized.createdAt)} />
        </dl>
      </DetailSection>

      {description ? (
        <DetailSection title="Mô tả">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-800">{description}</p>
        </DetailSection>
      ) : null}

      <DetailSection title={`Thay đổi (${changes.length})`}>
        {changes.length ? (
          <div className="max-h-[360px] overflow-auto rounded border border-gray-200">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="border-b border-gray-200 px-3 py-2 text-left">Field</th>
                  <th className="border-b border-gray-200 px-3 py-2 text-left">Trước</th>
                  <th className="border-b border-gray-200 px-3 py-2 text-left">Sau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {changes.map((change, index) => (
                  <tr key={`${change.field}-${index}`}>
                    <td className="px-3 py-2 font-semibold text-gray-900">{humanizeKey(change.field)}</td>
                    <td className="px-3 py-2 text-gray-600">{formatValue(change.before)}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{formatValue(change.after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Không có diff.</p>
        )}
      </DetailSection>

      <DetailSection title="Request">
        <dl>
          {Object.entries(context).map(([key, value]) => <KeyValue key={key} label={key} value={formatValue(value)} />)}
        </dl>
      </DetailSection>
    </div>
  );
};

const AuditLogsPanel = ({ auditLogId, auditLoading, auditLogs, onRefresh, onSelectLog, renderAdminTabs, selectedAuditLog }) => {
  const [filters, setFilters] = useState({ module: "", search: "", status: "" });
  const normalizedLogs = useMemo(() => asArray(auditLogs).map(normalizeLog), [auditLogs]);

  const visibleLogs = useMemo(() => {
    return normalizedLogs.filter((log) => {
      const matchesSearch = matchesSearchText(
        [log.actionLabel, log.actorName, log.moduleLabel, log.targetName, log.sourceLayer, log.ipAddress, log.requestPath, formatDateTime(log.createdAt)],
        filters.search,
      );
      const matchesStatus = !filters.status || log.status === filters.status;
      const matchesModule = !filters.module || String(log.module || "").toUpperCase() === filters.module;
      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [filters, normalizedLogs]);

  const selectedNormalized = useMemo(() => normalizeLog(selectedAuditLog || normalizedLogs.find((log) => log.id === auditLogId)?.raw || {}), [auditLogId, normalizedLogs, selectedAuditLog]);
  const modules = useMemo(() => Array.from(new Set(normalizedLogs.map((log) => String(log.module || "").toUpperCase()).filter(Boolean))), [normalizedLogs]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      changed: normalizedLogs.filter((log) => log.changesCount > 0).length,
      failed: normalizedLogs.filter((log) => ["FAILED", "FAILURE"].includes(log.status)).length,
      success: normalizedLogs.filter((log) => ["SUCCESS", "OK"].includes(log.status)).length,
      today: normalizedLogs.filter((log) => log.createdAt && new Date(log.createdAt).toDateString() === today).length,
      total: normalizedLogs.length,
    };
  }, [normalizedLogs]);

  return (
    <div className="space-y-4">
      {renderAdminTabs()}
      <Card className="overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="mr-2 text-lg font-bold text-gray-950">Audit logs</h2>
              <InlineStat label="Tổng" value={stats.total} />
              <InlineStat label="Hôm nay" value={stats.today} />
              <InlineStat label="Đổi" value={stats.changed} />
              <InlineStat label="Lỗi" value={stats.failed} />
            </div>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <label className="relative lg:w-[360px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Tìm người, hành động, đối tượng, IP..." className="h-10 w-full rounded border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100" />
              </label>
              <select value={filters.module} onChange={(event) => setFilters((prev) => ({ ...prev, module: event.target.value }))} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100">
                <option value="">Phân hệ</option>
                {modules.map((module) => <option key={module} value={module}>{labelModule(module)}</option>)}
              </select>
              <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100">
                <option value="">Kết quả</option>
                <option value="SUCCESS">Thành công</option>
                <option value="FAILED">Thất bại</option>
              </select>
              <Button type="button" variant="secondary" onClick={onRefresh} disabled={auditLoading}>{auditLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}Tải lại</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.85fr)]">
          <Card className="overflow-hidden border border-gray-200 p-0 shadow-none">
            <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
              <h3 className="text-sm font-bold text-gray-900">Danh sách ({visibleLogs.length}/{normalizedLogs.length})</h3>
              {auditLoading ? <span className="inline-flex items-center text-xs font-medium text-gray-500"><Loader2 size={14} className="mr-1 animate-spin" /> Đang tải</span> : null}
            </div>
            <div className="max-h-[calc(100vh-260px)] min-h-[420px] overflow-auto">
              {auditLoading && normalizedLogs.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-gray-500"><Loader2 size={24} className="mr-2 animate-spin" /> Đang tải audit logs...</div>
              ) : visibleLogs.length === 0 ? (
                <div className="p-10 text-center text-gray-500"><Activity size={32} className="mx-auto mb-3 text-gray-300" />Không có log.</div>
              ) : (
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Thời gian</th>
                      <th className="px-3 py-2">Hoạt động</th>
                      <th className="px-3 py-2">Người thực hiện</th>
                      <th className="px-3 py-2">Đối tượng</th>
                      <th className="px-3 py-2">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {visibleLogs.map((log, index) => {
                      const isSelected = log.id && log.id === auditLogId;
                      return (
                        <tr
                          key={log.id || index}
                          onClick={() => onSelectLog(log.raw)}
                          className={`cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-gray-100" : ""}`}
                        >
                          <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-gray-600">
                            <div className="inline-flex items-center gap-1">
                              <Clock size={12} /> {formatDateTime(log.createdAt)}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold text-gray-950">{log.actionLabel}</p>
                            <p className="mt-0.5 text-[11px] text-gray-500">{log.moduleLabel}</p>
                          </td>
                          <td className="px-3 py-3 font-medium text-gray-800">{log.actorName}</td>
                          <td className="px-3 py-3">
                            <p className="font-medium text-gray-800">{log.targetName}</p>
                            <p className="mt-0.5 text-[11px] text-gray-500">{log.targetType || "--"}</p>
                          </td>
                          <td className="px-3 py-3"><StatusBadge status={log.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
          <div className="xl:sticky xl:top-4 xl:self-start">
            <DetailPanel log={selectedAuditLog} normalized={selectedAuditLog ? selectedNormalized : null} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AuditLogsPanel;
