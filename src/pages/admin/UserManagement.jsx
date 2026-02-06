import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  Download,
  Lock,
  Unlock,
  RefreshCcw,
  Loader2,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { toast } from "react-toastify";

// API
import { accountApi } from "../../apis/accountApi";
import { roleApi } from "../../apis/roleApi";
import { employeeApi } from "../../apis/employeeApi";

// Modals Components
import CreateAccountModal from "../../components/modals/CreateAccountModal";
import UserDetailModal from "../../components/modals/UserDetailModal";
import ActionModal from "../../components/modals/ActionModal";
import { useAuth } from "../../context/AuthContext";

const UserManagement = () => {
  // State
  const { user } = useAuth();
  const userInfo = user;
  console.log("userManagement, user: ", user);
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({ search: "", role: "", status: "" });

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // Cho detail modal

  // Action Modal State
  const [actionData, setActionData] = useState({ type: null, user: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [newPasswordResult, setNewPasswordResult] = useState(null); // Lưu pass sau reset

  // --- 1. Init Data ---
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await roleApi.getAll();
        setRolesList(res.data?.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoles();
  }, []);

  // --- 2. Fetch Users ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
      };
      if (filters.status === "Active") params.isActive = true;
      if (filters.status === "Locked") params.isActive = false;

      // Parallel Fetch: Accounts + Employees
      const [accRes, empRes] = await Promise.all([
        accountApi.getAll(params),
        employeeApi.getAll({ limit: 1000 }), // Lấy cache employee để map
      ]);

      const accounts = accRes.data?.data || [];
      const employees = empRes.data?.data || [];

      // Merge Data Logic
      const merged = accounts.map((acc) => {
        // Tìm employee có account._id trùng với acc._id
        const emp = employees.find((e) => e.account?._id === acc._id);
        return { ...acc, employee: emp };
      });
      console.log("user management, merged:", merged);
      setUsers(merged);
      setPagination((prev) => ({
        ...prev,
        total: accRes.data?.results || 0,
        totalPages: Math.ceil((accRes.data?.results || 0) / prev.limit) || 1,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [filters, pagination.page]);

  // --- Handlers ---
  const handleConfirmAction = async () => {
    if (!actionData.user) return;
    setIsProcessing(true);
    const userId = actionData.user._id;

    try {
      if (actionData.type === "reset") {
        const res = await accountApi.resetPassword(userId);
        setNewPasswordResult(res.data?.data); // Show pass modal
        // Không đóng actionData ngay, để render modal kết quả
      } else if (actionData.type === "toggle_status") {
        await accountApi.update(userId, {
          isActive: !actionData.user.isActive,
        });
        toast.success("Cập nhật trạng thái thành công");
        fetchUsers();
        setActionData({ type: null, user: null });
      } else if (actionData.type === "delete") {
        await accountApi.delete(userId);
        toast.success("Xóa tài khoản thành công");
        fetchUsers();
        setActionData({ type: null, user: null });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
      setActionData({ type: null, user: null });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper Avatar (Logic yêu cầu 1)
  const renderAvatarTable = (user) => {
    if (
      user.employee?.avatar &&
      user.employee.avatar !== "default-avatar.jpg"
    ) {
      return (
        <img
          src={user.employee.avatar}
          className="w-full h-full object-cover"
          alt="avt"
        />
      );
    }
    const name = user.employee?.fullName || user.username || "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">
            Quản lý tài khoản ({pagination.total})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex gap-2 items-center">
            <Download size={18} /> Export
          </Button>
          <Button
            className="bg-blue-600 text-white flex gap-2 items-center"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={18} /> Create Account
          </Button>
        </div>
      </div>

      {/* Filter & Table */}
      <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-50 border-b flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search user..."
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <select
            className="border rounded-lg px-3 text-sm outline-none"
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">All Roles</option>
            {rolesList.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 text-sm outline-none"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Locked">Locked</option>
          </select>
          <Button variant="secondary" className="px-3" onClick={fetchUsers}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white border-b text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
              <tr>
                <th className="p-4">User Info</th>
                <th className="p-4">Username</th>
                <th className="p-4">Email</th> {/* Yêu cầu 2: Cột Email */}
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border overflow-hidden shrink-0">
                        {renderAvatarTable(user)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {user.employee.fullName}
                          {user.employee.id === userInfo.id ? (
                            <span className="text-[10px] pl-1 text-gray-500 italic font-extralight">
                              (you)
                            </span>
                          ) : (
                            ""
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.employee?.employeeCode || "No Code"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className=" text-gray-800">{user.username}</p>
                      </div>
                    </div>
                  </td>
                  {/* Cột Email: Ưu tiên email account (nếu có update sau này) -> workEmail -> personalEmail */}
                  <td className="p-4 text-gray-600">
                    {user.email ||
                      user.employee?.workEmail ||
                      user.employee?.personalEmail ||
                      "--"}
                  </td>

                  <td className="p-4">
                    <span className="text-[10px] px-2 py-0.5 rounded border font-bold uppercase bg-gray-100 text-gray-600 border-gray-200">
                      {user.role?.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={user.isActive ? "Active" : "Locked"} />
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Detail"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setActionData({ type: "reset", user })}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"
                        title="Reset Pass"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setActionData({ type: "toggle_status", user })
                        }
                        className={`p-1.5 rounded ${!user.isActive ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}
                      >
                        {!user.isActive ? (
                          <Unlock size={16} />
                        ) : (
                          <Lock size={16} />
                        )}
                      </button>
                      {user.employee.id !== userInfo.id ? (
                        <button
                          onClick={() =>
                            setActionData({ type: "delete", user })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          disabled={true}
                          className="p-1.5 text-gray-400 cursor-not-allowed"
                        >
                          <Trash2 size={16} disabled />
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

      {/* --- MODALS --- */}

      {/* 1. Create Account */}
      {isCreateOpen && (
        <CreateAccountModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchUsers();
          }}
          rolesList={rolesList}
        />
      )}

      {/* 2. User Detail */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          rolesList={rolesList}
          onClose={() => setSelectedUser(null)}
          onRefresh={fetchUsers}
          onAction={(type, user) => setActionData({ type, user })}
        />
      )}

      {/* 3. Actions & Password Result */}
      {(actionData.type || newPasswordResult) && (
        <ActionModal
          type={actionData.type}
          user={actionData.user}
          newPassword={newPasswordResult}
          processing={isProcessing}
          onClose={() => {
            setActionData({ type: null, user: null });
            setNewPasswordResult(null);
          }}
          onConfirm={handleConfirmAction}
        />
      )}
    </div>
  );
};

export default UserManagement;
