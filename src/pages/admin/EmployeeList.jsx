import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Edit,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Filter,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { employeeApi } from "../../apis/employeeApi";
import { toast } from "react-toastify";

// Import Modal vừa tạo
import EditEmployeeModal from "../../components/modals/EditEmployeeModal";

const EmployeeList = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  });

  // --- FETCH DATA ---
  const fetchEmployees = async () => {
    try {
      setLoading(true);

      const cleanParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (filters.search.trim()) cleanParams.search = filters.search.trim();
      if (filters.department) cleanParams.department = filters.department;
      if (filters.status) cleanParams.status = filters.status;

      const res = await employeeApi.getAll(cleanParams);

      const responseBody = res.data || {};
      const listData = Array.isArray(responseBody)
        ? responseBody
        : responseBody.data || [];

      if (Array.isArray(listData)) {
        setEmployees(listData);
      } else {
        setEmployees([]);
      }

      setPagination((prev) => ({
        ...prev,
        page: responseBody.currentPage || prev.page,
        total: responseBody.total || listData.length || 0,
        totalPages: responseBody.totalPages || 1,
      }));
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      if (error.response?.status !== 500) {
        toast.error("Không thể tải danh sách nhân viên.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [pagination.page, pagination.limit, filters]);

  // --- HANDLERS ---
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleOpenEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  // Helper Render Pagination
  const renderPaginationNumbers = () => {
    const pages = [];
    const { page, totalPages } = pagination;

    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages.map((p, index) => (
      <button
        key={index}
        onClick={() => typeof p === "number" && handlePageChange(p)}
        disabled={p === "..."}
        className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors
                ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : p === "..."
                      ? "bg-transparent text-gray-500 cursor-default"
                      : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
      >
        {p}
      </button>
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6 relative">
      {/* --- EDIT MODAL (Imported Component) --- */}
      {isEditModalOpen && selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Directory
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý hồ sơ nhân sự ({pagination.total} bản ghi)
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} /> Xuất Excel
          </Button>
        </div>
      </div>

      {/* TOOLBAR */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Tìm kiếm nhân viên..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Department Filter (Có thể áp dụng API tương tự modal nếu cần) */}
            <div className="relative">
              <Filter
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[160px]"
              >
                <option value="">Phòng ban (Tất cả)</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]"
            >
              <option value="">Trạng thái (Tất cả)</option>
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Resigned">Resigned</option>
            </select>

            <Button
              variant="secondary"
              className="px-3"
              onClick={fetchEmployees}
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </Card>

      {/* DATA TABLE */}
      <Card className="p-0 overflow-hidden border border-gray-200">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Loader2 size={40} className="animate-spin text-blue-500 mb-2" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <p>Không tìm thấy nhân viên nào phù hợp.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="p-4 w-10">#</th>
                  <th className="p-4">Nhân viên</th>
                  <th className="p-4">Mã NV</th>
                  <th className="p-4">Chức vụ</th>
                  <th className="p-4">Thông tin HĐ</th>
                  <th className="p-4">Ngày vào</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {employees.map((emp, index) => (
                  <tr
                    key={emp._id || emp.id}
                    className="group transition-colors hover:bg-blue-50/50"
                  >
                    <td className="p-4 text-sm text-gray-500">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </td>

                    {/* Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-sm overflow-hidden shrink-0">
                          {emp.avatar && emp.avatar !== "default-avatar.jpg" ? (
                            <img
                              src={emp.avatar}
                              alt="avt"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {(emp.fullName || emp.name || "U")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {emp.fullName || emp.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {emp.account?.username || "Chưa có TK"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="p-4">
                      <span className="font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {emp.employeeCode || "---"}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-800">
                        {emp.jobTitle || "---"}
                      </p>
                    </td>

                    {/* Employment Info */}
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-800">
                        {emp.employmentType || "---"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {emp.workMode || "Onsite"}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(emp.startDate)}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={emp.status} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/hr/employees/${emp._id || emp.id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-2 text-orange-500 hover:bg-orange-100 rounded-lg transition"
                          title="Cập nhật thông tin"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            Hiển thị{" "}
            <strong>
              {employees.length > 0
                ? (pagination.page - 1) * pagination.limit + 1
                : 0}
              -{Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{" "}
            trong tổng số <strong>{pagination.total}</strong> nhân viên
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            {renderPaginationNumbers()}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeList;
