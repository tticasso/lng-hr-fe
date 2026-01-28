import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Briefcase,
  FileText,
  Calendar,
  Award,
  Monitor,
  Clock,
  AlertTriangle,
  TrendingUp,
  Edit,
  LogOut,
  History,
  Mail,
  Phone,
  MapPin,
  Lock,
  Download,
  CheckCircle2,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const EmployeeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const employee = {
    id: "EMP-2022-089",
    name: "Nguyễn Văn An",
    avatar: "NA",
    position: "Senior React Developer",
    department: "Product Engineering",
    status: "Active",
    joinDate: "15/03/2022",
    contractType: "HĐLĐ Không xác định thời hạn",
    leader: "Trần Thị B (Head of Product)",

    // Overview Stats
    stats: {
      attendanceScore: 98,
      lastReview: "4.5/5 (Exceeds Expectations)",
      trainingHours: 24,
      violations: 1,
    },

    // Personal (HR View - More details)
    personal: {
      dob: "20/10/1998",
      gender: "Nam",
      email: "an.nguyen@company.com",
      personalEmail: "an.nguyen.dev@gmail.com",
      phone: "0988 123 456",
      address: "Tòa nhà Keangnam, Phạm Hùng, Hà Nội",
      idCard: "00123456789",
      bankAccount: "190333... (Techcombank)",
      taxCode: "8493423423",
    },

    // Salary History
    salaryHistory: [
      {
        date: "01/01/2025",
        amount: 35000000,
        reason: "Định kỳ 2024",
        type: "Gross",
      },
      {
        date: "01/01/2024",
        amount: 28000000,
        reason: "Thăng chức Senior",
        type: "Gross",
      },
      {
        date: "15/03/2022",
        amount: 20000000,
        reason: "Thỏa thuận ban đầu",
        type: "Gross",
      },
    ],

    // Attendance (3 tháng gần nhất)
    attendance: [
      { month: "T12", present: 22, late: 1, leave: 0 },
      { month: "T11", present: 21, late: 0, leave: 1 },
      { month: "T10", present: 22, late: 2, leave: 0 },
    ],

    // Assets
    assets: [
      {
        code: "AST-001",
        name: "MacBook Pro M2 14inch",
        handedDate: "15/03/2022",
        status: "Good",
      },
      {
        code: "AST-009",
        name: "Dell Monitor 27inch 4K",
        handedDate: "20/03/2022",
        status: "Good",
      },
    ],
  };

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: <TrendingUp size={18} /> },
    { id: "personal", label: "Thông tin cá nhân", icon: <User size={18} /> },
    { id: "contract", label: "Hợp đồng & Lương", icon: <FileText size={18} /> },
    { id: "attendance", label: "Công & Phép", icon: <Clock size={18} /> },
    {
      id: "performance",
      label: "Đánh giá & Đào tạo",
      icon: <Award size={18} />,
    },
    { id: "assets", label: "Tài sản", icon: <Monitor size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* ---  HEADER PROFILE  --- */}
      <Card className="border-t-4 border-t-blue-600 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 -z-10"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          {/* Left: Identity */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto">
            <div className="h-24 w-24 rounded-full bg-white border-4 border-blue-50 shadow-md flex items-center justify-center text-3xl font-bold text-blue-600 shrink-0">
              {employee.avatar}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-800">
                  {employee.name}
                </h1>
                <StatusBadge status={employee.status} />
              </div>
              <p className="font-medium text-gray-600 flex items-center gap-2 justify-center sm:justify-start">
                <Briefcase size={16} /> {employee.position}
              </p>
              <p className="text-sm text-gray-500">
                {employee.department} • Leader: {employee.leader}
              </p>
              <div className="flex gap-4 text-xs text-gray-500 mt-1 justify-center sm:justify-start">
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <Calendar size={12} /> Vào làm: {employee.joinDate}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <FileText size={12} /> {employee.contractType}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-end w-full lg:w-auto">
            <Button variant="secondary" className="text-sm">
              <History size={16} className="mr-2" /> Lịch sử Request
            </Button>
            <Button variant="secondary" className="text-sm">
              <Edit size={16} className="mr-2" /> Chỉnh sửa
            </Button>
            <Button className="bg-red-500  hover:bg-red-200 border-red-100 text-sm">
              <LogOut size={16} className="mr-2" /> Offboarding
            </Button>
          </div>
        </div>
      </Card>

      {/* ---  TABS NAVIGATION --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                     px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2
                     ${
                       activeTab === tab.id
                         ? "border-blue-600 text-blue-600 bg-blue-50/50"
                         : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                     }
                  `}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[400px]">
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                label="Chấm công (30 ngày)"
                value={`${employee.stats.attendanceScore}%`}
                sub="Chuyên cần"
                icon={<Clock size={20} />}
                color="blue"
              />
              <SummaryCard
                label="Performance Rating"
                value={employee.stats.lastReview}
                sub="Kỳ đánh giá gần nhất"
                icon={<Award size={20} />}
                color="green"
              />
              <SummaryCard
                label="Đào tạo & E-learning"
                value={`${employee.stats.trainingHours}h`}
                sub="Giờ học tích lũy"
                icon={<Briefcase size={20} />}
                color="purple"
              />
              <SummaryCard
                label="Vi phạm / Kỷ luật"
                value={employee.stats.violations}
                sub="Lần cảnh cáo"
                icon={<AlertTriangle size={20} />}
                color={employee.stats.violations > 0 ? "red" : "gray"}
              />

              {/* Quick Timeline Note */}
              <div className="md:col-span-2 lg:col-span-4 mt-4">
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase">
                  Hoạt động gần đây
                </h3>
                <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                  <div className="pl-4 relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white"></div>
                    <p className="text-sm font-medium text-gray-800">
                      Hoàn thành khóa học "React Advanced Patterns"
                    </p>
                    <p className="text-xs text-gray-500">
                      Hôm qua • E-learning System
                    </p>
                  </div>
                  <div className="pl-4 relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
                    <p className="text-sm font-medium text-gray-800">
                      Được phê duyệt nghỉ phép (2 ngày)
                    </p>
                    <p className="text-xs text-gray-500">
                      05/12/2025 • HR System
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERSONAL (HR VIEW) */}
          {activeTab === "personal" && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 border-b pb-2">
                  Thông tin liên hệ
                </h3>
                <InfoField
                  label="Email công việc"
                  value={employee.personal.email}
                  icon={<Mail size={14} />}
                />
                <InfoField
                  label="Email cá nhân"
                  value={employee.personal.personalEmail}
                  icon={<Mail size={14} />}
                />
                <InfoField
                  label="Số điện thoại"
                  value={employee.personal.phone}
                  icon={<Phone size={14} />}
                />
                <InfoField
                  label="Địa chỉ thường trú"
                  value={employee.personal.address}
                  icon={<MapPin size={14} />}
                />
              </div>
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  Thông tin định danh & Ngân hàng{" "}
                  <Lock size={14} className="text-orange-500" />
                </h3>
                <InfoField label="Ngày sinh" value={employee.personal.dob} />
                <InfoField label="Giới tính" value={employee.personal.gender} />
                <InfoField
                  label="CCCD/CMND"
                  value={employee.personal.idCard}
                  bold
                />
                <InfoField
                  label="Mã số thuế"
                  value={employee.personal.taxCode}
                />
                <InfoField
                  label="Số tài khoản"
                  value={employee.personal.bankAccount}
                  bold
                />
              </div>
            </div>
          )}

          {/* TAB: CONTRACT & COMP */}
          {activeTab === "contract" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              {/* Salary History Table */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">
                    Lịch sử Lương & Phúc lợi
                  </h3>
                  <Button variant="secondary" className="text-xs">
                    <Download size={14} className="mr-1" /> Xuất Excel
                  </Button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-3">Ngày hiệu lực</th>
                        <th className="p-3">Mức lương (VND)</th>
                        <th className="p-3">Loại</th>
                        <th className="p-3">Lý do điều chỉnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employee.salaryHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-3">{item.date}</td>
                          <td className="p-3 font-mono font-bold text-gray-800">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.amount)}
                          </td>
                          <td className="p-3">{item.type}</td>
                          <td className="p-3 text-gray-600">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ATTENDANCE */}
          {activeTab === "attendance" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="font-bold text-gray-800 mb-6">
                Thống kê chuyên cần (3 tháng gần nhất)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {employee.attendance.map((m, idx) => (
                  <Card key={idx} className="bg-gray-50 border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-4 flex justify-between">
                      Tháng {m.month}
                      <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">
                        22 công chuẩn
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {/* Present Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-green-700 font-medium">
                            Đi làm đúng giờ
                          </span>
                          <span className="font-bold">{m.present}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(m.present / 22) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      {/* Late Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-700 font-medium">
                            Đi muộn
                          </span>
                          <span className="font-bold">{m.late}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(m.late / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ASSETS */}
          {activeTab === "assets" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="font-bold text-gray-800 mb-4">
                Tài sản đang bàn giao
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3">Mã tài sản</th>
                      <th className="p-3">Tên thiết bị</th>
                      <th className="p-3">Ngày bàn giao</th>
                      <th className="p-3">Tình trạng</th>
                      <th className="p-3 text-center">Biên bản</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employee.assets.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-mono text-blue-600">
                          {item.code}
                        </td>
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-gray-500">{item.handedDate}</td>
                        <td className="p-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="p-3 text-center text-blue-600 hover:underline cursor-pointer text-xs">
                          Xem file
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const SummaryCard = ({ label, value, sub, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-50 text-gray-500",
  };
  return (
    <Card className="flex items-start gap-4 p-4 border border-gray-100 shadow-sm">
      <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </Card>
  );
};

const InfoField = ({ label, value, icon, bold }) => (
  <div className="border-b border-gray-100 pb-2 last:border-0">
    <p className="text-xs text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-1">
      {icon} {label}
    </p>
    <p
      className={`text-sm text-gray-900 ${
        bold ? "font-bold font-mono" : "font-medium"
      }`}
    >
      {value || "--"}
    </p>
  </div>
);

export default EmployeeDetail;
