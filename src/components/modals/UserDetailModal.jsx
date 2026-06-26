import React, { useMemo, useState } from "react";
import {
  X,
  Shield,
  RefreshCcw,
  Lock,
  Unlock,
  Activity,
  CheckSquare,
  Square,
  Save,
  Loader2,
  LogIn,
  Key,
} from "lucide-react";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";
import { accountApi } from "../../apis/accountApi";
import { toast } from "react-toastify";
import { formatEmployeeCode } from "../../utils/employeeDisplay";

const permissionActionColumns = [
  { key: "read", label: "Xem" },
  { key: "write", label: "Ghi" },
  { key: "approve", label: "Duyệt" },
  { key: "manage", label: "Quản lý" },
  { key: "other", label: "Khác" },
];

const moduleNameMap = {
  ACCOUNT: "Tài khoản",
  ACCOUNTS: "Tài khoản",
  ADMIN: "Quản trị",
  ANNOUNCEMENT: "Thông báo",
  ANNOUNCEMENTS: "Thông báo",
  ATTENDANCE: "Chấm công",
  ATTENDANCES: "Chấm công",
  AUTH: "Xác thực",
  DEPARTMENT: "Phòng ban",
  DEPARTMENTS: "Phòng ban",
  EMPLOYEE: "Nhân sự",
  EMPLOYEES: "Nhân sự",
  HOLIDAY: "Ngày nghỉ",
  HOLIDAYS: "Ngày nghỉ",
  LEAVE: "Nghỉ phép",
  LEAVES: "Nghỉ phép",
  OT: "Tăng ca",
  OVERTIME: "Tăng ca",
  PAYROLL: "Lương",
  PAYROLLS: "Lương",
  PERMISSION: "Quyền hạn",
  PERMISSIONS: "Quyền hạn",
  REPORT: "Báo cáo",
  REPORTS: "Báo cáo",
  REQUEST: "Yêu cầu",
  REQUESTS: "Yêu cầu",
  ROLE: "Vai trò",
  ROLES: "Vai trò",
  SHIFT: "Ca làm",
  SHIFTS: "Ca làm",
  SYSTEM: "Hệ thống",
  TEAM: "Đội nhóm",
  TEAMS: "Đội nhóm",
  USER: "Người dùng",
  USERS: "Người dùng",
};

const getPermissionName = (permission) =>
  typeof permission === "string" ? permission : permission?.name || "";

const getPermissionDisplayName = (permission) =>
  typeof permission === "string"
    ? permission
    : permission?.displayName?.trim() || permission?.name || "";

const inferPermissionAction = (permission) => {
  const name = getPermissionName(permission).toUpperCase();

  if (/^(READ|VIEW)_/.test(name)) return "read";
  if (/^(WRITE|CREATE|UPDATE)_/.test(name)) return "write";
  if (/^(APPROVE|REFUND)_/.test(name) || name.includes("APPROVE")) {
    return "approve";
  }
  if (/^MANAGE_/.test(name)) return "manage";

  return "other";
};

const inferPermissionModule = (permission) => {
  const explicitModule =
    typeof permission === "object" && permission?.module
      ? String(permission.module).toUpperCase()
      : "";

  if (explicitModule) return explicitModule;

  const name = getPermissionName(permission).toUpperCase();
  const normalized = name.replace(
    /^(READ|VIEW|WRITE|CREATE|UPDATE|DELETE|APPROVE|MANAGE|REFUND)_/,
    "",
  );
  const parts = normalized.split("_").filter(Boolean);

  return parts[parts.length - 1] || "OTHER";
};

const buildPermissionRows = (permissions = []) => {
  const grouped = new Map();

  permissions.forEach((permission) => {
    const name = getPermissionName(permission);
    if (!name) return;

    const moduleKey = inferPermissionModule(permission);
    const actionKey = inferPermissionAction(permission);

    if (!grouped.has(moduleKey)) {
      grouped.set(moduleKey, {
        key: moduleKey,
        label: moduleNameMap[moduleKey] || moduleKey,
        actions: permissionActionColumns.reduce((acc, column) => {
          acc[column.key] = [];
          return acc;
        }, {}),
      });
    }

    grouped.get(moduleKey).actions[actionKey].push(getPermissionDisplayName(permission));
  });

  return Array.from(grouped.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "vi"),
  );
};

