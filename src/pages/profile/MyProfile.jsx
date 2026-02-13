import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  CreditCard,
  Monitor,
  Edit,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Award,
  Loader2,
  Save,
  AlertCircle,
  Landmark,
  Key,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { employeeApi } from "../../apis/employeeApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../apis/authApi";

// --- CÁC REGEX CHUẨN VIỆT NAM ---
const VIETNAM_PHONE_REGEX = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
const IDENTITY_CARD_REGEX = /^(\d{9}|\d{12})$/;

const MyProfile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");
  const [showSalary, setShowSalary] = useState(false);

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // ====== CHANGE PASSWORD STATE ======
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  // Style Inline Tailwind
  const inputClassName =
    "w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm text-gray-900 placeholder-gray-400";
  const errorInputClassName =
    "w-full px-4 py-2.5 bg-red-50 border border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm text-gray-900 placeholder-red-400";

  useEffect(() => {
    if (user) {
      // Bổ sung các field thiếu với giá trị mặc định
      const enrichedUser = {
        ...user,
        identityCard: user.identityCard || "",
        baseSalary: user.baseSalary || 0,
        contractStartDate: user.contractStartDate || user.startDate,
        contractEndDate: user.contractEndDate || null,
        annualLeaveBalance: user.annualLeaveBalance ?? 0,
        department: user.departmentId?.name || user.department || "--",
      };
      
      setProfile(enrichedUser);
      
      if (user.isProfileUpdated === false) {
        setIsEditing(true);
        setFormData({
          fullName: user.fullName || "",
          gender: user.gender || "Male",
          birthDate: user.birthDate
            ? new Date(user.birthDate).toISOString().split("T")[0]
            : "",
          phoneNumber: user.phoneNumber || "",
          address: user.address || "",
          identityCard: user.identityCard || "",
          personalEmail: user.personalEmail || "",
          emergencyName: user.emergencyContact?.name || "",
          emergencyPhone: user.emergencyContact?.phone || "",
          emergencyRelation: user.emergencyContact?.relation || "",
        });
      }
    }
  }, [user]);


  useEffect(() => {
    console.log("userData :", user)
  }, [user])


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Vui lòng nhập số điện thoại.";
      isValid = false;
    } else if (!VIETNAM_PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "SĐT không đúng định dạng VN.";
      isValid = false;
    }

    if (!formData.identityCard) {
      newErrors.identityCard = "Vui lòng nhập số CCCD/CMND.";
      isValid = false;
    } else if (!IDENTITY_CARD_REGEX.test(formData.identityCard)) {
      newErrors.identityCard = "CCCD phải bao gồm đúng 9 hoặc 12 chữ số.";
      isValid = false;
    }

    if (
      formData.emergencyPhone &&
      !VIETNAM_PHONE_REGEX.test(formData.emergencyPhone)
    ) {
      newErrors.emergencyPhone = "SĐT khẩn cấp không đúng định dạng.";
      isValid = false;
    }

    if (!formData.fullName) {
      newErrors.fullName = "Họ tên là bắt buộc.";
      isValid = false;
    }
    if (!formData.birthDate) {
      newErrors.birthDate = "Ngày sinh là bắt buộc.";
      isValid = false;
    }
    if (!formData.personalEmail) {
      newErrors.personalEmail = "Email là bắt buộc.";
      isValid = false;
    }
    if (!formData.address) {
      newErrors.address = "Địa chỉ là bắt buộc.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu.");
      return;
    }
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
      };

      await employeeApi.updateMe(submitData);
      toast.success("Cập nhật hồ sơ thành công!");
      const updatedUser = await refreshProfile();
      setIsEditing(false);
      if (updatedUser?.isProfileUpdated) navigate("/");
    } catch (error) {
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach((err) => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
        toast.error("Dữ liệu không hợp lệ.");
      } else {
        toast.error(error.response?.data?.message || "Cập nhật thất bại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ====== CHANGE PASSWORD HANDLERS ======
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((p) => ({ ...p, [name]: value }));
    if (pwErrors[name]) setPwErrors((p) => ({ ...p, [name]: "" }));
  };

  const validatePw = () => {
    const ne = {};
    let ok = true;

    if (!pwForm.currentPassword) {
      ne.currentPassword = "Vui lòng nhập mật khẩu hiện tại.";
      ok = false;
    }
    if (!pwForm.newPassword) {
      ne.newPassword = "Vui lòng nhập mật khẩu mới.";
      ok = false;
    } else if (pwForm.newPassword.length < 8) {
      ne.newPassword = "Mật khẩu mới tối thiểu 8 ký tự.";
      ok = false;
    }
    if (!pwForm.confirmPassword) {
      ne.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
      ok = false;
    } else if (pwForm.confirmPassword !== pwForm.newPassword) {
      ne.confirmPassword = "Xác nhận mật khẩu không khớp.";
      ok = false;
    }

    setPwErrors(ne);
    return ok;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePw()) {
      toast.error("Vui lòng kiểm tra lại mật khẩu.");
      return;
    }

    setPwSubmitting(true);
    try {
      const payload = {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmPassword,
      };

      console.log("ĐỔI MK : ", payload)

      const res = await authApi.changepasswork(payload)
      console.log("DỮ LIỆU API TRẢ VỀ : ", res)
      toast.success("Đổi mật khẩu thành công!");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Đổi mật khẩu thất bại."
      );
    } finally {
      setPwSubmitting(false);
    }
  };

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

  // --- EDIT MODE ---
  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 mt-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4 shadow-sm">
          <AlertCircle className="text-yellow-600 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-lg font-bold text-yellow-800">
              Yêu cầu cập nhật thông tin
            </h3>
            <p className="text-yellow-700 mt-1">
              Xin chào <strong>{user?.fullName}</strong>! Vui lòng cập nhật
              thông tin cá nhân để kích hoạt tài khoản.
            </p>
          </div>
        </div>

        <Card className="border-t-4 border-t-blue-600 shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Edit size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Form thông tin nhân viên
              </h2>
              <p className="text-sm text-gray-500">
                Vui lòng điền chính xác các thông tin bắt buộc (*).
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-8">
            {/* Nhóm 1: Thông tin định danh */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                1. Thông tin định danh
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Họ và tên" required error={errors.fullName}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={
                      errors.fullName ? errorInputClassName : inputClassName
                    }
                    placeholder="Nguyễn Văn A"
                  />
                </InputGroup>

                <InputGroup label="Ngày sinh" required error={errors.birthDate}>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className={
                      errors.birthDate ? errorInputClassName : inputClassName
                    }
                  />
                </InputGroup>

                <InputGroup label="Giới tính" required>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={inputClassName}
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                </InputGroup>

                <InputGroup
                  label="CCCD/CMND"
                  required
                  error={errors.identityCard}
                >
                  <input
                    type="text"
                    name="identityCard"
                    value={formData.identityCard}
                    onChange={handleInputChange}
                    className={
                      errors.identityCard ? errorInputClassName : inputClassName
                    }
                    placeholder="9 hoặc 12 chữ số"
                  />
                </InputGroup>
              </div>
            </div>

            {/* Nhóm 2: Thông tin liên lạc */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-t pt-6">
                2. Thông tin liên lạc
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Số điện thoại"
                  required
                  error={errors.phoneNumber}
                >
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={
                      errors.phoneNumber ? errorInputClassName : inputClassName
                    }
                    placeholder="VD: 0912345678"
                  />
                </InputGroup>

                <InputGroup
                  label="Email cá nhân"
                  required
                  error={errors.personalEmail}
                >
                  <input
                    type="email"
                    name="personalEmail"
                    value={formData.personalEmail}
                    onChange={handleInputChange}
                    className={
                      errors.personalEmail
                        ? errorInputClassName
                        : inputClassName
                    }
                    placeholder="email@example.com"
                  />
                </InputGroup>

                <InputGroup
                  label="Địa chỉ thường trú"
                  required
                  className="md:col-span-2"
                  error={errors.address}
                >
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={
                      errors.address ? errorInputClassName : inputClassName
                    }
                    placeholder="Số nhà, đường, phường/xã..."
                  />
                </InputGroup>
              </div>
            </div>

            {/* Nhóm 3: Liên hệ khẩn cấp */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-t pt-6">
                3. Liên hệ khẩn cấp
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Tên người liên hệ">
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    className={inputClassName}
                  />
                </InputGroup>

                <InputGroup label="Mối quan hệ">
                  <input
                    type="text"
                    name="emergencyRelation"
                    value={formData.emergencyRelation}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Bố, Mẹ, Vợ..."
                  />
                </InputGroup>

                <InputGroup label="SĐT Khẩn cấp" error={errors.emergencyPhone}>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    className={
                      errors.emergencyPhone
                        ? errorInputClassName
                        : inputClassName
                    }
                  />
                </InputGroup>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 py-3"
              >
                {submitting ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Save className="mr-2" size={18} />
                )}
                Hoàn tất
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // --- VIEW MODE ---
  if (!profile)
    return <div className="text-center p-10">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card className="relative overflow-hidden border-t-4 border-t-blue-600">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start">
          <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start w-full lg:w-auto">
            <div className="h-28 w-28 rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
              {profile.avatar && profile.avatar !== "default-avatar.jpg" ? (
                <img
                  src={profile.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {profile.fullName?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile.fullName}
                </h1>
                <StatusBadge status={profile.status} />
              </div>
              <div className="text-gray-500 space-y-1">
                <p className="flex items-center gap-2 justify-center sm:justify-start">
                  <Briefcase size={16} />{" "}
                  <span className="font-medium text-gray-700">
                    {profile.jobTitle || "--"}
                  </span>
                </p>
                <div className="flex gap-3 text-sm justify-center sm:justify-start">
                  <span>{profile.employeeCode}</span>
                  <span>•</span>
                  <span>{profile.workEmail || profile.email}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100">
              <Clock size={16} /> {profile.workMode || "Onsite"}
            </div>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-purple-100">
              <Award size={16} /> Level: {profile.jobLevel || "N/A"}
            </div>
          </div>
        </div>
      </Card>

      {/* CONTENT TABS */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {["personal", "job", "compensation", "assets", "changepassword"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2
                ${activeTab === tab
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
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
                {tab === "changepassword" && (
                  <>
                    <Key size={18} /> Đổi mật khẩu
                  </>
                )}
              </button>
            )
          )}
        </div>

        <div className="p-6">
          {/* TAB 1: PERSONAL INFO */}
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <User size={18} /> Thông tin cơ bản
                </h3>
                <div className="space-y-4">
                  <ProfileField label="Họ và tên" value={profile.fullName} />
                  <ProfileField
                    label="Ngày sinh"
                    value={formatDate(profile.birthDate)}
                  />
                  <ProfileField
                    label="Giới tính"
                    value={
                      profile.gender === "Male"
                        ? "Nam"
                        : profile.gender === "Female"
                          ? "Nữ"
                          : "Khác"
                    }
                  />
                  <ProfileField
                    label="CCCD/CMND"
                    value={profile.identityCard}
                  />
                  <ProfileField
                    label="Mã số thuế"
                    value={profile.taxIdentification}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <Phone size={18} /> Liên hệ
                </h3>
                <div className="space-y-4">
                  <ProfileField
                    label="Email cá nhân"
                    value={profile.personalEmail}
                    icon={<Mail size={14} />}
                  />
                  <ProfileField
                    label="Số điện thoại"
                    value={profile.phoneNumber}
                    icon={<Phone size={14} />}
                  />
                  <ProfileField
                    label="Địa chỉ"
                    value={profile.address}
                    icon={<MapPin size={14} />}
                  />
                </div>

                <div className="mt-6 pt-4 rounded-lg border-red-200 border bg-red-50 p-3">
                  <h4 className="text-sm font-bold text-red-600 mb-3 uppercase flex items-center gap-2">
                    <AlertCircle size={14} /> Liên hệ khẩn cấp
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileField
                      label="Họ tên"
                      value={profile.emergencyContact?.name}
                    />
                    <ProfileField
                      label="SĐT"
                      value={profile.emergencyContact?.phone}
                      className="text-red-700 font-bold"
                    />
                    <ProfileField
                      label="Quan hệ"
                      value={profile.emergencyContact?.relation}
                      className="col-span-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JOB INFO */}
          {activeTab === "job" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 animate-in fade-in duration-300">
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Thông tin vị trí
                </h3>
                <div className="space-y-4">
                  <ProfileField label="Mã nhân viên" value={profile.employeeCode} />
                  <ProfileField
                    label="Phòng ban"
                    value={profile.department}
                  />
                  <ProfileField label="Chức danh" value={profile.jobTitle} />
                  <ProfileField label="Cấp bậc (Level)" value={profile.jobLevel} />
                  <ProfileField label="Email công việc" value={profile.workEmail} />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
                  Hợp đồng lao động
                </h3>
                <div className="space-y-4">
                  <ProfileField label="Số hợp đồng" value={profile.contractNumber} />
                  <ProfileField label="Loại hợp đồng" value={profile.contractType} />
                  <div className="grid grid-cols-2 gap-4">
                    <ProfileField
                      label="Ngày bắt đầu"
                      value={formatDate(profile.contractStartDate)}
                    />
                    <ProfileField
                      label="Ngày kết thúc"
                      value={formatDate(profile.contractEndDate)}
                    />
                  </div>
                  <ProfileField
                    label="Ngày vào làm chính thức"
                    value={formatDate(profile.startDate)}
                  />
                  <ProfileField
                    label="Phép năm còn lại"
                    value={`${profile.annualLeaveBalance} ngày`}
                    className="text-green-600 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPENSATION */}
          {activeTab === "compensation" && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="bg-[#1e293b] text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-1">
                        Mức lương cơ bản (Gross)
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold tracking-tight">
                          {showSalary
                            ? formatCurrency(profile.baseSalary)
                            : "••••••••• VND"}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg">
                      <button
                        onClick={() => setShowSalary(!showSalary)}
                        className="text-slate-400 hover:text-white transition p-1"
                        type="button"
                      >
                        {showSalary ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-700 my-6"></div>

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-slate-400 text-xs uppercase mb-1">
                        Phụ cấp ăn trưa
                      </p>
                      <p className="text-lg font-semibold">
                        {showSalary
                          ? formatCurrency(profile.allowances?.lunch)
                          : "••••••"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs uppercase mb-1">
                        Phụ cấp xăng xe
                      </p>
                      <p className="text-lg font-semibold">
                        {showSalary
                          ? formatCurrency(profile.allowances?.fuel)
                          : "••••••"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Landmark size={20} className="text-blue-600" /> Tài khoản nhận lương
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-1">Ngân hàng</p>
                    <p className="text-base font-bold text-gray-800">
                      {profile.bankAccount?.bankName || "--"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase mb-1">Số tài khoản</p>
                    <p className="text-base font-mono font-bold text-gray-800 tracking-wide">
                      {showSalary 
                        ? (profile.bankAccount?.accountNumber || "--")
                        : profile.bankAccount?.accountNumber ? "••••••••" : "--"
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex gap-3 items-start text-sm border border-yellow-100">
                <Shield size={18} className="shrink-0 mt-0.5" />
                <p>
                  Thông tin lương là bảo mật tuyệt đối. Vui lòng không chia sẻ màn hình
                  này với người khác. Chi tiết thu nhập thực nhận (Net) xem tại phiếu
                  lương hàng tháng.
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
              <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <Monitor size={48} className="mx-auto text-gray-300 mb-3" />
                <p>Hiện chưa có dữ liệu tài sản bàn giao.</p>
              </div>
            </div>
          )}

          {/* TAB 5: CHANGE PASSWORD */}
          {activeTab === "changepassword" && (
            <div className="max-w-xl mx-auto animate-in fade-in duration-300">
              <Card className="border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Key size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Đổi mật khẩu</h3>
                    <p className="text-sm text-gray-500">
                      Mật khẩu mới tối thiểu 8 ký tự.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-5">
                  <InputGroup
                    label="Mật khẩu hiện tại"
                    required
                    error={pwErrors.currentPassword}
                  >
                    <div className="relative">
                      <input
                        type={showPw.current ? "text" : "password"}
                        name="currentPassword"
                        value={pwForm.currentPassword}
                        onChange={handlePwChange}
                        className={
                          pwErrors.currentPassword
                            ? errorInputClassName
                            : inputClassName
                        }
                        placeholder="Nhập mật khẩu hiện tại"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPw((p) => ({ ...p, current: !p.current }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        title={showPw.current ? "Ẩn" : "Hiện"}
                      >
                        {showPw.current ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </InputGroup>

                  <InputGroup
                    label="Mật khẩu mới"
                    required
                    error={pwErrors.newPassword}
                  >
                    <div className="relative">
                      <input
                        type={showPw.next ? "text" : "password"}
                        name="newPassword"
                        value={pwForm.newPassword}
                        onChange={handlePwChange}
                        className={
                          pwErrors.newPassword ? errorInputClassName : inputClassName
                        }
                        placeholder="Nhập mật khẩu mới"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        title={showPw.next ? "Ẩn" : "Hiện"}
                      >
                        {showPw.next ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </InputGroup>

                  <InputGroup
                    label="Xác nhận mật khẩu mới"
                    required
                    error={pwErrors.confirmPassword}
                  >
                    <div className="relative">
                      <input
                        type={showPw.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={pwForm.confirmPassword}
                        onChange={handlePwChange}
                        className={
                          pwErrors.confirmPassword
                            ? errorInputClassName
                            : inputClassName
                        }
                        placeholder="Nhập lại mật khẩu mới"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPw((p) => ({ ...p, confirm: !p.confirm }))
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        title={showPw.confirm ? "Ẩn" : "Hiện"}
                      >
                        {showPw.confirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </InputGroup>

                  <div className="pt-4 border-t border-gray-200 flex justify-end">
                    <Button
                      type="submit"
                      disabled={pwSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-8 py-3"
                    >
                      {pwSubmitting ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                      ) : (
                        <Save className="mr-2" size={18} />
                      )}
                      Cập nhật mật khẩu
                    </Button>
                  </div>

                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-100 flex gap-2 items-start">
                    <Shield size={16} className="shrink-0 mt-0.5" />
                    <p>
                      Vui lòng không chia sẻ mật khẩu. Nếu nghi ngờ bị lộ tài khoản, hãy đổi
                      mật khẩu ngay.
                    </p>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const ProfileField = ({ label, value, icon, className = "" }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
      {icon} {label}
    </span>
    <span
      className={`text-sm font-medium text-gray-900 border-b border-gray-100 pb-1 ${className}`}
    >
      {value || "--"}
    </span>
  </div>
);

const InputGroup = ({ label, required, children, className, error }) => (
  <div className={`flex flex-col gap-2 ${className || ""}`}>
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-1 animate-pulse">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

export default MyProfile;
