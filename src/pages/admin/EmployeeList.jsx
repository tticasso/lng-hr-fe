import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Listbox,
  Transition,
} from "@headlessui/react";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);

  const employees = [
    {
      id: 1,
      code: "EMP089",
      name: "Nguyễn Văn An",
      email: "an.nguyen@company.com",
      avatar: "NA",
      role: "Senior Developer",
      dept: "Product",
      joinDate: "15/03/2022",
      status: "Active",
      leader: "Trần Thị B",
    },
    {
      id: 2,
      code: "EMP090",
      name: "Lê Thị Hoa",
      email: "hoa.le@company.com",
      avatar: "LH",
      role: "Seller",
      dept: "Design",
      joinDate: "20/05/2023",
      status: "Onboarding",
      leader: "Nguyễn Văn C",
    },
    {
      id: 3,
      code: "EMP091",
      name: "Phạm Văn Dũng",
      email: "dung.pham@company.com",
      avatar: "PD",
      role: "Marketing Exec",
      dept: "Marketing",
      joinDate: "10/01/2021",
      status: "Active",
      leader: "Lê Văn E",
    },
    {
      id: 4,
      code: "EMP088",
      name: "Trần Văn F",
      email: "f.tran@company.com",
      avatar: "TF",
      role: "Sales Manager",
      dept: "Sales",
      joinDate: "01/01/2020",
      status: "Offboarding",
      leader: "BOD",
    },
    {
      id: 5,
      code: "EMP102",
      name: "Hoàng Thị G",
      email: "g.hoang@company.com",
      avatar: "HG",
      role: "Seller",
      dept: "Product",
      joinDate: "01/12/2025",
      status: "Active",
      leader: "Nguyễn Văn An",
    },
  ];

  // Xử lý chọn row (Checkbox)
  const toggleSelectAll = (e) => {
    if (e.target.checked) setSelectedRows(employees.map((e) => e.id));
    else setSelectedRows([]);
  };

  const toggleSelectRow = (id) => {
    if (selectedRows.includes(id))
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    else setSelectedRows([...selectedRows, id]);
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER: TITLE & ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Directory
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý hồ sơ nhân sự toàn công ty
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={18} /> Export
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
            <UserPlus size={18} /> Thêm nhân viên mới
          </Button>
        </div>
      </div>

      {/* --- TOOLBAR: SEARCH & FILTER --- */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Box Lớn */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã nhân viên hoặc email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Groups */}
          <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
            <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]">
              <option value="">Phòng ban</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>

            <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]">
              <option value="">Vị trí</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
              <option value="Intern">Intern</option>
            </select>

            <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]">
              <option value="">Trạng thái</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Offboarding">Offboarding</option>
            </select>

            <Button variant="secondary" className="px-3">
              <Filter size={18} />
            </Button>
          </div>
        </div>
      </Card>

      {/* --- DATA TABLE --- */}
      <Card className="p-0 overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4">Nhân viên</th>
                <th className="p-4">Mã NV</th>
                <th className="p-4">Vị trí / Phòng ban</th>
                <th className="p-4">Ngày vào</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Leader</th>
                <th className="p-4 text-center">Hành động</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 bg-white">
              {employees.map((emp) => (
                <tr
                  key={emp.id}
                  className={`
                    group transition-colors hover:bg-blue-50/50 
                    ${selectedRows.includes(emp.id) ? "bg-blue-50" : ""}
                  `}
                >
                  {/* Checkbox */}
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(emp.id)}
                      onChange={() => toggleSelectRow(emp.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>

                  {/* Employee Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-sm">
                        {emp.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Code */}
                  <td className="p-4">
                    <span className="font-mono text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {emp.code}
                    </span>
                  </td>

                  {/* Role & Dept */}
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-800">
                      {emp.role}
                    </p>
                    <p className="text-xs text-gray-500">{emp.dept}</p>
                  </td>

                  {/* Join Date */}
                  <td className="p-4 text-sm text-gray-600">{emp.joinDate}</td>

                  {/* Status */}
                  <td className="p-4">
                    <StatusBadge status={emp.status} />
                  </td>

                  {/* Leader */}
                  <td className="p-4 text-sm text-gray-600">{emp.leader}</td>

                  {/* Actions */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2  transition-opacity">
                      {/* Nút Xem chi tiết (Chính) */}
                      <button
                        onClick={() => navigate(`/hr/employees/${emp.id}`)} // Giả định route detail
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg tooltip-container"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Nút Sửa (Phụ) */}
                      <button
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        title="Chỉnh sửa"
                      >
                        <Edit size={18} />
                      </button>

                      {/* Nút Xóa (Nguy hiểm) */}
                      <button
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                        title="Xóa nhân viên"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div>
            Hiển thị <strong>1-5</strong> trong tổng số <strong>120</strong>{" "}
            nhân viên
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 border border-gray-300 rounded-md hover:bg-white disabled:opacity-50"
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-md font-medium">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-white">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-white">
              3
            </button>
            <span className="px-2">...</span>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-white">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeList;
