import React, { useState, useEffect, useRef } from "react";
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
  Upload,
} from "lucide-react";
import * as XLSX from "xlsx";

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
  const [allUsers, setAllUsers] = useState([]); // Lưu toàn bộ data gốc
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

  // Import Excel
  const fileInputRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  const formatDate = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
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
    fetchUsers(); // Gọi fetch users khi mount
  }, []);

  // --- 2. Fetch Users (Chỉ gọi 1 lần khi mount) ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Parallel Fetch: Accounts + Employees
      const [accRes, empRes] = await Promise.all([
        accountApi.getAll({ limit: 1000 }), // Lấy tất cả
        employeeApi.getAll({ limit: 1000 }), // Lấy cache employee để map
      ]);

      const accounts = accRes.data?.data || [];
      const employees = empRes.data?.data || [];

      // Merge Data Logic
      const merged = accounts.map((acc) => {
        // Tìm employee có account._id trùng với acc._id
        const emp = employees.find((e) => e.accountId?._id === acc._id);
        return { ...acc, employee: emp };

      });
      console.log('ID USER :', merged)
      console.log("user management, merged: ", merged);
      setAllUsers(merged); // Lưu data gốc
      setUsers(merged); // Hiển thị ban đầu
      setPagination((prev) => ({
        ...prev,
        total: merged.length,
        totalPages: Math.ceil(merged.length / prev.limit) || 1,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Local Filter Logic ---
  useEffect(() => {
    let filtered = [...allUsers];

    // Filter by search (username, fullName, email, employeeCode)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((user) => {
        const username = user.username?.toLowerCase() || "";
        const fullName = user.employee?.fullName?.toLowerCase() || "";
        const email = (user.email || user.employee?.workEmail || user.employee?.personalEmail || "").toLowerCase();
        const empCode = user.employee?.employeeCode?.toLowerCase() || "";

        return (
          username.includes(searchLower) ||
          fullName.includes(searchLower) ||
          email.includes(searchLower) ||
          empCode.includes(searchLower)
        );
      });
    }

    // Filter by role
    if (filters.role) {
      filtered = filtered.filter((user) => user.role?._id === filters.role);
    }

    // Filter by status
    if (filters.status === "Active") {
      filtered = filtered.filter((user) => user.isActive === true);
    } else if (filters.status === "Locked") {
      filtered = filtered.filter((user) => user.isActive === false);
    }

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      page: 1, // Reset về trang 1 khi filter
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.limit) || 1,
    }));

    setUsers(filtered);
  }, [filters, allUsers]);

  // --- 4. Paginated Data ---
  const paginatedUsers = users.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

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

  // Handler Import Excel
  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("📤 Uploading:", file);
    console.log("📤 Uploading file:", file.name);
    setIsImporting(true);

    try {
      const response = await employeeApi.import_profile(file);
      console.log("✅ Response:", response);

      const message = response.data?.message || "Import thành công!";
      toast.success(message);
      await fetchUsers();
    } catch (error) {
      console.error("❌ Error:", error);
      const errorMessage = error.response?.data?.message || "Lỗi khi import file!";
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handler Download Template
  const handleDownloadTemplate = () => {
    console.log("📥 Download Template button clicked");
    console.log("Available roles for template:", rolesList);

    const template = [
      {
        username: "user001",
        password: "Password123",
        email: "user001@example.com",
        role: rolesList[0]?.name || "Employee",
        isActive: true,
      },
      {
        username: "user002",
        password: "Password456",
        email: "user002@example.com",
        role: rolesList[0]?.name || "Employee",
        isActive: true,
      },
    ];

    console.log("Template data:", template);

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 15 }, // username
      { wch: 15 }, // password
      { wch: 25 }, // email
      { wch: 15 }, // role
      { wch: 10 }, // isActive
    ];

    XLSX.writeFile(workbook, "user_import_template.xlsx");
    console.log("✅ Template file downloaded: user_import_template.xlsx");
    toast.success("Đã tải xuống file mẫu!");
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500">
            Quản lý tài khoản ({pagination.total})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex gap-2 items-center"
            onClick={handleDownloadTemplate}
          >
            <Download size={18} /> Tải mẫu Excel
          </Button>
          <Button
            variant="secondary"
            className="flex gap-2 items-center"
            onClick={() => {
              console.log("🔘 Import Excel button clicked");
              console.log("Available roles:", rolesList);
              fileInputRef.current?.click();
            }}
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Đang import...
              </>
            ) : (
              <>
                <Upload size={18} /> Import Excel
              </>
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImportExcel}
            className="hidden"
          />
          <Button
            className="bg-blue-600 text-white flex gap-2 items-center"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus size={18} /> Tạo tài khoản
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
              placeholder="Tìm kiếm người dùng..."
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>
          <select
            className="border rounded-lg px-3 text-sm outline-none"
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          >
            <option value="">Tất cả vai trò</option>
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
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Locked">Đã khóa</option>
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
                <th className="p-4">Thông tin người dùng</th>
                <th className="p-4">Tên đăng nhập</th>
                <th className="p-4">Email</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Đăng nhập lần cuối</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y bg-white">
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="hover:bg-blue-50/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 border overflow-hidden shrink-0">
                        {renderAvatarTable(user)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
                          {user.employee?.fullName}
                          {user.employee?.accountId?._id ===
                            userInfo?.accountId?._id ? (
                            <span className="text-[10px] pl-1 text-gray-500 italic font-extralight">
                              (bạn)
                            </span>
                          ) : (
                            ""
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.employee?.employeeCode || "Chưa có mã"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="p-4 text-xs text-gray-500">
                          {user.username}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Cột Email: Ưu tiên email account (nếu có update sau này) -> workEmail -> personalEmail */}
                  <td className="p-4 text-xs text-gray-500">
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
                  <td className="p-4 text-xs text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setActionData({ type: "reset", user })}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded"
                        title="Đặt lại mật khẩu"
                      >
                        <RefreshCcw size={16} />
                      </button>
                      <button
                        onClick={() =>
                          setActionData({ type: "toggle_status", user })
                        }
                        className={`p-1.5 rounded ${!user.isActive ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}
                        title={!user.isActive ? "Mở khóa" : "Khóa tài khoản"}
                      >
                        {!user.isActive ? (
                          <Unlock size={16} />
                        ) : (
                          <Lock size={16} />
                        )}
                      </button>
                      {user.employee?.id !== userInfo?.id ? (
                        <button
                          onClick={() =>
                            setActionData({ type: "delete", user })
                          }
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          disabled={true}
                          className="p-1.5 text-gray-400 cursor-not-allowed"
                          title="Không thể xóa chính mình"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{" "}
              {pagination.total} người dùng
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
                className="px-3 py-1 text-sm"
              >
                Trước
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Hiển thị: trang đầu, trang cuối, và 2 trang xung quanh trang hiện tại
                    return (
                      p === 1 ||
                      p === pagination.totalPages ||
                      Math.abs(p - pagination.page) <= 1
                    );
                  })
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-2 py-1 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: p }))
                        }
                        className={`px-3 py-1 text-sm rounded ${pagination.page === p
                            ? "bg-blue-600 text-white"
                            : "bg-white border hover:bg-gray-100"
                          }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 text-sm"
              >
                Sau
              </Button>
            </div>
          </div>
        )}
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
