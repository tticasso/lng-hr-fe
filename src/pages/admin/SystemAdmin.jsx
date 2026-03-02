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
} from "lucide-react";
import { roleApi } from "../../apis/roleApi";
import { permissionApi } from "../../apis/permissionApi";
import { toast } from "react-toastify";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button"; // Đảm bảo component này tồn tại

const SystemAdmin = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6 relative">
      {/* --- MODAL TẠO PERMISSION --- */}
      {isCreatingPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Key size={18} className="text-blue-600" /> Thêm quyền hạn mới
              </h3>
              <button
                onClick={() => setIsCreatingPerm(false)}
                className="text-gray-400 hover:text-red-500"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="VD: manage_system"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
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
                  variant="ghost"
                  onClick={() => setIsCreatingPerm(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreatePermission}>Tạo mới</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LEFT COLUMN: ROLE MANAGEMENT --- */}
      <div className="w-full md:w-1/4 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              Vai trò (Roles)
            </h2>
            <button
              onClick={() => setIsCreatingRole(!isCreatingRole)}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition"
              title="Thêm Role mới"
            >
              {isCreatingRole ? <X size={20} /> : <Plus size={20} />}
            </button>
          </div>

          {isCreatingRole && (
            <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Tên vai trò..."
                className="w-full px-3 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleCreateRole}
                className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700"
              >
                <Check size={16} />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {roles.map((role) => (
              <div
                key={role._id}
                onClick={() => setSelectedRole(role)}
                className={`
                  group flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all
                  ${selectedRole?._id === role._id
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 border-gray-100"
                  }
                `}
              >
                <div>
                  <p
                    className={`font-semibold text-sm ${selectedRole?._id === role._id ? "text-blue-700" : "text-gray-700"}`}
                  >
                    {role.name}
                  </p>
                  {/* --- FIX LỖI TẠI ĐÂY: Thêm optional chaining (?.) và fallback || 0 --- */}
                  <p className="text-xs text-gray-400">
                    {role.permissions?.length || 0} quyền hạn
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRole(role._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* --- RIGHT COLUMN: PERMISSION MATRIX --- */}
      <div className="w-full md:w-3/4 flex flex-col gap-4">
        {selectedRole ? (
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  Phân quyền:{" "}
                  <span className="text-blue-600">{selectedRole.name}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý các quyền hạn cho vai trò này .
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm quyền..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {/* --- NÚT TẠO PERMISSION MỚI --- */}
                <button
                  onClick={() => setIsCreatingPerm(true)}
                  className="flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                  title="Tạo quyền mới"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {Object.keys(groupedPermissions).length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  Không tìm thấy quyền hạn nào phù hợp.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {Object.entries(groupedPermissions).map(
                    ([moduleName, perms]) => (
                      <div
                        key={moduleName}
                        className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-white border-b border-gray-200 flex justify-between items-center">
                          <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">
                            {getVietnameseModule(moduleName)}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {perms.length}
                          </span>
                        </div>

                        <div className="p-2 space-y-1">
                          {perms.map((perm) => {
                            const isAssigned = hasPermission(perm._id);
                            return (
                              <label
                                key={perm._id}
                                className={`
                                flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all
                                ${isAssigned ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-100 border border-transparent"}
                              `}
                              >
                                <div className="relative flex items-center mt-0.5">
                                  <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={isAssigned}
                                    onChange={() =>
                                      togglePermission(perm._id, isAssigned)
                                    }
                                  />
                                  <div
                                    className={`
                                  w-5 h-5 border-2 rounded transition-all flex items-center justify-center
                                  ${isAssigned ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}
                                `}
                                  >
                                    {isAssigned && (
                                      <Check size={12} className="text-white" />
                                    )}
                                  </div>
                                </div>

                                <div className="flex-1">
                                  <p
                                    className={`text-sm font-medium ${isAssigned ? "text-blue-800" : "text-gray-700"}`}
                                  >
                                    {getVietnameseName(perm.name)}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {perm.description ||
                                      `Mã quyền: ${perm.name}`}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
            <Lock size={48} className="mb-4 opacity-50" />
            <p className="font-medium">
              Vui lòng chọn một vai trò để phân quyền
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemAdmin;
