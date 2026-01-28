import React, { useState } from "react";
import {
  Shield,
  Clock,
  Calendar,
  Briefcase,
  Box,
  FileText,
  Edit,
  Plus,
  Trash2,
  Save,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Cpu,
  Mouse,
  Check,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const SystemAdmin = () => {
  const [activeTab, setActiveTab] = useState("roles");

  // Danh sách Menu Cấu hình
  const menuItems = [
    {
      id: "roles",
      label: "Roles & Permissions",
      icon: <Shield size={18} />,
      desc: "Phân quyền người dùng",
    },
    {
      id: "schedules",
      label: "Work Schedules",
      icon: <Clock size={18} />,
      desc: "Ca làm việc & Giờ giấc",
    },
    {
      id: "policies",
      label: "Leave & OT Policies",
      icon: <Briefcase size={18} />,
      desc: "Quy định nghỉ & tăng ca",
    },
    {
      id: "holidays",
      label: "Holidays",
      icon: <Calendar size={18} />,
      desc: "Danh sách ngày lễ",
    },
    {
      id: "assets",
      label: "Asset Categories",
      icon: <Box size={18} />,
      desc: "Danh mục tài sản",
    },
    {
      id: "reports",
      label: "Report Settings",
      icon: <FileText size={18} />,
      desc: "Cấu hình báo cáo tự động",
    },
  ];

  // --- RENDER CONTENT: ROLES ---
  const renderRoles = () => {
    const roles = [
      {
        name: "Admin",
        desc: "Quản trị viên hệ thống, toàn quyền truy cập.",
        users: 2,
        type: "System",
      },
      {
        name: "HR Manager",
        desc: "Quản lý tuyển dụng, nhân sự, chấm công.",
        users: 3,
        type: "System",
      },
      {
        name: "Payroll",
        desc: "Truy cập module tính lương và báo cáo tài chính.",
        users: 2,
        type: "Custom",
      },
      {
        name: "Team Leader",
        desc: "Quản lý nhân viên trong team, duyệt đơn từ.",
        users: 12,
        type: "System",
      },
      {
        name: "Employee",
        desc: "Quyền cơ bản: xem hồ sơ, chấm công, gửi request.",
        users: 120,
        type: "System",
      },
    ];

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Roles & Permissions
          </h2>
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={16} /> Tạo Role mới
          </Button>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 font-semibold text-gray-500">
              <tr>
                <th className="p-4">Tên Role</th>
                <th className="p-4">Mô tả quyền hạn</th>
                <th className="p-4 text-center">User</th>
                <th className="p-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {roles.map((role, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800 flex items-center gap-2">
                    {role.name}
                    {role.type === "System" && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border">
                        System
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-gray-600">{role.desc}</td>
                  <td className="p-4 text-center font-medium">{role.users}</td>
                  <td className="p-4 text-right">
                    <button className="text-blue-600 hover:underline text-xs font-medium">
                      Edit Permission
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- RENDER CONTENT: SCHEDULES ---
  const renderSchedules = () => (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Cấu hình ca làm việc chuẩn
        </h2>
        <Button variant="secondary" className="flex items-center gap-2">
          <Save size={16} /> Lưu thay đổi
        </Button>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Clock size={18} /> Giờ hành chính (Standard)
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ bắt đầu (Check-in)
              </label>
              <input
                type="time"
                defaultValue="08:30"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giờ kết thúc (Check-out)
              </label>
              <input
                type="time"
                defaultValue="17:30"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghỉ trưa từ
              </label>
              <input
                type="time"
                defaultValue="12:00"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến
              </label>
              <input
                type="time"
                defaultValue="13:30"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ngày làm việc trong tuần
            </label>
            <div className="flex gap-2">
              {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day, i) => (
                <div
                  key={day}
                  className={`
                         w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold cursor-pointer border transition-all
                         ${
                           i < 5
                             ? "bg-blue-600 text-white border-blue-600"
                             : "bg-white text-gray-400 border-gray-300 hover:border-blue-400"
                         }
                      `}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDER CONTENT: ASSETS ---
  const renderAssets = () => {
    const categories = [
      {
        name: "Laptop / PC",
        prefix: "LAP",
        icon: <Monitor size={24} />,
        items: 45,
      },
      {
        name: "Monitor",
        prefix: "MON",
        icon: <Monitor size={24} />,
        items: 30,
      },
      {
        name: "Keyboard / Mouse",
        prefix: "ACC",
        icon: <Mouse size={24} />,
        items: 50,
      },
      {
        name: "Server / Network",
        prefix: "SVR",
        icon: <Cpu size={24} />,
        items: 5,
      },
    ];
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Danh mục Tài sản</h2>
          <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
            <Plus size={16} /> Thêm nhóm
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <Card
              key={idx}
              className="flex items-center gap-4 hover:border-blue-300 cursor-pointer transition"
            >
              <div className="p-4 bg-gray-50 rounded-lg text-gray-600">
                {cat.icon}
              </div>
              <div>
                <h4 className="font-bold text-gray-800">{cat.name}</h4>
                <p className="text-sm text-gray-500">
                  Mã tiền tố:{" "}
                  <span className="font-mono font-bold">{cat.prefix}</span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {cat.items} thiết bị
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // --- RENDER CONTENT: HOLIDAYS ---
  const renderHolidays = () => (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          Danh sách Ngày lễ 2025
        </h2>
        <Button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
          <Plus size={16} /> Thêm ngày lễ
        </Button>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {[
          { date: "01/01/2025", name: "Tết Dương lịch", days: 1 },
          { date: "25/01/2025", name: "Tết Nguyên Đán", days: 7 },
          { date: "30/04/2025", name: "Ngày Giải phóng & Quốc tế LĐ", days: 2 },
          { date: "02/09/2025", name: "Quốc Khánh", days: 2 },
        ].map((h, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-lg font-bold flex flex-col items-center min-w-[60px]">
                <span className="text-xs uppercase">
                  {h.date.split("/")[1]}/{h.date.split("/")[2]}
                </span>
                <span className="text-lg">{h.date.split("/")[0]}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">{h.name}</p>
                <p className="text-sm text-gray-500">Nghỉ {h.days} ngày</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-blue-600">
                <Edit size={16} />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
      {/* --- LEFT SIDEBAR: SETTINGS MENU --- */}
      <Card className="w-full md:w-72 flex-shrink-0 p-2 h-full overflow-y-auto">
        <div className="px-4 py-3 mb-2">
          <h3 className="font-bold text-gray-800 uppercase text-xs tracking-wider">
            System Settings
          </h3>
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all text-left group
                    ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                 `}
            >
              <span
                className={`${
                  activeTab === item.id
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {item.icon}
              </span>
              <div className="flex-1">
                <p>{item.label}</p>
                {/* <p className="text-[10px] text-gray-400 font-normal mt-0.5 line-clamp-1">{item.desc}</p> */}
              </div>
              {activeTab === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* --- RIGHT CONTENT AREA --- */}
      <Card className="flex-1 h-full overflow-y-auto p-6 md:p-8 border border-gray-200 shadow-sm bg-white">
        {activeTab === "roles" && renderRoles()}
        {activeTab === "schedules" && renderSchedules()}
        {activeTab === "assets" && renderAssets()}
        {activeTab === "holidays" && renderHolidays()}

        {/* Placeholder cho các tab chưa implement */}
        {(activeTab === "policies" || activeTab === "reports") && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} className="opacity-30" />
            </div>
            <p className="font-medium">Cấu hình này đang được phát triển</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SystemAdmin;
