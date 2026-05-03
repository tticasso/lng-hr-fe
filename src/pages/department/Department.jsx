import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Edit,
  Eye,
  Info,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

import { departmentApi } from "../../apis/departmentApi";
import { employeeApi } from "../../apis/employeeApi";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { toast } from "react-toastify";

const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    deptCode: "",
    manager: "",
  });

  const role = useMemo(() => {
    const raw = localStorage.getItem("role");
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }, []);

  const canManage = useMemo(
    () => role === "ADMIN" || role === "HR" || role === "MANAGER",
    [role],
  );

  const fetchEmployees = async () => {
    try {
      const res = await employeeApi.getAll();
      setEmployees(res.data?.data || []);
    } catch (error) {
      console.error("EMPLOYEE ERROR:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentApi.getAll();
      setDepartments(res.data?.data || []);
    } catch (error) {
      console.error("DEPARTMENT ERROR:", error);
      toast.error("Không thể tải dữ liệu phòng ban");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const filteredDepartments = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return departments;
    return departments.filter(
      (dept) =>
        dept.name?.toLowerCase().includes(search) ||
        dept.deptCode?.toLowerCase().includes(search),
    );
  }, [departments, searchTerm]);

  const handleResetFilter = () => setSearchTerm("");

  const handleViewDetail = async (deptId) => {
    try {
      setLoadingDetail(true);
      setIsDetailModalOpen(true);
      const res = await departmentApi.getById(deptId);
      setSelectedDepartment(res.data?.data || res.data);
    } catch (error) {
      console.error("Error fetching department detail:", error);
      toast.error("Không thể tải chi tiết phòng ban");
      setIsDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({ name: "", deptCode: "", manager: "" });
    setIsFormModalOpen(true);
  };

  const handleEdit = (dept) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name || "",
      deptCode: dept.deptCode || "",
      manager: dept.manager?._id || "",
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.deptCode.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      deptCode: formData.deptCode.trim(),
      manager: formData.manager || null,
    };

    try {
      if (editingDepartment) {
        await departmentApi.update(editingDepartment._id, payload);
        toast.success("Cập nhật phòng ban thành công");
      } else {
        await departmentApi.create(payload);
        toast.success("Thêm phòng ban thành công");
      }
      setIsFormModalOpen(false);
      await fetchDepartments();
    } catch (error) {
      console.error("Error saving department:", error);
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (dept) => {
    if (!window.confirm(`Bạn có chắc muốn xóa phòng ban "${dept.name}"?`)) return;

    try {
      await departmentApi.delete(dept._id);
      toast.success("Xóa phòng ban thành công");
      await fetchDepartments();
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("Không thể xóa phòng ban");
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col gap-6">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý phòng ban</h1>
          <p className="mt-1 text-sm text-gray-500">Danh sách các phòng ban trong công ty</p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              onClick={handleAdd}
              className="bg-blue-600 text-white hover:bg-blue-700"
              title="Thêm phòng ban"
            >
              <Plus size={18} />
            </Button>
          )}
          <Button onClick={fetchDepartments} variant="secondary" title="Làm mới">
            <RotateCcw size={16} />
          </Button>
        </div>
      </div>

      <Card className="shrink-0 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc mã phòng ban..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={handleResetFilter} variant="secondary" title="Xóa bộ lọc">
            <RotateCcw size={16} />
          </Button>
        </div>
      </Card>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments.length === 0 ? (
              <div className="col-span-full rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                {searchTerm ? "Không tìm thấy phòng ban nào" : "Chưa có phòng ban nào"}
              </div>
            ) : (
              filteredDepartments.map((dept) => (
                <Card key={dept._id} className="p-5 transition-shadow hover:shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-blue-50 p-3">
                        <Building2 size={22} className="text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{dept.name}</h3>
                        <p className="font-mono text-xs text-gray-500">{dept.deptCode}</p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Quản lý</p>
                      {dept.manager ? (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="rounded-full bg-white p-2 text-purple-600 shadow-sm">
                            <User size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-800">{dept.manager.fullName}</p>
                            <p className="font-mono text-xs text-gray-500">{dept.manager.employeeCode}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm italic text-gray-500">Chưa có quản lý</p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                      <div className="flex justify-between gap-2">
                        <span>Tạo: {new Date(dept.createdAt).toLocaleDateString("vi-VN")}</span>
                        <span>Cập nhật: {new Date(dept.updatedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleViewDetail(dept._id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      {canManage && (
                        <>
                          <button
                            onClick={() => handleEdit(dept)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(dept)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
                            title="Xóa phòng ban"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h3 className="font-bold text-gray-800">
                {editingDepartment ? "Sửa phòng ban" : "Thêm phòng ban mới"}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Tên phòng ban <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Phòng IT"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Mã phòng ban <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.deptCode}
                  onChange={(e) => setFormData({ ...formData, deptCode: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: IT"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Người quản lý</label>
                <select
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn người quản lý --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.fullName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Không chọn = chưa có người quản lý</p>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  {editingDepartment ? "Cập nhật" : "Thêm mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
              <h3 className="flex items-center gap-2 font-bold text-gray-800">
                <Info size={20} className="text-blue-600" />
                Chi tiết phòng ban
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center">
                <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Đang tải...</p>
              </div>
            ) : selectedDepartment ? (
              <div className="space-y-6 p-6">
                <div className="flex items-center gap-6 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                  <div className="rounded-2xl bg-blue-500 p-4 text-white shadow-lg">
                    <Building2 size={40} />
                  </div>
                  <div className="flex-1">
                    <h4 className="mb-1 text-2xl font-bold text-gray-800">{selectedDepartment.name}</h4>
                    <p className="font-mono text-sm text-gray-600">Mã phòng ban: {selectedDepartment.deptCode}</p>
                  </div>
                </div>

                {selectedDepartment.manager && (
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <p className="mb-2 flex items-center gap-1 text-xs font-medium uppercase text-purple-700">
                      <User size={12} /> Quản lý phòng ban
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-200">
                        <User size={24} className="text-purple-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{selectedDepartment.manager.fullName}</p>
                        <p className="font-mono text-sm text-gray-600">{selectedDepartment.manager.employeeCode}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Ngày tạo</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(selectedDepartment.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedDepartment.createdAt).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-gray-500">Cập nhật lần cuối</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(selectedDepartment.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selectedDepartment.updatedAt).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>
                    Đóng
                  </Button>
                  {canManage && (
                    <Button
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleEdit(selectedDepartment);
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">Không có dữ liệu</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Department;
