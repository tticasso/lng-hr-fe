import React, { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Lock,
  Unlock,
  RefreshCcw,
  X,
  CheckCircle2,
  Shield,
  AlertTriangle,
  Mail,
  User,
  Clock,
  LogIn,
  Activity,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const nevigate = useNavigate();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // State cho các Action Modals
  const [actionModal, setActionModal] = useState({ type: null, user: null }); // type: 'reset', 'toggle_status', 'delete'

  // --- MOCK DATA: USER LIST ---
  const users = [
    {
      id: "EMP089",
      name: "Nguyễn Văn An",
      email: "an.nguyen@company.com",
      dept: "Product",
      role: "Leader",
      status: "Active",
      lastLogin: "09:30 - 09/12/2025",
      avatar: "NA",
    },
    {
      id: "EMP090",
      name: "Lê Thị Hoa",
      email: "hoa.le@company.com",
      dept: "HR Admin",
      role: "HR",
      status: "Active",
      lastLogin: "08:15 - 09/12/2025",
      avatar: "LH",
    },
    {
      id: "EMP091",
      name: "Phạm Văn Dũng",
      email: "dung.pham@company.com",
      dept: "Sales",
      role: "Employee",
      status: "Inactive",
      lastLogin: "15:00 - 01/11/2025",
      avatar: "PD",
    },
    {
      id: "SYS001",
      name: "System Admin",
      email: "admin@company.com",
      dept: "IT",
      role: "Admin",
      status: "Active",
      lastLogin: "Just now",
      avatar: "SA",
    },
    {
      id: "EMP102",
      name: "Trần Văn F",
      email: "f.tran@company.com",
      dept: "Marketing",
      role: "Employee",
      status: "Locked",
      lastLogin: "10:00 - 08/12/2025",
      avatar: "TF",
    },
  ];

  // --- MOCK DATA: SECURITY LOGS (Cho Detail Panel) ---
  const securityLogs = [
    {
      type: "Login",
      status: "Success",
      time: "09:30 AM - Today",
      ip: "192.168.1.10",
    },
    {
      type: "Password",
      status: "Changed",
      time: "10:00 AM - Yesterday",
      ip: "192.168.1.10",
    },
    {
      type: "Login",
      status: "Failed",
      time: "09:55 AM - Yesterday",
      ip: "14.232.11.5",
    },
    {
      type: "Role",
      status: "Updated",
      time: "01/12/2025",
      desc: "Changed from Employee to Leader",
    },
  ];

  // Helper: Role Badge Color
  const getRoleStyle = (role) => {
    switch (role) {
      case "Admin":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "HR":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Leader":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  // Handler mở detail
  const handleViewDetail = (user) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 relative">
      {/* --- 1. HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">
            Quản lý tài khoản người dùng, phân quyền truy cập và trạng thái hệ
            thống.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} /> Export List
          </Button>
          <Button
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 text-white"
            onClick={() => nevigate("/register")}
          >
            <Plus size={18} /> Create User
          </Button>
        </div>
      </div>

      {/* --- 2. FILTERS & TABLE --- */}
      <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative max-w-md w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                className="pl-9 pr-4 py-2 w-full bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[120px] focus:border-blue-500 outline-none">
              <option>All Roles</option>
              <option>Admin</option>
              <option>HR</option>
              <option>Leader</option>
            </select>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[120px] focus:border-blue-500 outline-none">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Locked</option>
            </select>
            <select className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg p-2 min-w-[120px] focus:border-blue-500 outline-none">
              <option>Department</option>
              <option>Product</option>
              <option>Sales</option>
            </select>
            <Button variant="secondary" className="px-3">
              <Filter size={16} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4">User Info</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={`
                        group transition-colors 
                        ${
                          user.status === "Inactive"
                            ? "bg-gray-50 opacity-70"
                            : "hover:bg-blue-50/50"
                        }
                      `}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border border-white shadow-sm">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-gray-500 text-xs">
                    {user.id}
                  </td>
                  <td className="p-4 text-gray-600">{user.dept}</td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase ${getRoleStyle(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {user.lastLogin}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2 transition-opacity">
                      <button
                        onClick={() => handleViewDetail(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                        title="View Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setActionModal({ type: "reset", user: user })
                        }
                        className="p-1.5 text-orange-500 hover:bg-orange-100 rounded"
                        title="Reset Password"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      {user.status === "Active" ? (
                        <button
                          onClick={() =>
                            setActionModal({
                              type: "toggle_status",
                              user: user,
                            })
                          }
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded"
                          title="Lock Account"
                        >
                          <Lock size={16} />
                        </button>
                      ) : (
                        <button
                          className="p-1.5 text-green-500 hover:bg-green-100 rounded"
                          title="Unlock"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- 3. SLIDE-OVER: USER DETAIL PANEL --- */}
      {isDetailOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-[1px]"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-sm">
                  {selectedUser.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    {selectedUser.email}
                  </p>
                  <div className="flex gap-2">
                    <StatusBadge status={selectedUser.status} />
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase flex items-center ${getRoleStyle(
                        selectedUser.role
                      )}`}
                    >
                      <Shield size={10} className="mr-1" /> {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Basic Info & Actions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    Employee ID
                  </p>
                  <p className="font-mono font-bold text-gray-800">
                    {selectedUser.id}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    Department
                  </p>
                  <p className="font-bold text-gray-800">{selectedUser.dept}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    Created At
                  </p>
                  <p className="text-sm text-gray-800">15/03/2022</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    Last Login
                  </p>
                  <p className="text-sm text-gray-800">
                    {selectedUser.lastLogin}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <RefreshCcw size={16} className="mr-2" /> Reset Password
                </Button>
                {selectedUser.status === "Active" ? (
                  <Button
                    variant="secondary"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Lock size={16} className="mr-2" /> Deactivate User
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <Unlock size={16} className="mr-2" /> Activate User
                  </Button>
                )}
              </div>

              {/* Permissions Matrix */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-blue-500" /> Roles &
                  Permissions
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Role
                    </label>
                    <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>{selectedUser.role}</option>
                      <option>Employee</option>
                      <option>Leader</option>
                      <option>HR</option>
                      <option>Admin</option>
                    </select>
                  </div>

                  {/* Matrix Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2">Module Access</th>
                          <th className="px-3 py-2 text-center">View</th>
                          <th className="px-3 py-2 text-center">Edit</th>
                          <th className="px-3 py-2 text-center">Delete</th>
                          <th className="px-3 py-2 text-center">Approve</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {[
                          "Personal Workspace",
                          "HR Management",
                          "Payroll & C&B",
                          "System Admin",
                        ].map((mod, i) => (
                          <tr key={i}>
                            <td className="px-3 py-2 font-medium text-gray-700">
                              {mod}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={true}
                                readOnly
                                className="rounded text-blue-600"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedUser.role !== "Employee"}
                                readOnly
                                className="rounded text-blue-600"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={selectedUser.role === "Admin"}
                                readOnly
                                className="rounded text-blue-600"
                              />
                            </td>
                            <td className="px-3 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={
                                  selectedUser.role === "Leader" ||
                                  selectedUser.role === "Admin"
                                }
                                readOnly
                                className="rounded text-blue-600"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Security Logs */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-orange-500" /> Security
                  Logs
                </h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  {securityLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-full ${
                            log.status === "Success" || log.status === "Updated"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {log.type === "Login" ? (
                            <LogIn size={12} />
                          ) : (
                            <Shield size={12} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {log.type} {log.status}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.ip || log.desc}
                          </p>
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
      )}

      {/* --- 4. MODAL: CREATE NEW USER --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Create New User</h3>
              <button onClick={() => setIsCreateModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nguyen Van A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="EMP..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Login)
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="email@company.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Developer</option>
                    <option>Sales</option>
                    <option>Customer Service</option>
                    <option>HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Employee</option>
                    <option>Leader</option>
                    <option>HR</option>
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 flex gap-2">
                <Mail size={16} className="shrink-0" />
                Mật khẩu khởi tạo sẽ được gửi tự động đến email của người dùng.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Button
                variant="secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- 5. ACTION CONFIRMATION POPUPS --- */}
      {actionModal.type && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 text-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 
                  ${
                    actionModal.type === "delete"
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                  }
               `}
            >
              {actionModal.type === "reset" && <RefreshCcw size={24} />}
              {actionModal.type === "toggle_status" && <Lock size={24} />}
              {actionModal.type === "delete" && <Trash2 size={24} />}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {actionModal.type === "reset" && "Reset Password?"}
              {actionModal.type === "toggle_status" &&
                (actionModal.user.status === "Active"
                  ? "Deactivate User?"
                  : "Activate User?")}
              {actionModal.type === "delete" && "Delete User Account?"}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              {actionModal.type === "reset" &&
                `Are you sure you want to reset password for ${actionModal.user.name}? They will receive a new password via email.`}
              {actionModal.type === "toggle_status" &&
                `User ${actionModal.user.name} will ${
                  actionModal.user.status === "Active"
                    ? "not be able to login"
                    : "be able to login again"
                }.`}
              {actionModal.type === "delete" &&
                `This action cannot be undone. All data related to ${actionModal.user.name} will be archived.`}
            </p>

            <div className="flex gap-3 justify-center">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setActionModal({ type: null, user: null })}
              >
                Cancel
              </Button>
              <Button
                className={`w-full text-white 
                     ${
                       actionModal.type === "delete"
                         ? "bg-red-600 hover:bg-red-700"
                         : "bg-blue-600 hover:bg-blue-700"
                     }
                  `}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
