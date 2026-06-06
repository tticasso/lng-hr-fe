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
} from "lucide-react";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";
import { accountApi } from "../../apis/accountApi"; // Cần thêm hàm updateRole nếu backend tách riêng, hoặc dùng update chung
import { toast } from "react-toastify";

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

const UserDetailModal = ({ user, onClose, rolesList, onAction, onRefresh, canWriteAccounts = false }) => {
  const [selectedRole, setSelectedRole] = useState(user.role?._id || "");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const selectedRoleObj = useMemo(
    () => rolesList.find((role) => role._id === selectedRole) || user.role,
    [rolesList, selectedRole, user.role],
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

  // Handle Update Role
  const handleUpdateRole = async () => {
    if (!canWriteAccounts) {
      toast.error("Bạn cần quyền CREATE_USER/UPDATE_USER/DELETE_USER để thay đổi tài khoản");
      return;
    }
    if (selectedRole === user.role?._id) return; // Không đổi thì không gọi
    
    // Tìm role object từ selectedRole ID
    const selectedRoleObj = rolesList.find((r) => r._id === selectedRole);
    const roleName = selectedRoleObj?.name;
    
    if (!roleName) {
      toast.error("Không tìm thấy vai trò");
      return;
    }
    
    
    setIsUpdatingRole(true);
    try {
      // Gọi API update với roleName
      const res = await accountApi.updateRole(user._id, roleName);
      toast.success(`Cập nhật vai trò thành công! Vai trò mới: ${roleName}`);
      onRefresh();
      onClose(); // Đóng modal sau khi cập nhật thành công
       
    } catch (error) {
      console.error("Lỗi cập nhật vai trò:", error);
      toast.error("Cập nhật vai trò thất bại");
    } finally {
      setIsUpdatingRole(false);
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
            <InfoCard label="Mã nhân viên" value={user.employee?.employeeCode} />
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

          {/* Role & Permissions Section */}
          <div className="border rounded-lg p-5 bg-white shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-blue-600" /> Phân quyền & Vai
              trò
            </h3>

            {/* Change Role Logic */}
            <div className="mb-6 flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase block mb-1 font-semibold">
                  Vai trò hiện tại
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  disabled={!canWriteAccounts}
                >
                  {rolesList.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleUpdateRole}
                disabled={!canWriteAccounts || selectedRole === user.role?._id || isUpdatingRole}
                className="mb-[1px]"
              >
                {isUpdatingRole ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
              </Button>
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
