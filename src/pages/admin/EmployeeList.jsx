import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
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
import { departmentApi } from "../../apis/departmentApi";
import { toast } from "react-toastify";

// Import Modal vừa tạo
import EditEmployeeModal from "../../components/modals/EditEmployeeModal";

const EmployeeList = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [allEmployees, setAllEmployees] = useState([]); // Toàn bộ data từ API
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Data sau khi filter
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Pagination State (áp dụng trên filteredEmployees)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
  });

  // Status options
  const statusOptions = [
    { value: "Active", label: "Đang làm việc" },
    { value: "Probation", label: "Thử việc" },
    { value: "Resigned", label: "Đã nghỉ việc" },
    { value: "Terminated", label: "Đã sa thải" },
  ];

  // --- FETCH DEPARTMENTS ---
  const fetchDepartments = async () => {
    try {
      const res = await departmentApi.getAll();
      const deptData = res.data?.data || res.data || [];
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (error) {
      console.error("Lỗi tải phòng ban:", error);
    }
  };

  // --- FETCH ALL EMPLOYEES (1 lần) ---
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeApi.getAll({ limit: 1000 }); // Lấy tất cả

      const responseBody = res.data || {};
      const listData = Array.isArray(responseBody)
        ? responseBody
        : responseBody.data || [];

      setAllEmployees(Array.isArray(listData) ? listData : []);
    } catch (error) {
      console.error("Lỗi tải danh sách:", error);
      if (error.response?.status !== 500) {
        toast.error("Không thể tải danh sách nhân viên.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- FILTER LOGIC (Local) ---
  useEffect(() => {
    let result = [...allEmployees];

    // Filter by search
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.fullName?.toLowerCase().includes(searchLower) ||
          emp.name?.toLowerCase().includes(searchLower) ||
          emp.employeeCode?.toLowerCase().includes(searchLower) ||
          emp.accountId?.username?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by department
    if (filters.department) {
      result = result.filter((emp) => {
        const deptId = emp.departmentId?._id || emp.departmentId;
        return deptId === filters.department;
      });
    }

    // Filter by status
    if (filters.status) {
      result = result.filter((emp) => emp.status === filters.status);
    }

    setFilteredEmployees(result);
    setCurrentPage(1); // Reset về trang 1 khi filter
  }, [allEmployees, filters]);

  // --- INIT DATA ---
  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // --- HANDLERS ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // --- PAGINATION LOGIC (Local) ---
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenEdit = (employee) => {
    console.log("click edit:", employee);
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    fetchEmployees(); // Reload data
  };

  // Helper Render Pagination
  const renderPaginationNumbers = () => {
    const pages = [];

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

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
                  p === currentPage
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

  // --- EXPORT TO EXCEL ---
  const handleExportExcel = () => {
    try {
      // Chuẩn bị dữ liệu xuất
      const exportData = filteredEmployees.map((emp, index) => ({
        STT: index + 1,
        "Mã nhân viên": emp.employeeCode || "",
        "Họ và tên": emp.fullName || emp.name || "",
        "Tên đăng nhập": emp.accountId?.username || "",
        "Email": emp.email || "",
        "Số điện thoại": emp.phoneNumber || "",
        "Chức vụ": emp.jobTitle || "",
        "Phòng ban": emp.departmentId?.name || "",
        "Loại hợp đồng": emp.employmentType || "",
        "Hình thức làm việc": emp.workMode || "",
        "Ngày vào làm": formatDate(emp.startDate),
        "Trạng thái": emp.status || "",
        "Địa chỉ": emp.address || "",
        "Ngày sinh": formatDate(emp.dateOfBirth),
        "Giới tính": emp.gender || "",
      }));

      // Tạo worksheet từ dữ liệu
      const ws = XLSX.utils.json_to_sheet(exportData, { origin: "A4" });

      // Thêm header (3 dòng đầu)
      const currentDate = new Date().toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      XLSX.utils.sheet_add_aoa(
        ws,
        [
          ["LNG Group"],
          ["Bảng quản lý nhân viên"],
          [currentDate],
        ],
        { origin: "A1" }
      );

      // Merge cells cho header
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }, // Merge dòng 1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } }, // Merge dòng 2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } }, // Merge dòng 3
      ];

      // Style cho header (3 dòng đầu) - Căn giữa, chữ to, in đậm
      const headerStyle = {
        font: { bold: true, sz: 16, color: { rgb: "1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" },
      };

      ["A1", "A2", "A3"].forEach((cell) => {
        if (ws[cell]) {
          ws[cell].s = headerStyle;
        }
      });

      // Style cho tiêu đề cột (dòng 4)
      const columnHeaderStyle = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        fill: { fgColor: { rgb: "4472C4" } },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left: { style: "thin", color: { rgb: "000000" } },
          right: { style: "thin", color: { rgb: "000000" } },
        },
      };

      // Áp dụng style cho tiêu đề cột (row 4, từ A4 đến O4)
      const columnHeaders = ["A4", "B4", "C4", "D4", "E4", "F4", "G4", "H4", "I4", "J4", "K4", "L4", "M4", "N4", "O4"];
      columnHeaders.forEach((cell) => {
        if (ws[cell]) {
          ws[cell].s = columnHeaderStyle;
        }
      });

      // Style cho data cells (border nhẹ)
      const dataCellStyle = {
        alignment: { vertical: "center", wrapText: false },
        border: {
          top: { style: "thin", color: { rgb: "D3D3D3" } },
          bottom: { style: "thin", color: { rgb: "D3D3D3" } },
          left: { style: "thin", color: { rgb: "D3D3D3" } },
          right: { style: "thin", color: { rgb: "D3D3D3" } },
        },
      };

      // Áp dụng style cho data (từ row 5 trở đi)
      const range = XLSX.utils.decode_range(ws["!ref"]);
      for (let R = 4; R <= range.e.r; R++) {
        for (let C = 0; C <= 14; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (ws[cellAddress]) {
            ws[cellAddress].s = dataCellStyle;
          }
        }
      }

      // Tự động điều chỉnh độ rộng cột
      const colWidths = [
        { wch: 5 },  // STT
        { wch: 15 }, // Mã NV
        { wch: 25 }, // Họ tên
        { wch: 15 }, // Username
        { wch: 25 }, // Email
        { wch: 15 }, // SĐT
        { wch: 20 }, // Chức vụ
        { wch: 20 }, // Phòng ban
        { wch: 15 }, // Loại HĐ
        { wch: 15 }, // Hình thức
        { wch: 12 }, // Ngày vào
        { wch: 12 }, // Trạng thái
        { wch: 30 }, // Địa chỉ
        { wch: 12 }, // Ngày sinh
        { wch: 10 }, // Giới tính
      ];
      ws["!cols"] = colWidths;

      // Set row heights
      ws["!rows"] = [
        { hpt: 25 }, // Row 1
        { hpt: 25 }, // Row 2
        { hpt: 25 }, // Row 3
        { hpt: 30 }, // Row 4 (header)
      ];

      // Tạo workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách nhân viên");

      // Xuất file
      const fileName = `Bang_quan_ly_nhan_vien_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success(`Đã xuất ${exportData.length} nhân viên ra file Excel`);
    } catch (error) {
      console.error("Lỗi xuất Excel:", error);
      toast.error("Không thể xuất file Excel");
    }
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
            Quản lý nhân viên
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý hồ sơ nhân sự ({filteredEmployees.length} bản ghi)
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={handleExportExcel}
            disabled={filteredEmployees.length === 0}
          >
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
            {/* Department Filter - Dynamic từ API */}
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
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter - Dynamic từ statusOptions */}
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]"
            >
              <option value="">Trạng thái (Tất cả)</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
          ) : currentEmployees.length === 0 ? (
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
                {currentEmployees.map((emp, index) => (
                  <tr
                    key={emp._id || emp.id}
                    className="group transition-colors hover:bg-blue-50/50"
                  >
                    <td className="p-4 text-sm text-gray-500">
                      {startIndex + index + 1}
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
                            {emp.accountId?.username || "Chưa có TK"}
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
              {currentEmployees.length > 0 ? startIndex + 1 : 0}-
              {Math.min(endIndex, filteredEmployees.length)}
            </strong>{" "}
            trong tổng số <strong>{filteredEmployees.length}</strong> nhân viên
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            {renderPaginationNumbers()}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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
