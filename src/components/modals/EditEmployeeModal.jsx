import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Briefcase,
  User,
  Phone,
  AlertCircle,
  Hash,
  CreditCard,
  FileText,
  Landmark, // Icon ngân hàng
} from "lucide-react";
import Button from "../common/Button";
import { employeeApi } from "../../apis/employeeApi";
import { departmentApi } from "../../apis/departmentApi";
import { toast } from "react-toastify";

// --- REGEX & CONSTANTS ---
const VIETNAM_PHONE_REGEX = /^(0|84)(3|5|7|8|9)([0-9]{8})$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const IDENTITY_CARD_REGEX = /^(\d{9}|\d{12})$/;

const EditEmployeeModal = ({ employee, onClose, onSuccess }) => {
  // Helper format date
  const formatDateInput = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const [departments, setDepartments] = useState([]);
  const [banks, setBanks] = useState([]); // [MỚI] State lưu danh sách ngân hàng
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize State
  // Initialize State correctly mapping from Mongoose Model Structure
  const [formData, setFormData] = useState({
    // --- 1. Công việc & Tổ chức ---
    fullName: employee.fullName || "",
    employeeCode: employee.employeeCode || "",
    status: employee.status || "Probation",
    // Model dùng departmentId, UI dùng department. Map logic ở đây:
    department:
      typeof employee.departmentId === "object"
        ? employee.departmentId?._id
        : employee.departmentId || "",
    jobTitle: employee.jobTitle || "",
    jobLevel: employee.jobLevel || "",
    employmentType: employee.employmentType || "Full-time",
    workMode: employee.workMode || "Onsite",
    workEmail: employee.workEmail || "",
    startDate: formatDateInput(employee.startDate),

    // Lưu ý: Model chưa có annualLeaveBalance, giữ tạm để UI không lỗi
    annualLeaveBalance: employee.annualLeaveBalance || 0,

    // --- 2. Lương & Phụ cấp (Mapping từ object allowances) ---
    baseSalary: employee.baseSalary || 0,
    lunchAllowance: employee.allowances?.lunch || 0, // Map từ allowances.lunch
    fuelAllowance: employee.allowances?.fuel || 0, // Map từ allowances.fuel

    // --- 3. Hợp đồng (Model chưa có, giữ nguyên UI nhưng Backend có thể không lưu) ---
    contractNumber: employee.contractNumber || "",
    contractType: employee.contractType || "",
    contractStartDate: formatDateInput(employee.contractStartDate),
    contractEndDate: formatDateInput(employee.contractEndDate),
    probationEndDate: formatDateInput(employee.probationEndDate),

    // --- 4. Cá nhân & Pháp lý ---
    gender: employee.gender || "Other",
    birthDate: formatDateInput(employee.birthDate),
    identityCard: employee.identityCard || "",
    taxIdentification: employee.taxIdentification || "",
    personalEmail: employee.personalEmail || "",
    phoneNumber: employee.phoneNumber || "",
    address: employee.address || "",

    // --- 5. Ngân hàng (Mapping từ object bankAccount) ---
    bankName: employee.bankAccount?.bankName || "",
    bankAccountNumber: employee.bankAccount?.accountNumber || "",

    // --- 6. Khẩn cấp (Mapping từ object emergencyContact) ---
    emergencyName: employee.emergencyContact?.name || "",
    emergencyPhone: employee.emergencyContact?.phone || "",
    emergencyRelation: employee.emergencyContact?.relation || "",
  });

  // Fetch Departments & Banks
  useEffect(() => {
    const fetchData = async () => {
      setLoadingDepts(true);
      try {
        // 1. Fetch Departments (Internal API)
        const deptRes = await departmentApi.getAll();
        const deptList = deptRes.data?.data || deptRes.data || [];
        setDepartments(deptList);

        // 2. Fetch Banks (External API - VietQR) [MỚI]
        const bankRes = await fetch("https://api.vietqr.io/v2/banks");
        const bankData = await bankRes.json();
        if (bankData.code === "00") {
          setBanks(bankData.data);
        }
      } catch (error) {
        console.error("Failed to load metadata", error);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchData();
  }, []);

  // --- VALIDATION LOGIC ---
  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // --- NHÓM 1: CÔNG VIỆC (Các trường bắt buộc *) ---

    // Mã NV *
    if (!formData.employeeCode.trim()) {
      newErrors.employeeCode = "Mã nhân viên là bắt buộc";
    } else if (formData.employeeCode.length < 3) {
      newErrors.employeeCode = "Mã nhân viên quá ngắn";
    }

    // Họ tên *
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Tên phải có ít nhất 2 ký tự";
    }

    // Phòng ban *
    if (!formData.department) {
      newErrors.department = "Vui lòng chọn phòng ban";
    }

    // Chức danh *
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Chức danh là bắt buộc";
    }

    // Email công việc *
    if (!formData.workEmail.trim()) {
      newErrors.workEmail = "Email công việc là bắt buộc";
    } else if (!EMAIL_REGEX.test(formData.workEmail)) {
      newErrors.workEmail = "Email công việc không hợp lệ";
    }

    // Ngày vào làm *
    if (!formData.startDate) {
      newErrors.startDate = "Ngày vào làm là bắt buộc";
    }

    // --- NHÓM 2: CÁ NHÂN (Các trường bắt buộc *) ---

    // Ngày sinh *
    if (!formData.birthDate) {
      newErrors.birthDate = "Ngày sinh là bắt buộc";
    }

    // CCCD / CMND *
    if (!formData.identityCard.trim()) {
      newErrors.identityCard = "CCCD/CMND là bắt buộc";
    } else if (!IDENTITY_CARD_REGEX.test(formData.identityCard)) {
      newErrors.identityCard = "CCCD phải gồm 9 hoặc 12 chữ số";
    }

    // SĐT Cá nhân *
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "SĐT cá nhân là bắt buộc";
    } else if (!VIETNAM_PHONE_REGEX.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "SĐT không đúng định dạng VN";
    }

    // Email Cá nhân *
    if (!formData.personalEmail.trim()) {
      newErrors.personalEmail = "Email cá nhân là bắt buộc";
    } else if (!EMAIL_REGEX.test(formData.personalEmail)) {
      newErrors.personalEmail = "Email cá nhân không hợp lệ";
    }

    // --- NHÓM 3: LIÊN HỆ KHẨN CẤP (Các trường bắt buộc *) ---

    // Họ tên người thân *
    if (!formData.emergencyName.trim()) {
      newErrors.emergencyName = "Tên người liên hệ là bắt buộc";
    }

    // Mối quan hệ *
    if (!formData.emergencyRelation.trim()) {
      newErrors.emergencyRelation = "Mối quan hệ là bắt buộc";
    }

    // SĐT Người thân *
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = "SĐT người thân là bắt buộc";
    } else if (!VIETNAM_PHONE_REGEX.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = "SĐT không đúng định dạng VN";
    }

    // --- NHÓM 4: LOGIC SỐ HỌC (Lương & Phụ cấp) ---
    if (Number(formData.baseSalary) < 0)
      newErrors.baseSalary = "Lương không được âm";
    if (Number(formData.lunchAllowance) < 0)
      newErrors.lunchAllowance = "Phụ cấp không được âm";
    if (Number(formData.fuelAllowance) < 0)
      newErrors.fuelAllowance = "Phụ cấp không được âm";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Vui lòng kiểm tra lại các trường báo lỗi màu đỏ.");
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!validateForm()) return;

    setUpdating(true);
    try {
      const employeeId = employee._id || employee.id;

      // Construct payload matching Mongoose Schema
      const submitData = {
        // Identity
        employeeCode: formData.employeeCode,
        fullName: formData.fullName,
        gender: formData.gender,
        birthDate: formData.birthDate,
        identityCard: formData.identityCard,
        taxIdentification: formData.taxIdentification,

        // Contacts
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        personalEmail: formData.personalEmail,
        workEmail: formData.workEmail,

        // Organization
        departmentId: formData.department, // Backend expects departmentId
        jobTitle: formData.jobTitle,
        jobLevel: formData.jobLevel,
        employmentType: formData.employmentType,
        workMode: formData.workMode,
        status: formData.status,

        // Lifecycle
        startDate: formData.startDate,
        probationEndDate: formData.probationEndDate,

        // Nested Objects Reconstruction
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },

        bankAccount: {
          bankName: formData.bankName,
          accountNumber: formData.bankAccountNumber,
        },

        // Compensation
        baseSalary: Number(formData.baseSalary),
        allowances: {
          lunch: Number(formData.lunchAllowance),
          fuel: Number(formData.fuelAllowance),
          other: 0, // Default logic
        },

        // nếu backend chưa update schema thì gửi lên sẽ bị lọc bỏ (strip).
        contractNumber: formData.contractNumber,
        contractType: formData.contractType,
      };

      delete submitData.bankName;
      delete submitData.bankAccountNumber;

      await employeeApi.updateEmployee(employeeId, submitData);
      toast.success(`Cập nhật nhân viên ${formData.fullName} thành công!`);
      onSuccess();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setUpdating(false);
    }
  };

  // --- UI HELPERS ---
  const inputClass = (field) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${errors[field] ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`;
  const labelClass =
    "block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide";
  const ErrorMsg = ({ field }) =>
    errors[field] && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={10} /> {errors[field]}
      </p>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Cập nhật hồ sơ nhân
              viên
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Mã NV:{" "}
              <span className="font-mono font-bold text-blue-700">
                {formData.employeeCode}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 bg-gray-50/30"
        >
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* COLUMN 1: CÔNG VIỆC & HỢP ĐỒNG */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                <h4 className="font-bold text-blue-700 flex items-center gap-2 mb-4 border-b pb-2">
                  <Briefcase size={16} /> Thông tin công việc
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className={labelClass}>
                      Mã NV <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash
                        size={14}
                        className="absolute left-3 top-2.5 text-gray-400"
                      />
                      <input
                        name="employeeCode"
                        value={formData.employeeCode}
                        onChange={handleChange}
                        className={`${inputClass("employeeCode")} pl-9`}
                      />
                    </div>
                    <ErrorMsg field="employeeCode" />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={inputClass("fullName")}
                      required
                    />
                    <ErrorMsg field="fullName" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Phòng ban <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className={inputClass("department")}
                        disabled={loadingDepts}
                      >
                        <option value="">-- Chọn --</option>
                        {departments.map((d) => (
                          <option key={d._id} value={d._id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Chức danh <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className={inputClass("jobTitle")}
                      >
                        <option value="">-- Chọn --</option>
                        <option value="Seller">Seller</option>
                        <option value="Developer">Developer</option>
                        <option value="HR">HR</option>
                        <option value="Manager">Manager</option>
                      </select>
                    </div>
                  </div>
                  {/* ... (Giữ nguyên các trường khác như Cấp bậc, Trạng thái, Hình thức...) ... */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Cấp bậc</label>
                      <input
                        name="jobLevel"
                        value={formData.jobLevel}
                        onChange={handleChange}
                        className={inputClass("jobLevel")}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Trạng thái</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={inputClass("status")}
                      >
                        <option value="Active">Active</option>
                        <option value="Probation">Probation</option>
                        <option value="Resigned">Resigned</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Hình thức</label>
                      <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className={inputClass("employmentType")}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Chế độ</label>
                      <select
                        name="workMode"
                        value={formData.workMode}
                        onChange={handleChange}
                        className={inputClass("workMode")}
                      >
                        <option value="Onsite">Onsite</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      Email Công việc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="workEmail"
                      value={formData.workEmail}
                      onChange={handleChange}
                      className={inputClass("workEmail")}
                    />
                    <ErrorMsg field="workEmail" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Ngày vào làm <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className={inputClass("startDate")}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phép năm tồn</label>
                      <input
                        type="number"
                        name="annualLeaveBalance"
                        value={formData.annualLeaveBalance}
                        onChange={handleChange}
                        className={inputClass("annualLeaveBalance")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hợp đồng lao động */}
              <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
                <h4 className="font-bold text-purple-700 flex items-center gap-2 mb-4 border-b pb-2">
                  <FileText size={16} /> Hợp đồng lao động
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelClass}>Số hợp đồng</label>
                    <input
                      name="contractNumber"
                      value={formData.contractNumber}
                      onChange={handleChange}
                      className={inputClass("contractNumber")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Loại hợp đồng</label>
                    <input
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleChange}
                      className={inputClass("contractType")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ngày bắt đầu</label>
                    <input
                      type="date"
                      name="contractStartDate"
                      value={formData.contractStartDate}
                      onChange={handleChange}
                      className={inputClass("contractStartDate")}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ngày kết thúc</label>
                    <input
                      type="date"
                      name="contractEndDate"
                      value={formData.contractEndDate}
                      onChange={handleChange}
                      className={inputClass("contractEndDate")}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Kết thúc thử việc</label>
                    <input
                      type="date"
                      name="probationEndDate"
                      value={formData.probationEndDate}
                      onChange={handleChange}
                      className={inputClass("probationEndDate")}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: CÁ NHÂN & PHÁP LÝ */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                <h4 className="font-bold text-green-700 flex items-center gap-2 mb-4 border-b pb-2">
                  <User size={16} /> Thông tin cá nhân
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Ngày sinh <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        className={inputClass("birthDate")}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Giới tính</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={inputClass("gender")}
                      >
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                        <option value="Other">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>
                      CCCD / CMND <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="identityCard"
                      value={formData.identityCard}
                      onChange={handleChange}
                      className={inputClass("identityCard")}
                    />
                    <ErrorMsg field="identityCard" />
                  </div>
                  <div>
                    <label className={labelClass}>Mã số thuế</label>
                    <input
                      name="taxIdentification"
                      value={formData.taxIdentification}
                      onChange={handleChange}
                      className={inputClass("taxIdentification")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        SĐT Cá nhân <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className={inputClass("phoneNumber")}
                      />
                      <ErrorMsg field="phoneNumber" />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Email Cá nhân <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="personalEmail"
                        value={formData.personalEmail}
                        onChange={handleChange}
                        className={inputClass("personalEmail")}
                      />
                      <ErrorMsg field="personalEmail" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Địa chỉ thường trú</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={inputClass("address")}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                <h4 className="font-bold text-red-700 flex items-center gap-2 mb-4 border-b pb-2">
                  <Phone size={16} /> Liên hệ khẩn cấp
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className={labelClass}>
                      Họ tên người thân <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      className={inputClass("emergencyName")}
                    />
                    <ErrorMsg field="emergencyName" />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Mối quan hệ <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleChange}
                      className={inputClass("emergencyRelation")}
                    />
                    <ErrorMsg field="emergencyRelation" />
                  </div>
                  <div>
                    <label className={labelClass}>
                      SĐT Người thân <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className={inputClass("emergencyPhone")}
                    />
                    <ErrorMsg field="emergencyPhone" />
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: LƯƠNG & NGÂN HÀNG */}
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-yellow-100 shadow-sm">
                <h4 className="font-bold text-yellow-700 flex items-center gap-2 mb-4 border-b pb-2">
                  <CreditCard size={16} /> Lương & Phụ cấp
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className={labelClass}>Lương cơ bản (VND)</label>
                    <input
                      type="number"
                      name="baseSalary"
                      value={formData.baseSalary}
                      onChange={handleChange}
                      className={`${inputClass("baseSalary")} font-bold text-blue-600`}
                    />
                    <ErrorMsg field="baseSalary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Phụ cấp ăn trưa</label>
                      <input
                        type="number"
                        name="lunchAllowance"
                        value={formData.lunchAllowance}
                        onChange={handleChange}
                        className={inputClass("lunchAllowance")}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phụ cấp xăng xe</label>
                      <input
                        type="number"
                        name="fuelAllowance"
                        value={formData.fuelAllowance}
                        onChange={handleChange}
                        className={inputClass("fuelAllowance")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* [UPDATED] NGÂN HÀNG: SỬ DỤNG DROPDOWN TỪ API VIETQR */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-4 border-b pb-2">
                  <Landmark size={16} /> Tài khoản ngân hàng
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className={labelClass}>Tên ngân hàng</label>
                    <select
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className={inputClass("bankName")}
                    >
                      <option value="">-- Chọn ngân hàng --</option>
                      {banks.map((bank) => (
                        <option key={bank.id} value={bank.shortName}>
                          {bank.shortName} - {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Số tài khoản</label>
                    <input
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      className={inputClass("bankAccountNumber")}
                      placeholder="VD: 1903..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={updating}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {updating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}{" "}
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
