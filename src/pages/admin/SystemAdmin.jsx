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
} from "lucide-react";
import { roleApi } from "../../apis/roleApi";
import { permissionApi } from "../../apis/permissionApi";
import { auditLogApi } from "../../apis/auditLogApi";
import { systemSettingApi } from "../../apis/systemSettingApi";
import { toast } from "react-toastify";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button"; // Đảm bảo component này tồn tại

const SystemAdmin = () => {
  const [activeAdminTab, setActiveAdminTab] = useState("roles");
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
    "RUN_PAYROLL": "Chạy bảng lương",
    "READ_PAYROLLS": "Xem bảng lương",
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
    "READ_LEAVE": "Xem đơn nghỉ",
    "UPDATE_LEAVE": "Cập nhật đơn nghỉ",
    "DELETE_LEAVE": "Xóa đơn nghỉ",
    "APPROVE_LEAVE": "Duyệt đơn nghỉ",

    // OT Module
    "CREATE_OT": "Tạo đơn OT",
    "READ_OT": "Xem đơn OT",
    "UPDATE_OT": "Cập nhật đơn OT",
    "DELETE_OT": "Xóa đơn OT",
    "APPROVE_OT": "Duyệt đơn OT",

    // USER Module
    "CREATE_USER": "Tạo người dùng",
    "READ_USER": "Xem người dùng",
    "UPDATE_USER": "Cập nhật người dùng",
    "DELETE_USER": "Xóa người dùng",
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

  const getAuditActionName = (log) => {
    return (
      log?.action?.actionName ||
      log?.actionName ||
      log?.action?.permissionId?.name ||
      log?.event ||
      "--"
    );
  };

  const getAuditUserName = (log) => {
    return (
      log?.userId?.fullName ||
      log?.userId?.username ||
      log?.user?.fullName ||
      log?.user?.username ||
      "--"
    );
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
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogId, setAuditLogId] = useState("");
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // --- INIT DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        roleApi.getAll(),
        permissionApi.getAll(),
      ]);

      // Xử lý dữ liệu trả về an toàn
      const rolesData = rolesRes.data?.data || rolesRes.data || [];
      const permsData = permsRes.data?.data || permsRes.data || [];

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
        searchTerm === "" ||
        perm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!newRoleName.trim()) return;
    try {
      const res = await roleApi.create({ name: newRoleName });
      console.log('API: ', res)
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
    // Validate cơ bản
    if (!newPermData.name || !newPermData.module) {
      toast.warning("Vui lòng nhập Tên quyền và Module");
      return;
    }

    try {
      const res = await permissionApi.create(newPermData);
      toast.success("Tạo quyền hạn mới thành công");

      const newPerm = res.data?.data || res.data;
      setPermissions([...permissions, newPerm]); // Cập nhật list ngay lập tức

      // Reset form
      setNewPermData({ name: "", module: "", description: "" });
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
      // eslint-disable-next-line no-unused-vars
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
      toast.error("JSON khong hop le");
      return null;
    }
  };

  const renderAdminTabs = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {[
        { id: "roles", label: "Vai tro & quyen" },
        { id: "settings", label: "Cau hinh he thong" },
        { id: "audit", label: "Audit logs" },
      ].map((tab) => (
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

  const fetchSystemSettings = async () => {
    try {
      setSettingsLoading(true);
      const res = settingCategory.trim()
        ? await systemSettingApi.getByCategory(settingCategory.trim())
        : await systemSettingApi.getAll();
      const data = res.data?.data || res.data || [];
      setSettings(Array.isArray(data) ? data : Object.values(data || {}));
    } catch (error) {
      toast.error(error.normalizedMessage || "Khong the tai cau hinh he thong");
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSystemSetting = async () => {
    const payload = parseJsonPayload(settingPayload);
    if (!payload || !settingKey.trim()) {
      if (!settingKey.trim()) toast.warning("Vui long nhap setting key");
      return;
    }
    if (!window.confirm("Cap nhat cau hinh he thong nay?")) return;

    try {
      setSettingsLoading(true);
      await systemSettingApi.updateByKey(settingKey.trim(), payload);
      toast.success("Cap nhat cau hinh thanh cong");
      await fetchSystemSettings();
    } catch (error) {
      toast.error(error.normalizedMessage || "Cap nhat cau hinh that bai");
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setAuditLoading(true);
      setSelectedAuditLog(null);
      const res = await auditLogApi.getAll({ limit: 100 });
      setAuditLogs(extractAuditLogList(res.data));
    } catch (error) {
      toast.error(error.normalizedMessage || "Khong the tai audit logs");
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchAuditLogDetail = async (id = auditLogId) => {
    if (!id) {
      toast.warning("Vui long chon audit log");
      return;
    }
    try {
      setAuditLoading(true);
      const res = await auditLogApi.getById(id);
      setSelectedAuditLog(res.data?.data?.log || res.data?.data || res.data);
    } catch (error) {
      toast.error(error.normalizedMessage || "Khong the tai chi tiet audit log");
    } finally {
      setAuditLoading(false);
    }
  };

  const renderSystemSettings = () => (
    <div className="space-y-4">
      {renderAdminTabs()}
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
            Tai cau hinh
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-0 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 font-semibold text-gray-800">Danh sach cau hinh</div>
          <div className="max-h-[520px] overflow-auto">
            {settings.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Chua co du lieu. Nhan tai cau hinh de xem.</div>
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
          <h3 className="font-semibold text-gray-800">Cap nhat setting</h3>
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
            Cap nhat
          </Button>
        </Card>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      {renderAdminTabs()}
      <Card className="p-4 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-gray-800">Audit logs</h2>
          <p className="text-sm text-gray-500">Theo doi cac thay doi quan trong trong he thong.</p>
        </div>
        <Button type="button" variant="secondary" onClick={fetchAuditLogs} disabled={auditLoading}>
          {auditLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
          Tai logs
        </Button>
      </Card>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-0 overflow-hidden">
          <div className="max-h-[580px] overflow-auto">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Chua co du lieu. Nhan tai logs de xem.</div>
            ) : (
              <table className="w-full min-w-[840px] text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                  <tr>
                    <th className="p-3 text-left">Action</th>
                    <th className="p-3 text-left">Module</th>
                    <th className="p-3 text-left">User</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {auditLogs.map((log, index) => (
                    <tr
                      key={log._id || index}
                      className="hover:bg-blue-50/40 cursor-pointer"
                      onClick={() => {
                        setAuditLogId(log._id);
                        fetchAuditLogDetail(log._id);
                      }}
                    >
                      <td className="p-3 font-medium">{getVietnameseName(getAuditActionName(log))}</td>
                      <td className="p-3 text-gray-600">{getVietnameseModule(log.module) || "--"}</td>
                      <td className="p-3 text-gray-600">{getAuditUserName(log)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {log.status || "--"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString("vi-VN") : "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Chi tiet log</h3>
          <input
            value={auditLogId}
            onChange={(e) => setAuditLogId(e.target.value)}
            placeholder="Audit log ID"
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <Button type="button" variant="secondary" onClick={() => fetchAuditLogDetail()} disabled={auditLoading} className="w-full mb-4">
            Xem chi tiet
          </Button>
          <pre className="text-xs bg-gray-950 text-gray-100 rounded-lg p-3 max-h-[420px] overflow-auto">
            {selectedAuditLog ? JSON.stringify(selectedAuditLog, null, 2) : "Chua chon log."}
          </pre>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (activeAdminTab === "settings") {
    return renderSystemSettings();
  }

  if (activeAdminTab === "audit") {
    return renderAuditLogs();
  }

  return (
    <>
    {renderAdminTabs()}
    <div className="min-h-[calc(100dvh-8rem)] lg:h-[calc(100vh-150px)] flex flex-col xl:flex-row gap-4 lg:gap-6">
      {/* --- MODAL TẠO PERMISSION --- */}
      {isCreatingPerm && (
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
            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
            title="Thêm vai trò mới"
          >
            {isCreatingRole ? <X size={18} /> : <Plus size={18} />}
          </button>
        </div>

        {isCreatingRole && (
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

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRole(role._id);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  title="Tạo quyền mới"
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
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    checked={perms.every(p => hasPermission(p._id))}
                                    onChange={(e) => {
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
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        checked={isAssigned}
                                        onChange={() =>
                                          togglePermission(perm._id, isAssigned)
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className={`text-sm font-medium ${isAssigned ? "text-blue-700" : "text-gray-700"}`}>
                                        {getVietnameseName(perm.name)}
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