const PermissionCell = ({ items }) => (
  <td className="px-4 py-3 text-center">
    {items.length > 0 ? (
      <CheckSquare
        size={16}
        className="mx-auto text-blue-600"
        title={items.join(", ")}
      />
    ) : (
      <Square size={16} className="mx-auto text-gray-300" />
    )}
  </td>
);

const getInitialRoleId = (user, rolesList) => (
  user.role?._id ||
  rolesList.find((role) => role.name === user.role?.name)?._id ||
  ""
);

const UserDetailModal = ({
  user,
  onClose,
  rolesList,
  onAction,
  onRefresh,
  canWriteAccounts = false,
  canWriteRoles = false,
}) => {
  const [accountForm, setAccountForm] = useState({
    username: user.username || "",
    password: "",
    roleId: getInitialRoleId(user, rolesList),
    isActive: user.isActive !== false,
  });
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);
  const selectedRoleObj = useMemo(
    () => rolesList.find((role) => role._id === accountForm.roleId) || user.role,
    [accountForm.roleId, rolesList, user.role],
  );
  const permissionRows = useMemo(
    () => buildPermissionRows(selectedRoleObj?.permissions || []),
    [selectedRoleObj],
  );

  // Helper format ngày
  const formatDate = (date) =>
    date ? new Date(date).toLocaleString("vi-VN") : "--";

  // Helper Avatar (Logic yêu cầu 1)
  const renderAvatar = () => {
    if (
      user.employee?.avatar &&
      user.employee.avatar !== "default-avatar.jpg"
    ) {
      return (
        <img
          src={user.employee.avatar}
          className="w-full h-full object-cover"
          alt="avatar"
        />
      );
    }
    // Lấy chữ cái đầu của username hoặc fullname
    const name = user.employee?.fullName || user.username || "U";
    return name.charAt(0).toUpperCase();
  };

  const handleAccountFieldChange = (field, value) => {
    setAccountForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateAccount = async () => {
    if (!canWriteAccounts) {
      toast.error("Bạn cần quyền WRITE_ACCOUNTS để thay đổi tài khoản");
      return;
    }
    const username = accountForm.username.trim();
    if (!username) {
      toast.error("Tên đăng nhập không được để trống");
      return;
    }
    if (accountForm.password && accountForm.password.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    const payload = {
      username,
      isActive: accountForm.isActive,
    };
    const currentRoleId = getInitialRoleId(user, rolesList);
    const roleChanged = accountForm.roleId !== currentRoleId;

    if (roleChanged) {
      if (!canWriteRoles) {
        toast.error("Bạn cần quyền WRITE_ROLES để thay đổi vai trò");
        return;
      }

      const selectedRoleObj = rolesList.find((r) => r._id === accountForm.roleId);
      const roleName = selectedRoleObj?.name;

      if (!roleName) {
        toast.error("Không tìm thấy vai trò");
        return;
      }

      payload.roleName = roleName;
    }
    if (accountForm.password) payload.password = accountForm.password;

    setIsUpdatingAccount(true);
    try {
      await accountApi.update(user._id, payload);
      toast.success("Cập nhật tài khoản thành công");
      onRefresh();
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật tài khoản:", error);
      toast.error(error.response?.data?.message || "Cập nhật tài khoản thất bại");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-start bg-gray-50">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow overflow-hidden">
              {renderAvatar()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {user.employee?.fullName || user.username}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {user.email || user.employee?.workEmail || "Chưa có email"}
              </p>
              <div className="flex gap-2">
                <StatusBadge status={user.isActive ? "Active" : "Locked"} />
                <span className="text-[10px] px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-bold uppercase flex items-center">
                  <Shield size={10} className="mr-1" /> {user.role?.name}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-red-500" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard label="Mã nhân viên" value={formatEmployeeCode(user.employee?.employeeCode)} />
            <InfoCard
              label="Phòng ban"
              value={user.employee?.department?.name}
            />
            <InfoCard label="Ngày tạo" value={formatDate(user.createdAt)} />
            <InfoCard label="Đăng nhập lần cuối" value={formatDate(user.lastLogin)} />
          </div>

          {/* Quick Actions */}
          {canWriteAccounts && (
            <div className="flex gap-4">
              <Button
                variant="secondary"
                className="flex-1 justify-center border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={() => {
                  onClose();
                  onAction("reset", user);
                }}
              >
                <RefreshCcw size={16} className="mr-2" /> Đặt lại mật khẩu
              </Button>
              <Button
                variant="secondary"
                className={`flex-1 justify-center ${user.isActive
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                onClick={() => {
                  onClose();
                  onAction("toggle_status", user);
                }}
              >
                {user.isActive ? (
                  <>
                    <Lock size={16} className="mr-2" /> Khóa tài khoản
                  </>
                ) : (
                  <>
                    <Unlock size={16} className="mr-2" /> Mở khóa
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Account & Permissions Section */}
          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-blue-600" /> Tài khoản & phân quyền
            </h3>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1 font-semibold">
                  Tên đăng nhập
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  value={accountForm.username}
                  onChange={(e) => handleAccountFieldChange("username", e.target.value)}
                  disabled={!canWriteAccounts || isUpdatingAccount}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1 font-semibold">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Key size={15} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded-lg py-2.5 pl-9 pr-3 bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    value={accountForm.password}
                    onChange={(e) => handleAccountFieldChange("password", e.target.value)}
                    disabled={!canWriteAccounts || isUpdatingAccount}
                    placeholder="Để trống nếu không đổi"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1 font-semibold">
                  Vai trò hiện tại
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={accountForm.roleId}
                  onChange={(e) => handleAccountFieldChange("roleId", e.target.value)}
                  disabled={!canWriteAccounts || !canWriteRoles || isUpdatingAccount}
                  title={canWriteRoles ? "Vai trò" : "Cần quyền WRITE_ROLES"}
                >
                  {rolesList.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase block mb-1 font-semibold">
                  Trạng thái
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                  value={accountForm.isActive ? "active" : "locked"}
                  onChange={(e) => handleAccountFieldChange("isActive", e.target.value === "active")}
                  disabled={!canWriteAccounts || isUpdatingAccount}
                >
                  <option value="active">Hoạt động</option>
                  <option value="locked">Đã khóa</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end">
              <Button
                onClick={handleUpdateAccount}
                disabled={!canWriteAccounts || isUpdatingAccount}
                className="min-w-32 justify-center"
              >
                {isUpdatingAccount ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Save size={16} className="mr-2" /> Lưu tài khoản
                  </>
                )}
              </Button>
              </div>
            </div>

            {/* Read-only Permission Matrix */}
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Module</th>
                    {permissionActionColumns.map((column) => (
                      <th key={column.key} className="px-4 py-3 text-center">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y text-gray-600">
                  {permissionRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={permissionActionColumns.length + 1}
                        className="px-4 py-6 text-center text-gray-400"
                      >
                        Vai trò này chưa có quyền nào.
                      </td>
                    </tr>
                  ) : (
                    permissionRows.map((row) => (
                      <tr key={row.key}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-700">
                            {row.label}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {row.key}
                          </div>
                        </td>
                        {permissionActionColumns.map((column) => (
                          <PermissionCell
                            key={column.key}
                            items={row.actions[column.key]}
                          />
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="p-2 bg-yellow-50 text-xs text-yellow-700 text-center italic">
                * Bảng này hiển thị quyền thật của vai trò đang chọn. Muốn sửa
                quyền, vào Cài đặt hệ thống &gt; Vai trò &amp; quyền.
              </div>
            </div>
          </div>

          {/* Security Logs (Mock) */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Activity size={18} className="text-orange-500" /> Nhật ký hoạt
              động
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              {[
                {
                  action: "Đăng nhập thành công",
                  ip: "192.168.1.15",
                  time: "Vừa xong",
                  icon: <LogIn size={14} />,
                  color: "text-green-600 bg-green-50",
                },
                {
                  action: "Đổi mật khẩu",
                  ip: "113.22.11.2",
                  time: "2 ngày trước",
                  icon: <Shield size={14} />,
                  color: "text-orange-600 bg-orange-50",
                },
              ].map((log, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 border-b last:border-0 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${log.color}`}>
                      {log.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.ip}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {log.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }) => (
  <div className="p-4 bg-white rounded-lg border shadow-sm">
    <p className="text-xs text-gray-400 uppercase mb-1">{label}</p>
    <p className="font-bold text-gray-800 text-sm break-words">
      {value || "---"}
    </p>
  </div>
);

export default UserDetailModal;
