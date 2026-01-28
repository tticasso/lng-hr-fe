import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  CreditCard,
  Monitor,
  Edit,
  Shield,
  Eye,
  EyeOff,
  Building2,
  Clock,
  Award,
} from "lucide-react";

// Import UI Kit
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [showSalary, setShowSalary] = useState(false);

  // Mock Data
  const profile = {
    firstName: "Nguyễn Hữu",
    lastName: "Tần",
    avatar: "TN", // Text avatar
    position: "Senior React Developer",
    department: "Developer",
    joinDate: "27/10/2025",
    status: "Active",
    employeeCode: "EMP-2022-089",
    contractType: "Full-time / Chính thức",
    workShift: "Hành chính (08:30 - 17:30)",
    manager: "Chu Quang Hào (Leader)",

    dob: "05/11/2003",
    gender: "Nam",
    email: "tan.nguyen@company.com",
    phone: "0988 123 456",
    address: "Lạc Nhuế, Tam Đa, Bắc Ninh",
    idCard: "00123456789",

    // Emergency Contact
    emergencyName: "Nguyễn Thị Mẹ",
    emergencyRel: "Mẹ ruột",
    emergencyPhone: "0912 345 678",

    // Job Details
    level: "Senior (L4)",
    workMode: "Hybrid (3 days office)",
    contractStart: "15/03/2022",
    contractEnd: "Vô thời hạn",

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
      {
        code: "AST-102",
        name: "Chuột Magic Mouse",
        handedDate: "15/03/2022",
        status: "Old",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* --- PHẦN 1: HEADER PROFILE --- */}
      <Card className="relative overflow-hidden border-t-4 border-t-primary">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
          {/* Left: Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto">
            <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-primary">
              {profile.avatar}
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile.firstName} {profile.lastName}
                </h1>
                <StatusBadge status={profile.status} />
              </div>

              <div className="text-gray-500 space-y-1">
                <p className="flex items-center gap-2 justify-center sm:justify-start">
                  <Briefcase size={16} />
                  <span className="font-medium text-gray-700">
                    {profile.position}
                  </span>
                </p>
                <p className="flex items-center gap-2 justify-center sm:justify-start">
                  <Building2 size={16} />
                  <span>{profile.department}</span>
                </p>
                <p className="flex items-center gap-2 text-xs text-gray-400 justify-center sm:justify-start">
                  <Calendar size={14} />
                  Joined {profile.joinDate}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Info Chips & Actions */}
          <div className="flex flex-col items-end gap-4 w-full lg:w-auto">
            <Button
              variant="secondary"
              className="text-sm flex items-center gap-2 shadow-sm"
            >
              <Edit size={16} />
              Yêu cầu HR cập nhật
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 w-full lg:w-64">
              {/* Chip 1 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-primary rounded-full">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hợp đồng</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {profile.contractType}
                  </p>
                </div>
              </div>
              {/* Chip 2 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ca làm việc</p>
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {profile.workShift}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* --- PHẦN 2: TABS CONTENT --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {["personal", "job", "compensation", "assets"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                   px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2
                   ${
                     activeTab === tab
                       ? "border-primary text-primary bg-blue-50/50"
                       : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                   }
                `}
            >
              {tab === "personal" && (
                <>
                  <User size={18} /> Thông tin cá nhân
                </>
              )}
              {tab === "job" && (
                <>
                  <Briefcase size={18} /> Công việc & HĐ
                </>
              )}
              {tab === "compensation" && (
                <>
                  <CreditCard size={18} /> Lương & Phúc lợi
                </>
              )}
              {tab === "assets" && (
                <>
                  <Monitor size={18} /> Tài sản
                </>
              )}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="p-6">
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Thông tin cơ bản
                </h3>
                <div className="space-y-4">
                  <ProfileField
                    label="Họ và tên"
                    value={`${profile.firstName} ${profile.lastName}`}
                  />
                  <ProfileField label="Ngày sinh" value={profile.dob} />
                  <ProfileField label="Giới tính" value={profile.gender} />
                  <ProfileField label="CCCD/CMND" value={profile.idCard} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Liên hệ
                </h3>
                <div className="space-y-4">
                  <ProfileField
                    label="Email công ty"
                    value={profile.email}
                    icon={<Mail size={14} />}
                  />
                  <ProfileField
                    label="Số điện thoại"
                    value={profile.phone}
                    icon={<Phone size={14} />}
                  />
                  <ProfileField
                    label="Địa chỉ"
                    value={profile.address}
                    icon={<MapPin size={14} />}
                  />
                </div>

                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mt-8">
                  Liên hệ khẩn cấp
                </h3>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <ProfileField
                    label="Người liên hệ"
                    value={profile.emergencyName}
                  />
                  <ProfileField
                    label="Mối quan hệ"
                    value={profile.emergencyRel}
                  />
                  <ProfileField
                    label="SĐT Khẩn cấp"
                    value={profile.emergencyPhone}
                    className="text-red-600 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB & CONTRACT */}
          {activeTab === "job" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Thông tin vị trí
                </h3>
                <div className="space-y-4">
                  <ProfileField
                    label="Mã nhân viên"
                    value={profile.employeeCode}
                  />
                  <ProfileField label="Phòng ban" value={profile.department} />
                  <ProfileField label="Chức danh" value={profile.position} />
                  <ProfileField label="Cấp bậc (Level)" value={profile.level} />
                  <ProfileField
                    label="Quản lý trực tiếp"
                    value={profile.manager}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Hợp đồng & Làm việc
                </h3>
                <div className="space-y-4">
                  <ProfileField
                    label="Loại hợp đồng"
                    value={profile.contractType}
                  />
                  <ProfileField
                    label="Ngày bắt đầu"
                    value={profile.contractStart}
                  />
                  <ProfileField
                    label="Ngày kết thúc"
                    value={profile.contractEnd}
                  />
                  <ProfileField
                    label="Địa điểm làm việc"
                    value={profile.workMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPENSATION */}
          {activeTab === "compensation" && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold">
                    Mức lương cơ bản (Gross)
                  </span>
                  <button
                    onClick={() => setShowSalary(!showSalary)}
                    className="text-slate-400 hover:text-white transition"
                  >
                    {showSalary ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="text-4xl font-bold relative z-10 tracking-tight">
                  {showSalary ? "35,000,000 VND" : "•••••••• VND"}
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 relative z-10 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-slate-400 text-xs">Phụ cấp ăn trưa</p>
                    <p className="font-semibold mt-1">
                      {showSalary ? "1,200,000" : "••••••"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Phụ cấp xăng xe</p>
                    <p className="font-semibold mt-1">
                      {showSalary ? "500,000" : "••••••"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md flex gap-3 items-start text-sm">
                <Shield size={18} className="shrink-0 mt-0.5" />
                <p>
                  Thông tin lương là bảo mật tuyệt đối. Vui lòng không chia sẻ
                  màn hình này với người khác. Chi tiết thu nhập thực nhận (Net)
                  và các khoản khấu trừ vui lòng xem tại mục{" "}
                  <strong>Phiếu Lương</strong>.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ASSETS */}
          {activeTab === "assets" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Thiết bị đang quản lý
              </h3>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã tài sản
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên thiết bị
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày bàn giao
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tình trạng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {profile.assets.map((asset, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {asset.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 font-medium">
                          {asset.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {asset.handedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {asset.status}
                          </span>
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

// Helper Component để render dòng thông tin (Label - Value) cho gọn code
const ProfileField = ({ label, value, icon, className = "" }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
      {icon} {label}
    </span>
    <span
      className={`text-sm font-medium text-gray-900 border-b border-gray-100 pb-1 ${className}`}
    >
      {value}
    </span>
  </div>
);

export default MyProfile;
