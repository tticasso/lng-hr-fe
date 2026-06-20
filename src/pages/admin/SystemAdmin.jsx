import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  X,
  Search,
  Lock,
  Loader2,
  AlertCircle,
  Key, // Icon mới cho Permission
  ChevronDown,
  ChevronRight,
  Wifi,
  Settings2,
  RefreshCw,
} from "lucide-react";
import { roleApi } from "../../apis/roleApi";
import { permissionApi } from "../../apis/permissionApi";
import { auditLogApi } from "../../apis/auditLogApi";
import { systemSettingApi } from "../../apis/systemSettingApi";
import { officeNetworkApi } from "../../apis/officeNetworkApi";
import { useAuth } from "../../context/AuthContext";
import { hasAnyPermission, hasPermission as userHasPermission } from "../../utils/authPermissions";
import { COMPATIBILITY_PERMISSION_ALIASES } from "../../config/accessControl";
import { toast } from "react-toastify";
import Card from "../../components/common/Card";
import { matchesSearchText } from "../../utils/searchText";
import Button from "../../components/common/Button"; // Đảm bảo component này tồn tại
import AuditLogsPanel from "./audit/AuditLogsPanel";

const APPROVER_TYPES = [
  { value: "TEAM_LEADER", label: "Trưởng team" },
  { value: "DEPARTMENT_MANAGER", label: "Trưởng phòng" },
  { value: "REPORTING_MANAGER", label: "Quản lý trực tiếp" },
];

const DEFAULT_APPROVAL_POLICIES = {
  "approval.leave": {
    requestType: "LEAVE",
    levels: [
      { type: "TEAM_LEADER", label: "Trưởng team", enabled: true },
      { type: "DEPARTMENT_MANAGER", label: "Trưởng phòng", enabled: true },
    ],
  },
  "approval.overtime": {
    requestType: "OVERTIME",
    levels: [
      { type: "TEAM_LEADER", label: "Trưởng team", enabled: true },
      { type: "DEPARTMENT_MANAGER", label: "Trưởng phòng", enabled: true },
    ],
  },
};

const COMPATIBILITY_PERMISSION_ALIAS_SET = new Set(COMPATIBILITY_PERMISSION_ALIASES);

const SETTING_CATEGORY_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: "ATTENDANCE", label: "Chấm công" },
  { value: "APPROVAL", label: "Duyệt đơn" },
  { value: "LEAVE", label: "Nghỉ phép" },
  { value: "PAYROLL", label: "Lương & OT" },
  { value: "GENERAL", label: "Chung" },
];

const DEFAULT_OPERATION_SETTINGS = {
  "leave.balancePolicy": {
    category: "LEAVE",
    description: "Chính sách quỹ phép năm và số ngày phép được chuyển sang năm sau.",
    value: {
      annualEntitlementDays: 12,
      maxCarryOverDays: 5,
    },
  },
  "leave.requestPolicy": {
    category: "LEAVE",
    description: "Chính sách tạo và cập nhật đơn nghỉ phép.",
    value: {
      maxAttachments: 5,
    },
  },
  "attendance.blockPolicy": {
    category: "ATTENDANCE",
    description: "Chinh sach block cham cong va quy doi workDayValue.",
    value: {
      blockMinutes: 15,
      defaultTotalBlocks: 32,
    },
  },
  "payroll.insurancePolicy": {
    category: "PAYROLL",
    description: "Chinh sach khau tru bao hiem va thue TNCN khi tinh luong.",
    value: {
      enabled: false,
      pitEnabled: false,
      salaryCapBase: 2340000,
      salaryCapMultiplier: 20,
      personalDeduction: 11000000,
      dependantDeduction: 4400000,
      rates: {
        bhxh: 0.08,
        bhyt: 0.015,
        bhtn: 0.01,
      },
    },
  },
  "overtime.payPolicy": {
    category: "PAYROLL",
    description: "Chính sách tính tiền tăng ca.",
    value: {
      workHoursPerDay: 8,
      multipliers: {
        weekday: 1.5,
        weekend: 2,
        holiday: 3,
        weekday_night: 1.8,
        weekend_night: 2.4,
        holiday_night: 3.9,
      },
    },
  },
  "payroll.processingPolicy": {
    category: "PAYROLL",
    description: "Chính sách xử lý bảng lương theo lô.",
    value: {
      employeeBatchSize: 100,
      attendanceBulkBatchSize: 500,
    },
  },
};

const OT_MULTIPLIER_LABELS = [
  { key: "weekday", label: "Ngày thường" },
  { key: "weekend", label: "Cuối tuần" },
  { key: "holiday", label: "Ngày lễ" },
  { key: "weekday_night", label: "Ngày thường - giờ đêm" },
  { key: "weekend_night", label: "Cuối tuần - giờ đêm" },
  { key: "holiday_night", label: "Ngày lễ - giờ đêm" },
];

