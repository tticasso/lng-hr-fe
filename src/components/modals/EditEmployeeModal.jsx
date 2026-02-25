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
// VN phone: 0 / 84 / +84 + (3|5|7|8|9) + 8 digits
const VIETNAM_PHONE_REGEX = /^(\+84|84|0)(3|5|7|8|9)\d{8}$/;

// Email
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// CCCD/CMND: 9–12 digits only
const IDENTITY_CARD_DIGITS_REGEX = /^\d+$/;
const IDENTITY_CARD_LENGTH_REGEX = /^\d{9,12}$/;

// ISO date: YYYY-MM-DD (input type="date" trả về format này)
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const isISODate = (v) => !!v && ISO_DATE_REGEX.test(v);
// --- NORMALIZE HELPERS ---
const normalizeSpaces = (v) =>
  String(v ?? "")
    .replace(/\s+/g, "")
    .trim(); // bỏ mọi space
const normalizeTrim = (v) => String(v ?? "").trim(); // chỉ trim đầu/cuối

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
        console.log("CHECK LOG : ", deptRes);
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
  const validateForm = () => {
    const newErrors = {};

    // 1) employeeCode (5-10 characters)
    const employeeCode = normalizeTrim(formData.employeeCode);
    if (!employeeCode) {
      newErrors.employeeCode = "Employee code is required";
    } else if (employeeCode.length < 5 || employeeCode.length > 10) {
      newErrors.employeeCode =
        "Employee code must be between 5 and 10 characters";
    }

    // 2) jobTitle (required)
    const jobTitle = normalizeTrim(formData.jobTitle);
    if (!jobTitle) {
      newErrors.jobTitle = "Job title cannot be empty";
    }

    // 3) phoneNumber (VN format)
    const phone = normalizeSpaces(formData.phoneNumber);
    if (!phone) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!VIETNAM_PHONE_REGEX.test(phone)) {
      newErrors.phoneNumber =
        "Phone number is not in the correct Vietnamese format";
    }

    // 4) birthDate (ISO yyyy-mm-dd)
    const birthDate = normalizeTrim(formData.birthDate);
    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
    } else if (!isISODate(birthDate)) {
      newErrors.birthDate = "Birth date must be a valid ISO8601 date format";
    }

    // 5) identityCard (digits only + length 9-12)
    const id = normalizeSpaces(formData.identityCard);
    if (id) {
      if (!IDENTITY_CARD_DIGITS_REGEX.test(id)) {
        newErrors.identityCard = "ID number must contain only digits";
      } else if (!IDENTITY_CARD_LENGTH_REGEX.test(id)) {
        newErrors.identityCard = "ID number must be between 9 and 12 digits";
      }
    }

    // 6) personalEmail (required + format)
    const personalEmail = normalizeTrim(formData.personalEmail);
    if (!personalEmail) {
      newErrors.personalEmail = "Personal email is required";
    } else if (!EMAIL_REGEX.test(personalEmail)) {
      newErrors.personalEmail = "Personal email is invalid";
    }

    // 7) workEmail (required + format)
    const workEmail = normalizeTrim(formData.workEmail);
    if (!workEmail) {
      newErrors.workEmail = "Work email is required";
    } else if (!EMAIL_REGEX.test(workEmail)) {
      newErrors.workEmail = "Work email is invalid";
    }

    // 8) fullName (required)
    const fullName = normalizeTrim(formData.fullName);
    if (!fullName) {
      newErrors.fullName = "Full name is required";
    }

    // 9) department (required)
    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Vui lòng kiểm tra lại các trường báo lỗi màu đỏ.");
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Format number with dots (1.000.000)
  const formatNumberWithDots = (value) => {
    if (!value && value !== 0) return "";
    const numValue = value.toString().replace(/\./g, "");
    return numValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Handle money input change
  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    // Remove all dots and parse to number
    const numericValue = value.replace(/\./g, "");
    setFormData((prev) => ({
      ...prev,
      [name]: numericValue ? Number(numericValue) : 0,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Normalize dữ liệu trước khi validate và submit
    const phone = normalizeSpaces(formData.phoneNumber);
    const id = normalizeSpaces(formData.identityCard);
    const personalEmail = normalizeTrim(formData.personalEmail);
    const workEmail = normalizeTrim(formData.workEmail);
    const birthDate = normalizeTrim(formData.birthDate);
    const employeeCode = normalizeTrim(formData.employeeCode);
    const jobTitle = normalizeTrim(formData.jobTitle);

    if (!validateForm()) return;

    setUpdating(true);
    try {
      const employeeId = employee._id || employee.id;

      // Construct payload matching Mongoose Schema
      const submitData = {
        // Identity - Đảm bảo không gửi empty string
        employeeCode: employeeCode || undefined,
        fullName: normalizeTrim(formData.fullName) || undefined,
        gender: formData.gender || undefined,
        birthDate: birthDate || undefined,
        taxIdentification:
          normalizeTrim(formData.taxIdentification) || undefined,

        // Contacts - Đảm bảo format đúng
        phoneNumber: phone || undefined,
        address: normalizeTrim(formData.address) || undefined,
        personalEmail: personalEmail || undefined,
        workEmail: workEmail || undefined,
        contractStartDate: formatDateInput(formData.contractStartDate),
        contractEndDate: formatDateInput(formData.contractEndDate),
        // Organization - Đảm bảo có giá trị
        departmentId: formData.department || undefined,
        jobTitle: jobTitle || undefined,
        jobLevel: normalizeTrim(formData.jobLevel) || undefined,
        employmentType: formData.employmentType || undefined,
        workMode: formData.workMode || undefined,
        status: formData.status || undefined,
        identityCard: formData.identityCard || "",
        // Lifecycle
        startDate: normalizeTrim(formData.startDate) || undefined,
        probationEndDate: normalizeTrim(formData.probationEndDate) || undefined,

        // Nested Objects Reconstruction
        emergencyContact: {
          name: normalizeTrim(formData.emergencyName) || undefined,
          phone: normalizeSpaces(formData.emergencyPhone) || undefined,
          relation: normalizeTrim(formData.emergencyRelation) || undefined,
        },

        bankAccount: {
          bankName: normalizeTrim(formData.bankName) || undefined,
          accountNumber:
            normalizeSpaces(formData.bankAccountNumber) || undefined,
        },

        // Compensation
        baseSalary: Number(formData.baseSalary) || 0,
        allowances: {
          lunch: Number(formData.lunchAllowance) || 0,
          fuel: Number(formData.fuelAllowance) || 0,
          other: 0,
        },

        // Contract info
        contractNumber: normalizeTrim(formData.contractNumber) || undefined,
        contractType: normalizeTrim(formData.contractType) || undefined,
      };

      // Remove undefined values để không gửi lên backend
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      console.log("Submitting data:", submitData); // Debug log

      await employeeApi.updateEmployee(employeeId, submitData);
      toast.success(`Cập nhật nhân viên ${formData.fullName} thành công!`);
      onSuccess();
    } catch (error) {
      console.error("Update failed:", error);
      console.error("Error response:", error.response?.data); // Debug log

      // Xử lý validation errors từ backend
      if (
        error.response?.data?.errors &&
        Array.isArray(error.response.data.errors)
      ) {
        const backendErrors = {};
        error.response.data.errors.forEach((err) => {
          if (err.field && err.message) {
            backendErrors[err.field] = err.message;
          }
        });

        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
          toast.error("Vui lòng kiểm tra lại các trường báo lỗi màu đỏ.");
          return;
        }
      }

      // Lỗi khác (không phải validation)
      toast.error(error.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    console.log("LƯƠNG :", formData.baseSalary);
    console.log("LƯƠNG 2: ", employee);
  }, [formData.baseSalary]);
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
                      <ErrorMsg field="department" />
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
                      <ErrorMsg field="jobTitle" />
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
                      <label className={labelClass}>Ngày vào làm</label>
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
                      <ErrorMsg field="birthDate" />
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
                    <label className={labelClass}>CCCD / CMND</label>
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
                    <label className={labelClass}>Họ tên người thân</label>
                    <input
                      name="emergencyName"
                      value={formData.emergencyName}
                      onChange={handleChange}
                      className={inputClass("emergencyName")}
                    />
                    <ErrorMsg field="emergencyName" />
                  </div>
                  <div>
                    <label className={labelClass}>Mối quan hệ</label>
                    <input
                      name="emergencyRelation"
                      value={formData.emergencyRelation}
                      onChange={handleChange}
                      className={inputClass("emergencyRelation")}
                    />
                    <ErrorMsg field="emergencyRelation" />
                  </div>
                  <div>
                    <label className={labelClass}>SĐT Người thân</label>
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
                      type="text"
                      name="baseSalary"
                      value={formatNumberWithDots(formData.baseSalary)}
                      onChange={handleMoneyChange}
                      className={`${inputClass("baseSalary")} font-bold text-blue-600`}
                      placeholder="0"
                    />
                    <ErrorMsg field="baseSalary" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Phụ cấp ăn trưa</label>
                      <input
                        type="text"
                        name="lunchAllowance"
                        value={formatNumberWithDots(formData.lunchAllowance)}
                        onChange={handleMoneyChange}
                        className={inputClass("lunchAllowance")}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phụ cấp xăng xe</label>
                      <input
                        type="text"
                        name="fuelAllowance"
                        value={formatNumberWithDots(formData.fuelAllowance)}
                        onChange={handleMoneyChange}
                        className={inputClass("fuelAllowance")}
                        placeholder="0"
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
