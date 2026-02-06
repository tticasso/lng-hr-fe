import React, { useState, useEffect } from "react";
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
  History,
  Mail,
  Phone,
  MapPin,
  Lock,
  Download,
  Loader2,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Landmark,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { employeeApi } from "../../apis/employeeApi";
import { toast } from "react-toastify";

// Import Modal Edit (nếu bạn đã tách file, hoặc giữ logic edit sau)
// import EditEmployeeModal from "../../components/modals/EditEmployeeModal";

const EmployeeDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchEmployeeDetail = async () => {
      try {
        setLoading(true);
        const res = await employeeApi.getById(id);

        // Handle response structure
        const responseBody = res.data || {};
        const realData = responseBody.data || responseBody;

        if (realData) {
          setEmployeeData(realData);
        } else {
          toast.error("Không tìm thấy dữ liệu nhân viên");
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
        toast.error("Không thể tải thông tin nhân viên.");
        navigate("/employees");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEmployeeDetail();
  }, [id, navigate]);

  // --- 2. FORMAT HELPERS ---
  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // --- 3. MERGE DATA ---
  const employee = employeeData
    ? {
        id: employeeData._id || employeeData.id,
        name: employeeData.fullName || "User",
        avatar: employeeData.avatar || "default-avatar.jpg",
        position: employeeData.jobTitle || "N/A",
        // Xử lý department object/string
        department:
          typeof employeeData.department === "object"
            ? employeeData.department?.name
            : employeeData.department || "Chưa phân phòng",
        status: employeeData.status || "Active",
        joinDate: formatDate(employeeData.startDate),
        contractType: employeeData.contractType || "Hợp đồng lao động",

        // [MỚI] Stats mapping
        stats: {
          attendanceScore: 98, // Mock
          lastReview: employeeData.jobLevel
            ? `Level ${employeeData.jobLevel}`
            : "N/A",
          leaveBalance: employeeData.annualLeaveBalance || 0, // [MỚI]
          seniority:
            Math.floor(
              (new Date() - new Date(employeeData.startDate)) /
                (1000 * 60 * 60 * 24 * 30),
            ) + " tháng",
        },

        // Personal Info
        personal: {
          dob: formatDate(employeeData.birthDate),
          gender:
            employeeData.gender === "Male"
              ? "Nam"
              : employeeData.gender === "Female"
                ? "Nữ"
                : "Khác",
          email: employeeData.account?.username
            ? `${employeeData.account.username}@company.com`
            : "---",
          personalEmail: employeeData.personalEmail,
          phone: employeeData.phoneNumber,
          address: employeeData.address,
          idCard: employeeData.identityCard,
          taxCode: employeeData.taxIdentification, // [MỚI]

          // Emergency
          emergencyName: employeeData.emergencyName,
          emergencyPhone: employeeData.emergencyPhone,
          emergencyRelation: employeeData.emergencyRelation,

          // Bank Info [MỚI]
          bankName: employeeData.bankAccount?.bankName,
          bankNumber: employeeData.bankAccount?.accountNumber,
        },

        // Contract & Salary
        contract: {
          number: employeeData.contractNumber,
          startDate: formatDate(employeeData.contractStartDate),
          endDate: formatDate(employeeData.contractEndDate),
          probationEnd: formatDate(employeeData.probationEndDate),
          type: employeeData.contractType,
          workMode: employeeData.workMode,
          workEmail: employeeData.workEmail,
        },

        // Financials [MỚI]
        financials: {
          baseSalary: employeeData.baseSalary || 0,
          lunchAllowance: employeeData.lunchAllowance || 0,
          fuelAllowance: employeeData.fuelAllowance || 0,
          currency: employeeData.baseCurrency || "VND",
        },

        // Mock Lists (Giữ nguyên vì chưa có API chi tiết)
        attendance: [
          { month: "T12", present: 22, late: 1, leave: 0 },
          { month: "T11", present: 21, late: 0, leave: 1 },
          { month: "T10", present: 22, late: 2, leave: 0 },
        ],
        assets: [
          {
            code: "AST-001",
            name: "Laptop Dell XPS 15",
            handedDate: formatDate(employeeData.startDate),
            status: "Good",
          },
        ],
      }
    : null;

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: <TrendingUp size={18} /> },
    { id: "personal", label: "Thông tin cá nhân", icon: <User size={18} /> },
    { id: "contract", label: "Hợp đồng & Lương", icon: <FileText size={18} /> },
    { id: "attendance", label: "Công & Phép", icon: <Clock size={18} /> },
    { id: "assets", label: "Tài sản", icon: <Monitor size={18} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      {/* --- HEADER PROFILE --- */}
      <Card className="border-t-4 border-t-blue-600 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 -z-10"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto">
            <div className="h-24 w-24 rounded-full bg-white border-4 border-blue-50 shadow-md flex items-center justify-center text-3xl font-bold text-blue-600 shrink-0 overflow-hidden">
              {employee.avatar && employee.avatar !== "default-avatar.jpg" ? (
                <img
                  src={employee.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{employee.name?.charAt(0).toUpperCase()}</span>
              )}
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
              <div className="flex gap-2 text-sm text-gray-500 items-center justify-center sm:justify-start">
                <span>{employee.department}</span>
                <span>•</span>
                <span>{employee.contract.workEmail}</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mt-1 justify-center sm:justify-start">
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <Calendar size={12} /> Vào làm: {employee.joinDate}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                  <Monitor size={12} /> {employee.contract.workMode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center sm:justify-end w-full lg:w-auto">
            <Button variant="secondary" className="text-sm">
              <History size={16} className="mr-2" /> Lịch sử
            </Button>
            {/* Nút chỉnh sửa có thể gọi Modal EditEmployeeModal tại đây */}
            <Button
              variant="secondary"
              className="text-sm"
              onClick={() => toast.info("Mở Modal Edit...")}
            >
              <Edit size={16} className="mr-2" /> Chỉnh sửa
            </Button>
          </div>
        </div>
      </Card>

      {/* --- TABS --- */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 min-h-[400px]">
          {/* 1. OVERVIEW */}
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
                label="Cấp bậc (Job Level)"
                value={employee.stats.lastReview}
                sub="Hiện tại"
                icon={<Award size={20} />}
                color="green"
              />
              <SummaryCard
                label="Thâm niên"
                value={employee.stats.seniority}
                sub={`Từ ${employee.joinDate}`}
                icon={<Briefcase size={20} />}
                color="purple"
              />
              <SummaryCard
                label="Phép năm còn lại"
                value={employee.stats.leaveBalance}
                sub="Ngày phép"
                icon={<Calendar size={20} />}
                color="orange"
              />
            </div>
          )}

          {/* 2. PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <User size={16} /> Thông tin cơ bản
                </h3>
                <InfoField
                  label="Ngày sinh"
                  value={employee.personal.dob}
                  icon={<Calendar size={14} />}
                />
                <InfoField
                  label="Giới tính"
                  value={employee.personal.gender}
                  icon={<User size={14} />}
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

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-500" /> Liên hệ
                    khẩn cấp
                  </h4>
                  <InfoField
                    label="Họ tên"
                    value={employee.personal.emergencyName}
                  />
                  <InfoField
                    label="Mối quan hệ"
                    value={employee.personal.emergencyRelation}
                  />
                  <InfoField
                    label="Số điện thoại"
                    value={employee.personal.emergencyPhone}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <Lock size={16} className="text-orange-500" /> Thông tin pháp
                  lý & Ngân hàng
                </h3>
                <InfoField
                  label="CCCD / CMND"
                  value={employee.personal.idCard}
                  bold
                />
                <InfoField
                  label="Mã số thuế"
                  value={employee.personal.taxCode}
                  bold
                />

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                  <div className="flex items-center gap-2 mb-3 text-blue-700 font-bold text-sm">
                    <Landmark size={16} /> Tài khoản ngân hàng
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Ngân hàng
                      </p>
                      <p className="font-medium">
                        {employee.personal.bankName || "---"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        Số tài khoản
                      </p>
                      <p className="font-mono font-bold">
                        {employee.personal.bankNumber || "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. CONTRACT & SALARY */}
          {activeTab === "contract" && (
            <div className="animate-in fade-in duration-300 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contract Info */}
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <FileText size={16} /> Chi tiết hợp đồng
                </h3>
                <InfoField
                  label="Số hợp đồng"
                  value={employee.contract.number}
                  bold
                />
                <InfoField
                  label="Loại hợp đồng"
                  value={employee.contract.type}
                />
                <InfoField
                  label="Ngày hiệu lực"
                  value={employee.contract.startDate}
                />
                <InfoField
                  label="Ngày hết hạn"
                  value={employee.contract.endDate}
                />
                <InfoField
                  label="Kết thúc thử việc"
                  value={employee.contract.probationEnd}
                />
              </div>

              {/* Financials */}
              <div className="space-y-6">
                <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <DollarSign size={16} /> Lương & Phụ cấp
                </h3>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 uppercase font-semibold mb-1">
                    Lương cơ bản (Gross)
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(employee.financials.baseSalary)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Phụ cấp ăn trưa
                    </p>
                    <p className="font-bold text-gray-700">
                      {formatCurrency(employee.financials.lunchAllowance)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase mb-1">
                      Phụ cấp xăng xe
                    </p>
                    <p className="font-bold text-gray-700">
                      {formatCurrency(employee.financials.fuelAllowance)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ATTENDANCE (Mock) */}
          {activeTab === "attendance" && (
            <div className="animate-in fade-in duration-300">
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded mb-4 text-sm flex items-center gap-2">
                <AlertTriangle size={16} /> Dữ liệu chấm công đang được đồng bộ.
                Dưới đây là dữ liệu mẫu.
              </div>
              <h3 className="font-bold text-gray-800 mb-6">
                Thống kê chuyên cần
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
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 5. ASSETS */}
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
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card className="flex items-start gap-4 p-4 border border-gray-100 shadow-sm">
      <div className={`p-3 rounded-lg ${colors[color] || colors.gray}`}>
        {icon}
      </div>
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
      className={`text-sm text-gray-900 ${bold ? "font-bold font-mono" : "font-medium"}`}
    >
      {value || "--"}
    </p>
  </div>
);

export default EmployeeDetail;