const SystemAdmin = () => {
  const { user } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState("roles");
  const canWriteRoles = useMemo(() => userHasPermission(user, "WRITE_ROLES"), [user]);
  const canWritePermissions = useMemo(() => userHasPermission(user, "WRITE_PERMISSIONS"), [user]);
  const canReadRolesOrPermissions =
    hasAnyPermission(user, ["READ_ROLES", "READ_PERMISSIONS"]) ||
    canWriteRoles ||
    canWritePermissions;
  const canManageSystem = userHasPermission(user, "MANAGE_SYSTEM");
  // --- MAPPING TIẾNG VIỆT ---
  const moduleNameMap = {
    "ADMIN": "Quản trị",
    "ATTENDANCE": "Chấm công",
    "AUTH": "Xác thực",
    "DEPARTMENT": "Phòng ban",
    "EMPLOYEE": "Nhân viên",
    "PAYROLL": "Bảng lương",
    "REQUEST": "Yêu cầu",
    "SYSTEM": "Hệ thống",
    "LEAVE": "Nghỉ phép",
    "OT": "Làm thêm giờ",
    "USER": "Người dùng",
    "ANNOUNCEMENT": "Thông báo",
    "HOLIDAY":"Ngày lễ"
  };

  const getVietnameseModule = (moduleName) => {
    return moduleNameMap[moduleName] || moduleName;
  };

  const permissionNameMap = {
    // AUTH Module
    "LOGIN_SUCCESS": "Đăng nhập thành công",
    "LOGIN_FAILED": "Đăng nhập thất bại",

    // ADMIN Module
    "UPDATE_ACCOUNT": "Cập nhật tài khoản",
    "UPDATE_EMPLOYEE": "Cập nhật nhân viên",
    "UPDATE_EMPLOYEE_BY_HR": "Cập nhật nhân viên (HR)",

    // EMPLOYEE Module
    "READ_MY_PROFILE": "Xem hồ sơ của tôi",
    "UPDATE_MY_PROFILE": "Cập nhật hồ sơ của tôi",
    "UPDATE_PROFILE": "Cập nhật hồ sơ",
    "READ_EMPLOYEES": "Xem danh sách nhân viên",
    "WRITE_EMPLOYEES": "Chỉnh sửa nhân viên",
    "CREATE_EMPLOYEE": "Tạo nhân viên",
    "DELETE_EMPLOYEE": "Xóa nhân viên",

    // DEPARTMENT Module
    "READ_DEPARTMENTS": "Xem phòng ban",
    "WRITE_DEPARTMENTS": "Chỉnh sửa phòng ban",
    "CREATE_DEPARTMENT": "Tạo phòng ban",
    "UPDATE_DEPARTMENT": "Cập nhật phòng ban",
    "DELETE_DEPARTMENT": "Xóa phòng ban",

    // ATTENDANCE Module
    "READ_MY_ATTENDANCE": "Xem chấm công của tôi",
    "READ_ATTENDANCE": "Xem chấm công",
    "WRITE_ATTENDANCE": "Chỉnh sửa chấm công",
    "CREATE_ATTENDANCE": "Tạo chấm công",
    "UPDATE_ATTENDANCE": "Cập nhật chấm công",
    "DELETE_ATTENDANCE": "Xóa chấm công",
    "APPROVE_ATTENDANCE": "Duyệt chấm công",

    // REQUEST Module
    "CREATE_REQUEST": "Tạo yêu cầu",
    "READ_MY_REQUEST": "Xem yêu cầu của tôi",
    "READ_REQUESTS": "Xem danh sách yêu cầu",
    "APPROVE_REQUEST": "Duyệt yêu cầu",
    "DELETE_REQUEST": "Xóa yêu cầu",
    "UPDATE_REQUEST": "Cập nhật yêu cầu",

    // PAYROLL Module
    "WRITE_PAYROLLS": "Quản lý bảng lương",
    "READ_PAYROLLS": "Xem bảng lương",
    "READ_ALL_PAYROLLS": "Xem tất cả bảng lương",
    "READ_MY_PAYSLIP": "Xem phiếu lương của tôi",
    "CREATE_PAYROLL": "Tạo bảng lương",
    "UPDATE_PAYROLL": "Cập nhật bảng lương",
    "DELETE_PAYROLL": "Xóa bảng lương",

    // SYSTEM Module
    "MANAGE_SYSTEM": "Quản lý hệ thống",
    "MANAGE_ROLES": "Quản lý vai trò",
    "MANAGE_PERMISSIONS": "Quản lý quyền hạn",

    // LEAVE Module
    "CREATE_LEAVE": "Tạo đơn nghỉ",
    "READ_LEAVES": "Xem đơn nghỉ trong phạm vi",
    "READ_ALL_LEAVES": "Xem tất cả đơn nghỉ",
    "WRITE_LEAVE": "Tạo và cập nhật đơn nghỉ cá nhân",
    "DELETE_LEAVE": "Xóa đơn nghỉ",
    "APPROVE_ALL_LEAVES": "Duyệt tất cả đơn nghỉ",
    "APPROVE_LEAVE_OVERRIDE": "Duyệt vượt cấp đơn nghỉ",

    // OT Module
    "CREATE_OT": "Tạo đơn OT",
    "READ_OT": "Xem đơn OT",
    "READ_ALL_OTS": "Xem tất cả đơn OT",
    "UPDATE_OT": "Cập nhật đơn OT",
    "DELETE_OT": "Xóa đơn OT",

    // USER Module
    "READ_ACCOUNTS": "Xem tài khoản",
    "WRITE_ACCOUNTS": "Quản lý tài khoản",
    //ANNOUNCEMENT 
    "READ_ANNOUNCEMENTS":"Đọc thông báo",
    "WRITE_ANNOUNCEMENTS":"Viết thông báo",
    //HOLIDAY
    "CREATE_HOLIDAYS":"Tạo lịch nghỉ",
    "DELETE_HOLIDAYS":"Xóa lịch nghỉ",
    "READ_HOLIDAYS":"Xem lịch nghỉ",
    "UPDATE_HOLIDAYS":"Cập nhật lịch nghỉ"
  };

  const getVietnameseName = (permName) => {
    return permissionNameMap[permName] || permName;
  };

  const getPermissionDisplayName = (permission) => {
    if (typeof permission === "string") return getVietnameseName(permission);
    return permission?.displayName?.trim() || getVietnameseName(permission?.name || "");
  };

  const extractAuditLogList = (payload) => {
    const candidates = [
      payload?.data,
      payload?.data?.data,
      payload?.logs,
      payload?.items,
      payload?.results,
      payload,
    ];

    return candidates.find(Array.isArray) || [];
  };

  // --- STATE ---
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRole, setSelectedRole] = useState(null);

  // State cho Role
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  // State cho Permission (Mới)
  const [isCreatingPerm, setIsCreatingPerm] = useState(false);
  const [newPermData, setNewPermData] = useState({
    name: "",
    displayName: "",
    module: "",
    description: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModules, setExpandedModules] = useState({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const [settingCategory, setSettingCategory] = useState("");
  const [settingKey, setSettingKey] = useState("");
  const [settingPayload, setSettingPayload] = useState("{\n  \n}");
  const [approvalPolicies, setApprovalPolicies] = useState(DEFAULT_APPROVAL_POLICIES);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [operationSettings, setOperationSettings] = useState(
    Object.fromEntries(
      Object.entries(DEFAULT_OPERATION_SETTINGS).map(([key, setting]) => [key, setting.value])
    )
  );
  const [operationSavingKey, setOperationSavingKey] = useState("");
  const [officeNetworksLoading, setOfficeNetworksLoading] = useState(false);
  const [officeNetworks, setOfficeNetworks] = useState([]);
  const [officeNetworkForm, setOfficeNetworkForm] = useState({
    officeName: "",
    ipAddress: "",
    isActive: true,
    editingId: null,
  });
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogId, setAuditLogId] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // --- INIT DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeAdminTab === "settings") {
      fetchApprovalPolicies();
      fetchSystemSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdminTab]);

  useEffect(() => {
    const systemTabs = ["settings", "officeNetworks", "audit"];
    if (activeAdminTab === "roles" && !canReadRolesOrPermissions && canManageSystem) {
      setActiveAdminTab("settings");
      return;
    }
    if (systemTabs.includes(activeAdminTab) && !canManageSystem && canReadRolesOrPermissions) {
      setActiveAdminTab("roles");
    }
  }, [activeAdminTab, canManageSystem, canReadRolesOrPermissions]);

  const fetchData = async () => {
    if (!canReadRolesOrPermissions) {
      setRoles([]);
      setPermissions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        roleApi.getAllCached(),
        permissionApi.getAllCached(),
      ]);

      // Xử lý dữ liệu trả về an toàn
      const rolesData = rolesRes.data?.data || rolesRes.data || [];
      const rawPermsData = permsRes.data?.data || permsRes.data || [];
      const permsData = rawPermsData.filter(
        (permission) => !COMPATIBILITY_PERMISSION_ALIAS_SET.has(permission?.name),
      );

      setRoles(rolesData);
      setPermissions(permsData);

      if (rolesData.length > 0 && !selectedRole) {
        setSelectedRole(rolesData[0]);
      }

      // Expand all modules by default
      const initialExpanded = {};
      permsData.forEach((perm) => {
        const moduleName = perm.module ? perm.module.toUpperCase() : "OTHER";
        initialExpanded[moduleName] = true;
      });
      setExpandedModules(initialExpanded);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu hệ thống");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC NHÓM PERMISSION ---
  const groupedPermissions = useMemo(() => {
    const groups = {};
    if (!Array.isArray(permissions)) return groups;

    permissions.forEach((perm) => {
      const moduleName = perm.module ? perm.module.toUpperCase() : "OTHER";
      if (!groups[moduleName]) {
        groups[moduleName] = [];
      }

      if (
        matchesSearchText([perm.name, perm.displayName, perm.description], searchTerm)
      ) {
        groups[moduleName].push(perm);
      }
    });

    Object.keys(groups).forEach((key) => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [permissions, searchTerm]);

  // --- HANDLERS: ROLE ---
  const handleCreateRole = async () => {
    if (!canWriteRoles) {
      toast.error("Bạn không có quyền WRITE_ROLES để thay đổi vai trò");
      return;
    }
    if (!newRoleName.trim()) return;
    try {
      const res = await roleApi.create({ name: newRoleName });
      toast.success("Create Role Success");

      // Xử lý response linh hoạt
      const newRole = res.data?.data || res.data;

      // Đảm bảo permissions là mảng rỗng để tránh lỗi render
      const safeRole = { ...newRole, permissions: newRole.permissions || [] };

      setRoles([...roles, safeRole]);
      setNewRoleName("");
      setIsCreatingRole(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo thất bại");
    }
  };

  const handleDeleteRole = async (id) => {
    if (!canWriteRoles) {
      toast.error("Bạn không có quyền WRITE_ROLES để thay đổi vai trò");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa vai trò này?")) return;
    try {
      await roleApi.delete(id);
      toast.success("Delete Role Success");
      const newRoles = roles.filter((r) => r._id !== id);
      setRoles(newRoles);
      if (selectedRole?._id === id) {
        setSelectedRole(newRoles.length > 0 ? newRoles[0] : null);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Lỗi khi xóa vai trò";
      toast.error(msg);
    }
  };

  // --- HANDLERS: PERMISSION (MỚI) ---
  const handleCreatePermission = async () => {
    if (!canWritePermissions) {
      toast.error("Bạn không có quyền WRITE_PERMISSIONS để tạo quyền mới");
      return;
    }
    // Validate cơ bản
    if (!newPermData.name || !newPermData.displayName || !newPermData.module) {
      toast.warning("Vui lòng nhập mã quyền, tên hiển thị và module");
      return;
    }
    if (COMPATIBILITY_PERMISSION_ALIAS_SET.has(newPermData.name.trim().toUpperCase())) {
      toast.warning("Quyền này là alias tương thích. Vui lòng dùng quyền canonical từ BE catalog.");
      return;
    }

    try {
      const res = await permissionApi.create(newPermData);
      toast.success("Tạo quyền hạn mới thành công");

      const newPerm = res.data?.data || res.data;
      if (!COMPATIBILITY_PERMISSION_ALIAS_SET.has(newPerm?.name)) {
        setPermissions([...permissions, newPerm]); // Cập nhật list ngay lập tức
      }

      // Reset form
      setNewPermData({ name: "", displayName: "", module: "", description: "" });
      setIsCreatingPerm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo quyền thất bại");
    }
  };

  // --- HANDLERS: ASSIGNMENT ---
  const hasPermission = (permId) => {
    if (!selectedRole || !selectedRole.permissions) return false;
    return selectedRole.permissions.some((p) => p._id === permId);
  };

  const togglePermission = async (permId, isAssigned) => {
    if (!selectedRole) return;
    if (!canWriteRoles) {
      toast.error("Bạn không có quyền WRITE_ROLES để phân quyền vai trò");
      return;
    }

    const originalRole = { ...selectedRole };
    let updatedPermissions;

    if (isAssigned) {
      updatedPermissions = selectedRole.permissions.filter(
        (p) => p._id !== permId,
      );
    } else {
      const permToAdd = permissions.find((p) => p._id === permId);
      updatedPermissions = [...(selectedRole.permissions || []), permToAdd];
    }

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    setSelectedRole(updatedRole);
    setRoles(roles.map((r) => (r._id === updatedRole._id ? updatedRole : r)));

    try {
      if (isAssigned) {
        await roleApi.removePermissions(selectedRole._id, [permId]);
      } else {
        await roleApi.addPermissions(selectedRole._id, [permId]);
      }
       
    } catch (error) {
      setSelectedRole(originalRole);
      setRoles(
        roles.map((r) => (r._id === originalRole._id ? originalRole : r)),
      );
      toast.error("Cập nhật quyền thất bại");
    }
  };

  const toggleModule = (moduleName) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };

  const parseJsonPayload = (payload) => {
    try {
      return payload.trim() ? JSON.parse(payload) : {};
    } catch {
      toast.error("JSON không hợp lệ");
      return null;
    }
  };

  const renderAdminTabs = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { id: "roles", label: "Vai trò & quyền" },
        { id: "settings", label: "Cấu hình hệ thống" },
        { id: "officeNetworks", label: "Mạng văn phòng" },
        { id: "audit", label: "Audit logs" },
      ].filter((tab) => (tab.id === "roles" ? canReadRolesOrPermissions : canManageSystem)).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveAdminTab(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            activeAdminTab === tab.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  const mergeOperationSettings = (rows = []) => {
    const rowMap = new Map(rows.map((item) => [item.key, item.value]));
    const next = {};

    Object.entries(DEFAULT_OPERATION_SETTINGS).forEach(([key, setting]) => {
      const savedValue = rowMap.get(key);
      next[key] = {
        ...setting.value,
        ...(savedValue || {}),
        multipliers: {
          ...(setting.value.multipliers || {}),
          ...(savedValue?.multipliers || {}),
        },
        rates: {
          ...(setting.value.rates || {}),
          ...(savedValue?.rates || {}),
        },
      };
    });

    return next;
  };

  const fetchSystemSettings = async (categoryOverride = settingCategory) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để xem cấu hình hệ thống");
      return;
    }

    const category = String(categoryOverride || "").trim();

    try {
      setSettingsLoading(true);
      const res = category
        ? await systemSettingApi.getByCategory(category)
        : await systemSettingApi.getAll();
      const data = res.data?.data || res.data || [];
      const rows = Array.isArray(data) ? data : Object.values(data || {});
      setSettings(rows);
      if (category) {
        const allRes = await systemSettingApi.getAll();
        const allData = allRes.data?.data || allRes.data || [];
        const allRows = Array.isArray(allData) ? allData : Object.values(allData || {});
        setOperationSettings(mergeOperationSettings(allRows));
      } else {
        setOperationSettings(mergeOperationSettings(rows));
      }
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải cấu hình hệ thống");
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSystemSetting = async () => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để cập nhật cấu hình hệ thống");
      return;
    }
    const payload = parseJsonPayload(settingPayload);
    if (!payload || !settingKey.trim()) {
      if (!settingKey.trim()) toast.warning("Vui lòng nhập setting key");
      return;
    }
    if (!window.confirm("Cập nhật cấu hình hệ thống này?")) return;

    try {
      setSettingsLoading(true);
      await systemSettingApi.updateByKey(settingKey.trim(), payload);
      toast.success("Cập nhật cấu hình thành công");
      await fetchSystemSettings();
    } catch (error) {
      toast.error(error.normalizedMessage || "Cập nhật cấu hình thất bại");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSettingCategoryChange = (category) => {
    setSettingCategory(category);
    fetchSystemSettings(category);
  };

  const updateOperationSettingValue = (key, field, value) => {
    setOperationSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const updateOtMultiplier = (field, value) => {
    setOperationSettings((prev) => ({
      ...prev,
      "overtime.payPolicy": {
        ...prev["overtime.payPolicy"],
        multipliers: {
          ...prev["overtime.payPolicy"].multipliers,
          [field]: value,
        },
      },
    }));
  };

  const updateInsuranceRate = (field, value) => {
    setOperationSettings((prev) => ({
      ...prev,
      "payroll.insurancePolicy": {
        ...prev["payroll.insurancePolicy"],
        rates: {
          ...prev["payroll.insurancePolicy"].rates,
          [field]: value,
        },
      },
    }));
  };

  const updateOperationSettingBoolean = (key, field, value) => {
    setOperationSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const toNumberOrNull = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getOperationSettingPayload = (key) => {
    const value = operationSettings[key] || DEFAULT_OPERATION_SETTINGS[key].value;

    if (key === "leave.balancePolicy") {
      const annualEntitlementDays = toNumberOrNull(value.annualEntitlementDays);
      const maxCarryOverDays = toNumberOrNull(value.maxCarryOverDays);
      if (!annualEntitlementDays || annualEntitlementDays <= 0 || maxCarryOverDays === null || maxCarryOverDays < 0) {
        toast.warning("Vui lòng nhập đúng số ngày phép năm và số ngày chuyển phép");
        return null;
      }
      return { annualEntitlementDays, maxCarryOverDays };
    }

    if (key === "leave.requestPolicy") {
      const maxAttachments = Math.floor(toNumberOrNull(value.maxAttachments));
      if (!maxAttachments || maxAttachments <= 0) {
        toast.warning("Số file đính kèm tối đa phải lớn hơn 0");
        return null;
      }
      return { maxAttachments };
    }

    if (key === "attendance.blockPolicy") {
      const blockMinutes = Math.floor(toNumberOrNull(value.blockMinutes));
      const defaultTotalBlocks = Math.floor(toNumberOrNull(value.defaultTotalBlocks));
      if (!blockMinutes || !defaultTotalBlocks || blockMinutes <= 0 || defaultTotalBlocks <= 0) {
        toast.warning("Block cham cong va tong so block phai lon hon 0");
        return null;
      }
      return { blockMinutes, defaultTotalBlocks };
    }

    if (key === "payroll.insurancePolicy") {
      const salaryCapBase = toNumberOrNull(value.salaryCapBase);
      const salaryCapMultiplier = toNumberOrNull(value.salaryCapMultiplier);
      const personalDeduction = toNumberOrNull(value.personalDeduction);
      const dependantDeduction = toNumberOrNull(value.dependantDeduction);
      const rates = {
        bhxh: toNumberOrNull(value.rates?.bhxh),
        bhyt: toNumberOrNull(value.rates?.bhyt),
        bhtn: toNumberOrNull(value.rates?.bhtn),
      };
      if (!salaryCapBase || !salaryCapMultiplier || personalDeduction === null || dependantDeduction === null) {
        toast.warning("Thong so bao hiem/thue khong hop le");
        return null;
      }
      if (Object.values(rates).some((rate) => rate === null || rate < 0)) {
        toast.warning("Ty le bao hiem khong hop le");
        return null;
      }
      return {
        enabled: value.enabled === true,
        pitEnabled: value.pitEnabled === true,
        salaryCapBase,
        salaryCapMultiplier,
        personalDeduction,
        dependantDeduction,
        rates,
      };
    }

    if (key === "overtime.payPolicy") {
      const workHoursPerDay = toNumberOrNull(value.workHoursPerDay);
      const multipliers = {};
      for (const item of OT_MULTIPLIER_LABELS) {
        const multiplier = toNumberOrNull(value.multipliers?.[item.key]);
        if (!multiplier || multiplier <= 0) {
          toast.warning(`Hệ số ${item.label} phải lớn hơn 0`);
          return null;
        }
        multipliers[item.key] = multiplier;
      }
      if (!workHoursPerDay || workHoursPerDay <= 0) {
        toast.warning("Số giờ công chuẩn mỗi ngày phải lớn hơn 0");
        return null;
      }
      return { workHoursPerDay, multipliers };
    }

    if (key === "payroll.processingPolicy") {
      const employeeBatchSize = Math.floor(toNumberOrNull(value.employeeBatchSize));
      const attendanceBulkBatchSize = Math.floor(toNumberOrNull(value.attendanceBulkBatchSize));
      if (!employeeBatchSize || !attendanceBulkBatchSize || employeeBatchSize <= 0 || attendanceBulkBatchSize <= 0) {
        toast.warning("Kích thước xử lý theo lô phải lớn hơn 0");
        return null;
      }
      return { employeeBatchSize, attendanceBulkBatchSize };
    }

    return value;
  };

  const saveOperationSetting = async (key) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để cập nhật cấu hình hệ thống");
      return;
    }

    const setting = DEFAULT_OPERATION_SETTINGS[key];
    const value = getOperationSettingPayload(key);
    if (!setting || !value) return;

    try {
      setOperationSavingKey(key);
      await systemSettingApi.updateByKey(key, {
        category: setting.category,
        description: setting.description,
        value,
      });
      toast.success("Đã lưu cấu hình");
      await fetchSystemSettings();
    } catch (error) {
      toast.error(error.normalizedMessage || "Lưu cấu hình thất bại");
    } finally {
      setOperationSavingKey("");
    }
  };

  const saveLeavePolicies = async () => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để cập nhật cấu hình hệ thống");
      return;
    }

    const keys = ["leave.balancePolicy", "leave.requestPolicy"];
    const payloads = keys.map((key) => {
      const setting = DEFAULT_OPERATION_SETTINGS[key];
      const value = getOperationSettingPayload(key);
      if (!setting || !value) return null;

      return {
        key,
        category: setting.category,
        description: setting.description,
        value,
      };
    });

    if (payloads.some((item) => !item)) return;

    try {
      setOperationSavingKey("leave.policies");
      await Promise.all(
        payloads.map((item) =>
          systemSettingApi.updateByKey(item.key, {
            category: item.category,
            description: item.description,
            value: item.value,
          })
        )
      );
      toast.success("Đã lưu cấu hình");
      await fetchSystemSettings();
    } catch (error) {
      toast.error(error.normalizedMessage || "Lưu cấu hình thất bại");
    } finally {
      setOperationSavingKey("");
    }
  };

  const normalizeApprovalPolicy = (value, fallback) => {
    const levels = Array.isArray(value?.levels) && value.levels.length > 0
      ? value.levels
      : fallback.levels;

    return {
      ...fallback,
      ...value,
      levels: levels.slice(0, 3).map((level, index) => {
        const type = level.type || fallback.levels[index]?.type || APPROVER_TYPES[index]?.value || "TEAM_LEADER";
        return {
          type,
          label: level.label || APPROVER_TYPES.find((item) => item.value === type)?.label || type,
          enabled: level.enabled !== false,
        };
      }),
    };
  };

  const fetchApprovalPolicies = async () => {
    if (!canManageSystem) return;
    try {
      setApprovalLoading(true);
      const res = await systemSettingApi.getByCategory("APPROVAL");
      const rows = res.data?.data || [];
      const next = { ...DEFAULT_APPROVAL_POLICIES };

      rows.forEach((item) => {
        if (!DEFAULT_APPROVAL_POLICIES[item.key]) return;
        next[item.key] = normalizeApprovalPolicy(item.value, DEFAULT_APPROVAL_POLICIES[item.key]);
      });

      setApprovalPolicies(next);
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải cấu hình duyệt đơn");
    } finally {
      setApprovalLoading(false);
    }
  };

  const setApprovalLevelCount = (key, count) => {
    setApprovalPolicies((prev) => {
      const current = prev[key] || DEFAULT_APPROVAL_POLICIES[key];
      const baseLevels = Array.from({ length: count }, (_, index) => {
        const existing = current.levels[index] || DEFAULT_APPROVAL_POLICIES[key].levels[index];
        const fallbackType = APPROVER_TYPES[index]?.value || "REPORTING_MANAGER";
        const type = existing?.type || fallbackType;
        return {
          type,
          label: APPROVER_TYPES.find((item) => item.value === type)?.label || type,
          enabled: true,
        };
      });
      return {
        ...prev,
        [key]: {
          ...current,
          levels: baseLevels,
        },
      };
    });
  };

  const updateApprovalLevelType = (key, index, type) => {
    setApprovalPolicies((prev) => {
      const current = prev[key] || DEFAULT_APPROVAL_POLICIES[key];
      const label = APPROVER_TYPES.find((item) => item.value === type)?.label || type;
      const nextLevels = current.levels.map((level, levelIndex) =>
        levelIndex === index ? { ...level, type, label, enabled: true } : level
      );
      return { ...prev, [key]: { ...current, levels: nextLevels } };
    });
  };

  const saveApprovalPolicy = async (key) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để cập nhật cấu hình duyệt");
      return;
    }
    const policy = approvalPolicies[key];
    if (!policy?.levels?.length) {
      toast.warning("Cần có ít nhất 1 tầng duyệt");
      return;
    }

    try {
      setApprovalLoading(true);
      await systemSettingApi.updateByKey(key, {
        category: "APPROVAL",
        description: key === "approval.leave" ? "Cấu hình luồng duyệt đơn nghỉ" : "Cấu hình luồng duyệt đơn OT",
        value: {
          requestType: policy.requestType,
          levels: policy.levels.map((level) => ({
            type: level.type,
            label: APPROVER_TYPES.find((item) => item.value === level.type)?.label || level.type,
            enabled: true,
          })),
        },
      });
      toast.success("Đã cập nhật cấu hình duyệt đơn");
      await Promise.all([fetchApprovalPolicies(), fetchSystemSettings()]);
    } catch (error) {
      toast.error(error.normalizedMessage || "Cập nhật cấu hình duyệt thất bại");
    } finally {
      setApprovalLoading(false);
    }
  };

  const resetOfficeNetworkForm = () => {
    setOfficeNetworkForm({
      officeName: "",
      ipAddress: "",
      isActive: true,
      editingId: null,
    });
  };

  const fetchOfficeNetworks = async () => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để xem mạng văn phòng");
      return;
    }
    try {
      setOfficeNetworksLoading(true);
      const res = await officeNetworkApi.getAll();
      const data = res.data?.data || res.data || [];
      setOfficeNetworks(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải danh sách mạng văn phòng");
    } finally {
      setOfficeNetworksLoading(false);
    }
  };

  const submitOfficeNetwork = async () => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để thay đổi mạng văn phòng");
      return;
    }
    const payload = {
      officeName: officeNetworkForm.officeName.trim(),
      ipAddress: officeNetworkForm.ipAddress.trim(),
      isActive: officeNetworkForm.isActive,
    };

    if (!payload.officeName || !payload.ipAddress) {
      toast.warning("Vui lòng nhập tên văn phòng và địa chỉ IP");
      return;
    }

    try {
      setOfficeNetworksLoading(true);
      if (officeNetworkForm.editingId) {
        await officeNetworkApi.update(officeNetworkForm.editingId, payload);
        toast.success("Cập nhật mạng văn phòng thành công");
      } else {
        await officeNetworkApi.create(payload);
        toast.success("Thêm mạng văn phòng thành công");
      }
      resetOfficeNetworkForm();
      await fetchOfficeNetworks();
    } catch (error) {
      toast.error(error.normalizedMessage || "Lưu mạng văn phòng thất bại");
    } finally {
      setOfficeNetworksLoading(false);
    }
  };

  const editOfficeNetwork = (network) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để thay đổi mạng văn phòng");
      return;
    }
    setOfficeNetworkForm({
      officeName: network.officeName || "",
      ipAddress: network.ipAddress || "",
      isActive: network.isActive !== false,
      editingId: network._id,
    });
  };

  const toggleOfficeNetwork = async (network) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để thay đổi mạng văn phòng");
      return;
    }
    try {
      setOfficeNetworksLoading(true);
      await officeNetworkApi.update(network._id, { isActive: !network.isActive });
      toast.success("Cập nhật trạng thái mạng thành công");
      await fetchOfficeNetworks();
    } catch (error) {
      toast.error(error.normalizedMessage || "Cập nhật trạng thái thất bại");
    } finally {
      setOfficeNetworksLoading(false);
    }
  };

  const disableOfficeNetwork = async (network) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để thay đổi mạng văn phòng");
      return;
    }
    if (!window.confirm(`Tắt mạng văn phòng "${network.officeName}"?`)) return;

    try {
      setOfficeNetworksLoading(true);
      await officeNetworkApi.disable(network._id);
      toast.success("Đã tắt mạng văn phòng");
      await fetchOfficeNetworks();
    } catch (error) {
      toast.error(error.normalizedMessage || "Tắt mạng văn phòng thất bại");
    } finally {
      setOfficeNetworksLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để xem audit logs");
      return;
    }
    try {
      setAuditLoading(true);
      setSelectedAuditLog(null);
      const res = await auditLogApi.getAll({ limit: 100 });
      setAuditLogs(extractAuditLogList(res.data));
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchAuditLogDetail = async (id = auditLogId) => {
    if (!canManageSystem) {
      toast.error("Bạn không có quyền MANAGE_SYSTEM để xem audit logs");
      return;
    }
    if (!id) {
      toast.warning("Vui lòng chọn audit log");
      return;
    }
    try {
      setAuditLoading(true);
      const res = await auditLogApi.getById(id);
      setSelectedAuditLog(res.data?.data?.log || res.data?.data || res.data);
    } catch (error) {
      toast.error(error.normalizedMessage || "Không thể tải chi tiết audit log");
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    if (activeAdminTab === "audit" && auditLogs.length === 0) {
      fetchAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdminTab]);

  const _selectSettingForEditV2 = (item) => {
    setSettingKey(item.key || "");
    setSettingPayload(JSON.stringify({
      category: item.category || "GENERAL",
      description: item.description || "",
      value: item.value ?? {},
    }, null, 2));
  };

  const formatSettingValueV2 = (item) => {
    const value = item?.value ?? item;
    if (value?.levels && Array.isArray(value.levels)) {
      return value.levels.map((level, index) => `${index + 1}. ${level.label || level.type}`).join(" -> ");
    }
    if (Array.isArray(value)) {
      return `${value.length} mục`;
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value).slice(0, 4);
      if (entries.length === 0) return "Chưa cấu hình";
      return entries
        .map(([key, entryValue]) => {
          if (entryValue === null || entryValue === undefined) return `${key}: --`;
          if (typeof entryValue === "boolean") return `${key}: ${entryValue ? "Bật" : "Tắt"}`;
          if (typeof entryValue === "object") return key;
          return `${key}: ${entryValue}`;
        })
        .join(", ");
    }
    if (typeof value === "boolean") return value ? "Bật" : "Tắt";
    return value || "--";
  };

  const getApprovalSummaryV2 = (key) => {
    const policy = approvalPolicies[key] || DEFAULT_APPROVAL_POLICIES[key];
    return policy.levels.map((level) => level.label || level.type).join(" -> ");
  };

  const renderApprovalPolicyCardV2 = (key, title, description) => {
    const policy = approvalPolicies[key] || DEFAULT_APPROVAL_POLICIES[key];

    return (
      <Card className="p-0 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {policy.levels.length} cấp
            </span>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Số cấp duyệt
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              {[1, 2, 3].map((count) => (
                <button
                  key={`${key}-level-count-${count}`}
                  type="button"
                  onClick={() => setApprovalLevelCount(key, count)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    policy.levels.length === count
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {count} cấp
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {policy.levels.map((level, index) => (
              <div key={`${key}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">
                    {index + 1}
                  </span>
                  <label className="text-sm font-medium text-slate-700">Cấp duyệt {index + 1}</label>
                </div>
                <select
                  value={level.type}
                  onChange={(event) => updateApprovalLevelType(key, index, event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {APPROVER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Luồng hiện tại
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {policy.levels.map((level, index) => (
                <React.Fragment key={`${key}-preview-${index}`}>
                  <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    {level.label || level.type}
                  </span>
                  {index < policy.levels.length - 1 && (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => saveApprovalPolicy(key)} disabled={approvalLoading}>
              {approvalLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              Lưu cấu hình
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderNumberInput = ({ label, value, onChange, min = 0, step = "1", suffix }) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="flex overflow-hidden rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="number"
          min={min}
          step={step}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 px-3 py-2 text-sm outline-none"
        />
        {suffix && (
          <span className="flex items-center border-l border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );

  const renderSaveSettingButton = (key) => (
    <Button
      type="button"
      onClick={() => saveOperationSetting(key)}
      disabled={operationSavingKey === key}
    >
      {operationSavingKey === key ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Save size={16} className="mr-2" />
      )}
      Lưu cấu hình
    </Button>
  );

  const renderOperationalSettings = () => {
    const leaveBalance = operationSettings["leave.balancePolicy"];
    const leaveRequest = operationSettings["leave.requestPolicy"];
    const attendanceBlock = operationSettings["attendance.blockPolicy"];
    const insurancePolicy = operationSettings["payroll.insurancePolicy"];
    const overtimePay = operationSettings["overtime.payPolicy"];
    const payrollProcessing = operationSettings["payroll.processingPolicy"];

    return (
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Chính sách nghỉ phép</h3>
            <p className="mt-1 text-sm text-slate-500">
              Áp dụng cho reset quỹ phép, chuyển phép năm và file đính kèm đơn nghỉ.
            </p>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {renderNumberInput({
                label: "Phép năm mặc định",
                value: leaveBalance.annualEntitlementDays,
                min: 0.5,
                step: "0.5",
                suffix: "ngày",
                onChange: (value) => updateOperationSettingValue("leave.balancePolicy", "annualEntitlementDays", value),
              })}
              {renderNumberInput({
                label: "Chuyển phép tối đa",
                value: leaveBalance.maxCarryOverDays,
                min: 0,
                step: "0.5",
                suffix: "ngày",
                onChange: (value) => updateOperationSettingValue("leave.balancePolicy", "maxCarryOverDays", value),
              })}
              {renderNumberInput({
                label: "File đính kèm tối đa",
                value: leaveRequest.maxAttachments,
                min: 1,
                step: "1",
                suffix: "file",
                onChange: (value) => updateOperationSettingValue("leave.requestPolicy", "maxAttachments", value),
              })}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                onClick={saveLeavePolicies}
                disabled={operationSavingKey === "leave.policies"}
              >
                {operationSavingKey === "leave.policies" ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Lưu cấu hình
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Block chấm công</h3>
            <p className="mt-1 text-sm text-slate-500">
              Cấu hình số phút mỗi block và tổng block mặc định để quy đổi công.
            </p>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {renderNumberInput({
                label: "Số phút mỗi block",
                value: attendanceBlock.blockMinutes,
                min: 1,
                step: "1",
                suffix: "phút",
                onChange: (value) => updateOperationSettingValue("attendance.blockPolicy", "blockMinutes", value),
              })}
              {renderNumberInput({
                label: "Tổng block mặc định",
                value: attendanceBlock.defaultTotalBlocks,
                min: 1,
                step: "1",
                suffix: "block",
                onChange: (value) => updateOperationSettingValue("attendance.blockPolicy", "defaultTotalBlocks", value),
              })}
            </div>
            <div className="flex justify-end">
              {renderSaveSettingButton("attendance.blockPolicy")}
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Chính sách OT & lương</h3>
            <p className="mt-1 text-sm text-slate-500">
              Áp dụng cho ước tính tiền OT, chạy bảng lương và tổng hợp giờ công.
            </p>
          </div>
          <div className="space-y-5 p-5">
            {renderNumberInput({
              label: "Số giờ công chuẩn mỗi ngày",
              value: overtimePay.workHoursPerDay,
              min: 0.5,
              step: "0.5",
              suffix: "giờ",
              onChange: (value) => updateOperationSettingValue("overtime.payPolicy", "workHoursPerDay", value),
            })}
            <div>
              <div className="mb-3 text-sm font-semibold text-slate-800">Hệ số tăng ca</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {OT_MULTIPLIER_LABELS.map((item) => (
                  <React.Fragment key={item.key}>
                    {renderNumberInput({
                      label: item.label,
                      value: overtimePay.multipliers?.[item.key],
                      min: 0.1,
                      step: "0.1",
                      suffix: "x",
                      onChange: (value) => updateOtMultiplier(item.key, value),
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              {renderSaveSettingButton("overtime.payPolicy")}
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Bảo hiểm & thuế</h3>
            <p className="mt-1 text-sm text-slate-500">
              Mặc định đang tắt để giữ đúng cách tính lương hiện tại; bật lên khi công ty áp dụng khấu trừ.
            </p>
          </div>
          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={insurancePolicy.enabled === true}
                  onChange={(event) => updateOperationSettingBoolean("payroll.insurancePolicy", "enabled", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Khấu trừ bảo hiểm
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={insurancePolicy.pitEnabled === true}
                  onChange={(event) => updateOperationSettingBoolean("payroll.insurancePolicy", "pitEnabled", event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Tính thuế TNCN
              </label>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {["bhxh", "bhyt", "bhtn"].map((key) => (
                <React.Fragment key={key}>
                  {renderNumberInput({
                    label: key.toUpperCase(),
                    value: insurancePolicy.rates?.[key],
                    min: 0,
                    step: "0.001",
                    suffix: "tỷ lệ",
                    onChange: (value) => updateInsuranceRate(key, value),
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {renderNumberInput({
                label: "Lương cơ sở tính trần",
                value: insurancePolicy.salaryCapBase,
                min: 1,
                step: "1000",
                suffix: "VND",
                onChange: (value) => updateOperationSettingValue("payroll.insurancePolicy", "salaryCapBase", value),
              })}
              {renderNumberInput({
                label: "Hệ số trần đóng",
                value: insurancePolicy.salaryCapMultiplier,
                min: 1,
                step: "1",
                suffix: "x",
                onChange: (value) => updateOperationSettingValue("payroll.insurancePolicy", "salaryCapMultiplier", value),
              })}
              {renderNumberInput({
                label: "Giảm trừ bản thân",
                value: insurancePolicy.personalDeduction,
                min: 0,
                step: "1000",
                suffix: "VND",
                onChange: (value) => updateOperationSettingValue("payroll.insurancePolicy", "personalDeduction", value),
              })}
              {renderNumberInput({
                label: "Giảm trừ mỗi phụ thuộc",
                value: insurancePolicy.dependantDeduction,
                min: 0,
                step: "1000",
                suffix: "VND",
                onChange: (value) => updateOperationSettingValue("payroll.insurancePolicy", "dependantDeduction", value),
              })}
            </div>
            <div className="flex justify-end">
              {renderSaveSettingButton("payroll.insurancePolicy")}
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
            <h3 className="font-semibold text-slate-900">Xử lý dữ liệu lương và công</h3>
            <p className="mt-1 text-sm text-slate-500">
              Điều chỉnh kích thước xử lý theo lô khi đồng bộ công và chạy bảng lương cho số lượng nhân sự lớn.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
            {renderNumberInput({
              label: "Số nhân sự mỗi lô payroll",
              value: payrollProcessing.employeeBatchSize,
              min: 1,
              step: "1",
              suffix: "người",
              onChange: (value) => updateOperationSettingValue("payroll.processingPolicy", "employeeBatchSize", value),
            })}
            {renderNumberInput({
              label: "Số bản ghi công mỗi lô đồng bộ",
              value: payrollProcessing.attendanceBulkBatchSize,
              min: 1,
              step: "1",
              suffix: "record",
              onChange: (value) => updateOperationSettingValue("payroll.processingPolicy", "attendanceBulkBatchSize", value),
            })}
            <div className="md:pb-0">
              {renderSaveSettingButton("payroll.processingPolicy")}
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSystemSettingsPanel = () => (
    <div className="space-y-5">
      {renderAdminTabs()}

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Settings2 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Cấu hình hệ thống</h1>
              <p className="mt-1 text-sm text-slate-500">
                Quản lý luồng duyệt và các setting vận hành đang lưu trên backend.
              </p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={() => {
            fetchApprovalPolicies();
            fetchSystemSettings();
          }} disabled={settingsLoading || approvalLoading}>
            {(settingsLoading || approvalLoading) ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={16} className="mr-2" />
            )}
            Làm mới
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đơn nghỉ</div>
            <div className="mt-2 text-sm font-medium text-slate-800">{getApprovalSummaryV2("approval.leave")}</div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Đơn OT</div>
            <div className="mt-2 text-sm font-medium text-slate-800">{getApprovalSummaryV2("approval.overtime")}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {renderApprovalPolicyCardV2(
          "approval.leave",
          "Duyệt đơn nghỉ",
          "Áp dụng cho các đơn nghỉ được tạo sau khi lưu cấu hình."
        )}
        {renderApprovalPolicyCardV2(
          "approval.overtime",
          "Duyệt đơn OT",
          "Áp dụng cho các đơn OT được tạo sau khi lưu cấu hình."
        )}
      </div>

      {renderOperationalSettings()}

      <div>
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">Danh sách setting</h2>
                <p className="mt-1 text-sm text-slate-500">Theo dõi các cấu hình đang áp dụng trong hệ thống.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                  {SETTING_CATEGORY_FILTERS.map((filter) => (
                    <button
                      key={filter.label}
                      type="button"
                      onClick={() => handleSettingCategoryChange(filter.value)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        settingCategory === filter.value
                          ? "bg-blue-600 text-white"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <Button type="button" variant="secondary" onClick={fetchSystemSettings} disabled={settingsLoading}>
                  {settingsLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
                  Tải
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-[560px] overflow-auto">
            {settings.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-400">
                Chưa có dữ liệu. Nhấn tải để xem cấu hình.
              </div>
            ) : (
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-white text-xs uppercase text-slate-500 shadow-sm">
                  <tr>
                    <th className="p-3 text-left">Key</th>
                    <th className="p-3 text-left">Nhóm</th>
                    <th className="p-3 text-left">Giá trị</th>
                    <th className="p-3 text-left">Mô tả</th>
                    <th className="p-3 text-left">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settings.map((item, index) => (
                    <tr
                      key={item._id || item.key || index}
                      className="hover:bg-blue-50/50"
                    >
                      <td className="p-3 font-mono text-xs text-slate-800">{item.key || "--"}</td>
                      <td className="p-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {item.category || "--"}
                        </span>
                      </td>
                      <td className="max-w-md truncate p-3 text-xs text-slate-600">{formatSettingValueV2(item)}</td>
                      <td className="max-w-sm p-3 text-xs text-slate-500">{item.description || "--"}</td>
                      <td className="p-3 text-xs text-slate-500">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

      </div>
    </div>
  );

  const renderApprovalPolicyCard = (key, title, description) => {
    const policy = approvalPolicies[key] || DEFAULT_APPROVAL_POLICIES[key];

    return (
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Số tầng duyệt</label>
            <select
              value={policy.levels.length}
              onChange={(event) => setApprovalLevelCount(key, Number(event.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 tầng</option>
              <option value={2}>2 tầng</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {policy.levels.map((level, index) => (
              <div key={`${key}-${index}`}>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tầng {index + 1}</label>
                <select
                  value={level.type}
                  onChange={(event) => updateApprovalLevelType(key, index, event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {APPROVER_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <Button type="button" onClick={() => saveApprovalPolicy(key)} disabled={approvalLoading}>
          {approvalLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Luu cau hinh
        </Button>
      </Card>
    );
  };

  const _renderSystemSettings = () => (
    <div className="space-y-4">
      {renderAdminTabs()}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {renderApprovalPolicyCard(
          "approval.leave",
          "Duyet don nghi",
          "Ap dung cho cac don leave tao moi sau khi luu cau hinh."
        )}
        {renderApprovalPolicyCard(
          "approval.overtime",
          "Duyet don OT",
          "Ap dung cho cac don OT tao moi sau khi luu cau hinh."
        )}
      </div>
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
            <input
              value={settingCategory}
              onChange={(e) => setSettingCategory(e.target.value)}
              placeholder="payroll, attendance..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <Button type="button" variant="secondary" onClick={fetchSystemSettings} disabled={settingsLoading}>
            {settingsLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Tải cấu hình
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-800">Danh sach cau hinh</div>
          <div className="max-h-[520px] overflow-auto">
            {settings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Chưa có dữ liệu. Nhấn tải cấu hình để xem.</div>
            ) : (
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="p-3 text-left">Key</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {settings.map((item, index) => (
                    <tr
                      key={item._id || item.key || index}
                      className="hover:bg-blue-50/40 cursor-pointer"
                      onClick={() => {
                        setSettingKey(item.key || "");
                        setSettingPayload(JSON.stringify({ value: item.value }, null, 2));
                      }}
                    >
                      <td className="p-3 font-mono text-xs">{item.key || "--"}</td>
                      <td className="p-3">{item.category || "--"}</td>
                      <td className="p-3 max-w-md truncate font-mono text-xs">{JSON.stringify(item.value ?? item)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Cập nhật setting</h3>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Setting key</label>
            <input
              value={settingKey}
              onChange={(e) => setSettingKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Payload JSON</label>
            <textarea
              value={settingPayload}
              onChange={(e) => setSettingPayload(e.target.value)}
              rows={8}
              spellCheck={false}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <Button type="button" onClick={updateSystemSetting} disabled={settingsLoading} className="w-full">
            Cập nhật
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderOfficeNetworks = () => (
    <div className="space-y-4">
      {renderAdminTabs()}

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wifi size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Mạng văn phòng</h2>
            <p className="text-sm text-gray-500">Quản lý IP được phép chấm công bằng web.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Ten van phong</label>
            <input
              value={officeNetworkForm.officeName}
              onChange={(e) => setOfficeNetworkForm((prev) => ({ ...prev, officeName: e.target.value }))}
              placeholder="VD: LNG Office"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Dia chi IP</label>
            <input
              value={officeNetworkForm.ipAddress}
              onChange={(e) => setOfficeNetworkForm((prev) => ({ ...prev, ipAddress: e.target.value }))}
              placeholder="VD: 127.0.0.1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={officeNetworkForm.isActive}
              onChange={(e) => setOfficeNetworkForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded text-blue-600"
            />
            Đang hoạt động
          </label>

          <div className="flex gap-2">
            {officeNetworkForm.editingId && (
              <Button type="button" variant="secondary" onClick={resetOfficeNetworkForm} disabled={officeNetworksLoading}>
                Huy
              </Button>
            )}
            <Button type="button" onClick={submitOfficeNetwork} disabled={officeNetworksLoading}>
              {officeNetworksLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              {officeNetworkForm.editingId ? "Cập nhật" : "Thêm IP"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b bg-gray-50 p-4">
          <div className="font-semibold text-gray-800">Danh sach IP</div>
          <Button type="button" variant="secondary" onClick={fetchOfficeNetworks} disabled={officeNetworksLoading}>
            {officeNetworksLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            Tải danh sách
          </Button>
        </div>

        {officeNetworks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Chưa có IP nào. Nhấn "Tải danh sách" hoặc thêm IP mới.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3 text-left">Văn phòng</th>
                  <th className="p-3 text-left">IP</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Cập nhật</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {officeNetworks.map((network) => (
                  <tr key={network._id} className="hover:bg-blue-50/40">
                    <td className="p-3 font-medium text-gray-800">{network.officeName}</td>
                    <td className="p-3 font-mono text-xs text-gray-700">{network.ipAddress}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        network.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {network.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {network.updatedAt ? new Date(network.updatedAt).toLocaleString("vi-VN") : "--"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editOfficeNetwork(network)}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleOfficeNetwork(network)}
                          className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                        >
                          {network.isActive ? "Tắt" : "Bật"}
                        </button>
                        <button
                          type="button"
                          onClick={() => disableOfficeNetwork(network)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          Disable
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );

  const renderAuditLogs = () => (
    <AuditLogsPanel
      auditLogId={auditLogId}
      auditLoading={auditLoading}
      auditLogs={auditLogs}
      onRefresh={fetchAuditLogs}
      onSelectLog={(log) => {
        const id = log?._id || log?.id;
        setAuditLogId(id || "");
        if (id) {
          setSelectedAuditLog(log);
          fetchAuditLogDetail(id);
        } else {
          setSelectedAuditLog(log || null);
        }
      }}
      renderAdminTabs={renderAdminTabs}
      selectedAuditLog={selectedAuditLog}
    />
  );
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (activeAdminTab === "settings" && canManageSystem) {
    return renderSystemSettingsPanel();
  }

  if (activeAdminTab === "officeNetworks" && canManageSystem) {
    return renderOfficeNetworks();
  }

  if (activeAdminTab === "audit" && canManageSystem) {
    return renderAuditLogs();
  }

  if (!canReadRolesOrPermissions) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Bạn không có quyền để xem khu vực cài đặt hệ thống.
      </div>
    );
  }

  return (
    <>
    {renderAdminTabs()}
    <div className="min-h-[calc(100dvh-8rem)] lg:h-[calc(100vh-150px)] flex flex-col xl:flex-row gap-4 lg:gap-6">
      {/* --- MODAL TẠO PERMISSION --- */}
      {canWritePermissions && isCreatingPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Key size={18} className="text-blue-600" /> Thêm quyền hạn mới
              </h3>
              <button
                onClick={() => setIsCreatingPerm(false)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên quyền (Key) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="VD: MANAGE_SYSTEM"
                  value={newPermData.name}
                  onChange={(e) =>
                    setNewPermData({ ...newPermData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="VD: Quản trị hệ thống"
                  value={newPermData.displayName}
                  onChange={(e) =>
                    setNewPermData({ ...newPermData, displayName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="VD: ADMIN, AUTH..."
                  value={newPermData.module}
                  onChange={(e) =>
                    setNewPermData({ ...newPermData, module: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Mô tả chức năng của quyền này..."
                  rows={3}
                  value={newPermData.description}
                  onChange={(e) =>
                    setNewPermData({
                      ...newPermData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setIsCreatingPerm(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreatePermission} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Tạo mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LEFT SIDEBAR: ROLES --- */}
      <Card className="w-full xl:w-80 xl:flex-shrink-0 p-4 sm:p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Shield size={20} className="text-blue-600" />
            Vai trò
          </h2>
          <button
            onClick={() => setIsCreatingRole(!isCreatingRole)}
            disabled={!canWriteRoles}
            className={`p-2 rounded-lg transition-colors ${
              canWriteRoles
                ? "hover:bg-blue-50 text-blue-600"
                : "text-gray-300 cursor-not-allowed"
            }`}
            title={canWriteRoles ? "Thêm vai trò mới" : "Cần quyền WRITE_ROLES"}
          >
            {isCreatingRole ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {canWriteRoles && isCreatingRole && (
          <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Tên vai trò..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRole()}
            />
            <button
              onClick={handleCreateRole}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Check size={16} />
            </button>
          </div>
        )}

        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role._id}
              onClick={() => setSelectedRole(role)}
              className={`
                group flex items-center justify-between p-4 rounded-lg cursor-pointer border-2 transition-all
                ${selectedRole?._id === role._id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }
              `}
            >
              <div className="flex-1">
                <p
                  className={`font-semibold text-sm ${selectedRole?._id === role._id ? "text-blue-700" : "text-gray-700"}`}
                >
                  {role.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {role.permissions?.length || 0} quyền hạn
                </p>
              </div>

              {canWriteRoles && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRole(role._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* --- RIGHT CONTENT: PERMISSION TABLE --- */}
      <Card className="flex-1 p-4 sm:p-6 overflow-hidden flex flex-col">
        {selectedRole ? (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Phân quyền: <span className="text-blue-600">{selectedRole.name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý quyền hạn theo từng module
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm quyền..."
                    className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setIsCreatingPerm(true)}
                  disabled={!canWritePermissions}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    canWritePermissions
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                  title={canWritePermissions ? "Tạo quyền mới" : "Cần quyền WRITE_PERMISSIONS"}
                >
                  <Plus size={18} />
                  <span className="text-sm font-medium">Thêm quyền</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Không tìm thấy quyền hạn nào phù hợp</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(
                    ([moduleName, perms]) => (
                      <div
                        key={moduleName}
                        className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
                      >
                        {/* Module Header */}
                        <div
                          onClick={() => toggleModule(moduleName)}
                          className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:from-gray-100 hover:to-gray-150 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {expandedModules[moduleName] ? (
                              <ChevronDown size={18} className="text-gray-600" />
                            ) : (
                              <ChevronRight size={18} className="text-gray-600" />
                            )}
                            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                              {getVietnameseModule(moduleName)}
                            </h3>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            {perms.filter(p => hasPermission(p._id)).length} / {perms.length}
                          </span>
                        </div>

                        {/* Permissions Table */}
                        {expandedModules[moduleName] && (
                          <table className="w-full min-w-[760px]">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                                  <input
                                    type="checkbox"
                                    disabled={!canWriteRoles}
                                    className={`w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${
                                      canWriteRoles ? "" : "cursor-not-allowed opacity-50"
                                    }`}
                                    checked={perms.every(p => hasPermission(p._id))}
                                    onChange={(e) => {
                                      if (!canWriteRoles) return;
                                      const shouldAssign = e.target.checked;
                                      perms.forEach(perm => {
                                        const isAssigned = hasPermission(perm._id);
                                        if (shouldAssign !== isAssigned) {
                                          togglePermission(perm._id, isAssigned);
                                        }
                                      });
                                    }}
                                  />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Tên quyền
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Mã quyền
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Mô tả
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {perms.map((perm) => {
                                const isAssigned = hasPermission(perm._id);
                                return (
                                  <tr
                                    key={perm._id}
                                    className={`hover:bg-gray-50 transition-colors ${isAssigned ? "bg-blue-50/30" : ""}`}
                                  >
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        disabled={!canWriteRoles}
                                        className={`w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 ${
                                          canWriteRoles ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                                        }`}
                                        checked={isAssigned}
                                        onChange={() =>
                                          togglePermission(perm._id, isAssigned)
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className={`text-sm font-medium ${isAssigned ? "text-blue-700" : "text-gray-700"}`}>
                                        {getPermissionDisplayName(perm)}
                                      </p>
                                    </td>
                                    <td className="px-4 py-3">
                                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                                        {perm.name}
                                      </code>
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="text-xs text-gray-500">
                                        {perm.description || "—"}
                                      </p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Shield size={64} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Vui lòng chọn một vai trò</p>
            <p className="text-sm mt-2">Chọn vai trò bên trái để bắt đầu phân quyền</p>
          </div>
        )}
      </Card>
    </div>
    </>
  );
};

export default SystemAdmin;
