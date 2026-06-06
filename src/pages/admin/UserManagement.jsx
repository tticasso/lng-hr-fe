import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { getListData, getPagination, hasPaginationMetadata } from "../../shared/apiResponse";
import { getPermissionNames, hasAnyPermission } from "../../utils/authPermissions";

const USER_PAGE_SIZE = 50;
const MAX_USER_PREFETCH = 500;

const UserManagement = () => {
  // State
  const { user } = useAuth();
  const userInfo = user;
  const permissionNames = getPermissionNames(user);
  const canWriteAccounts = hasAnyPermission(user, ["CREATE_USER", "UPDATE_USER", "DELETE_USER"]);
  const canImportProfiles = permissionNames.includes("WRITE_EMPLOYEES");
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: USER_PAGE_SIZE,
    total: 0,
    totalPages: 1,
    mode: "server",
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
  const normalizeAccountEmployee = (account, employeesByAccount) => {
    const directEmployee = account.employee || account.employeeId;
    if (directEmployee && typeof directEmployee === "object") return directEmployee;
    return employeesByAccount.get(account._id) || null;
  };

  const buildUserParams = useCallback(
    (overrides = {}) => ({
      page: overrides.page ?? 1,
      limit: overrides.limit ?? USER_PAGE_SIZE,
      pageSize: overrides.limit ?? USER_PAGE_SIZE,
      perPage: overrides.limit ?? USER_PAGE_SIZE,
      search: filters.search.trim() || undefined,
      role: filters.role || undefined,
      roleId: filters.role || undefined,
      status: filters.status || undefined,
      isActive:
        filters.status === "Active"
          ? true
          : filters.status === "Locked"
            ? false
            : undefined,
      includeEmployee: true,
      populate: "employee",
    }),
    [filters],
  );

  // --- 1. Init metadata ---
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await roleApi.getAllCached();
        setRolesList(res.data?.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoles();
  }, []);

  // --- 2. Fetch Users (server-side pagination/filter) ---
  const fetchUsers = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = buildUserParams(overrides);
      const accRes = await accountApi.getAll(params);
      let accounts = getListData(accRes);
      const hasServerPagination = hasPaginationMetadata(accRes);
      let pageMeta = getPagination(accRes, {
        page: params.page,
        limit: params.limit,
        total: accounts.length,
      });

      if (
        hasServerPagination &&
        params.page === 1 &&
        pageMeta.totalPages > 1 &&
        pageMeta.total <= MAX_USER_PREFETCH
      ) {
        const restPages = Array.from(
          { length: pageMeta.totalPages - 1 },
          (_, index) => index + 2,
        );
        const restResponses = await Promise.all(
          restPages.map((page) => accountApi.getAll(buildUserParams({ ...overrides, page }))),
        );

        accounts = [
          ...accounts,
          ...restResponses.flatMap((response) => getListData(response)),
        ];
        pageMeta = {
          page: 1,
          limit: params.limit,
          total: accounts.length,
          totalPages: Math.max(1, Math.ceil(accounts.length / params.limit)),
        };
      }

      const accountsMissingEmployee = accounts.filter(
        (acc) => !(acc.employee && typeof acc.employee === "object") &&
          !(acc.employeeId && typeof acc.employeeId === "object"),
      );
      const employeesByAccount = new Map();

      if (accountsMissingEmployee.length > 0) {
        const accountIds = accountsMissingEmployee.map((acc) => acc._id).filter(Boolean);
        if (accountIds.length > 0) {
          try {
            const empRes = await employeeApi.getAll({
              accountIds: accountIds.join(","),
              limit: accountIds.length,
            });
            getListData(empRes).forEach((employee) => {
              const accountId = employee.accountId?._id || employee.accountId;
              if (accountId) employeesByAccount.set(accountId, employee);
            });
          } catch (error) {
            console.error("Cannot load employee mapping for accounts:", error);
          }
        }
      }

      const merged = accounts.map((account) => ({
        ...account,
        employee: normalizeAccountEmployee(account, employeesByAccount),
      }));

      setUsers(merged);
      setPagination({
        ...pageMeta,
        mode:
          hasServerPagination && pageMeta.total > MAX_USER_PREFETCH
            ? "server"
            : "client",
      });
    } catch (error) {
      console.error(error);
      toast.error("L?i t?i d? li?u");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [buildUserParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchUsers({ page: 1 });
    }, filters.search ? 300 : 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchUsers, filters.search]);

  // --- 3. Current page data ---
  const paginatedUsers =
    pagination.mode === "client"
      ? users.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit)
      : users;

  // --- Handlers ---
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    if (pagination.mode === "client") {
      setPagination((prev) => ({ ...prev, page }));
      return;
    }
    fetchUsers({ page });
  };

  const handleConfirmAction = async () => {
    if (!actionData.user) return;
    if (!canWriteAccounts) {
      toast.error("Bạn cần quyền CREATE_USER/UPDATE_USER/DELETE_USER để thay đổi tài khoản");
      setActionData({ type: null, user: null });
      return;
    }
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
        fetchUsers({ page: pagination.page });
        setActionData({ type: null, user: null });
      } else if (actionData.type === "delete") {
        await accountApi.delete(userId);
        toast.success("Xóa tài khoản thành công");
        fetchUsers({ page: pagination.page });
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
    if (!canImportProfiles) {
      toast.error("Bạn không có quyền WRITE_EMPLOYEES để import hồ sơ");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setIsImporting(true);

    try {
      const response = await employeeApi.import_profile(file);

      const message = response.data?.message || "Import thành công!";
      toast.success(message);
      await fetchUsers({ page: pagination.page });
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
  const handleDownloadTemplate = async () => {

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


    const XLSX = await import("xlsx");
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
    toast.success("Đã tải xuống file mẫu!");
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] lg:h-[calc(100vh-100px)] flex flex-col gap-4 lg:gap-6 relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h1>
          <p className="text-sm text-gray-500">
            Quản lý tài khoản ({pagination.total})
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <Button
            variant="secondary"
            className="flex gap-2 items-center w-full sm:w-auto"
            onClick={handleDownloadTemplate}
          >
            <Download size={18} /> Tải mẫu Excel
          </Button>
          <Button
            variant="secondary"
            className="flex gap-2 items-center w-full sm:w-auto"
            onClick={() => {
              fileInputRef.current?.click();
            }}
            disabled={isImporting || !canImportProfiles}
            title={canImportProfiles ? "Import Excel" : "Cần quyền WRITE_EMPLOYEES"}
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
            className="bg-blue-600 text-white flex gap-2 items-center w-full sm:w-auto"
            onClick={() => {
              if (!canWriteAccounts) {
                toast.error("Bạn cần quyền CREATE_USER để tạo tài khoản");
                return;
              }
              setIsCreateOpen(true);
            }}
            disabled={!canWriteAccounts}
            title={canWriteAccounts ? "Tạo tài khoản" : "Cần quyền CREATE_USER/UPDATE_USER/DELETE_USER"}
          >
            <Plus size={18} /> Tạo tài khoản
          </Button>
        </div>
      </div>

      {/* Filter & Table */}
      <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 md:max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm kiếm người dùng..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-3 py-2 text-sm outline-none w-full md:w-auto"
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
          >
            <option value="">Tất cả vai trò</option>
            {rolesList.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            className="border rounded-lg px-3 py-2 text-sm outline-none w-full md:w-auto"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Locked">Đã khóa</option>
          </select>
          <Button variant="secondary" className="px-3" onClick={() => fetchUsers({ page: pagination.page })}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm border-collapse">
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
                      {canWriteAccounts && (
                        <>
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
                        </>
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
          <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{" "}
              {pagination.total} người dùng
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => handlePageChange(pagination.page - 1)}
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
                        onClick={() => handlePageChange(p)}
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
                onClick={() => handlePageChange(pagination.page + 1)}
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
      {canWriteAccounts && isCreateOpen && (
        <CreateAccountModal
          onClose={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            fetchUsers({ page: pagination.page });
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
          canWriteAccounts={canWriteAccounts}
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

