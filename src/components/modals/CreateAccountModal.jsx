import React, { useState } from "react";
import { X, Loader2, User, Key, Shield, AlertCircle } from "lucide-react";
import Button from "../common/Button";
import { accountApi } from "../../apis/accountApi";
import { toast } from "react-toastify";

const CreateAccountModal = ({ onClose, onSuccess, rolesList }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    roleId: "", // Lưu ID để hiển thị select, lúc gửi sẽ map sang Name
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 1. Username
    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    }

    // 2. Password (Min 6 chars)
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    // 3. Role (Check roleId)
    if (!formData.roleId) {
      newErrors.roleId = "Vui lòng chọn vai trò cho tài khoản";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      // toast.error("Vui lòng kiểm tra lại thông tin nhập liệu."); // Có thể bỏ nếu đã hiện text đỏ
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const selectedRole = rolesList.find((r) => r._id === formData.roleId);
    if (!selectedRole) return;

    const payload = {
      username: formData.username,
      password: formData.password,
      roleName: selectedRole.name,
    };

    setLoading(true);
    try {
      await accountApi.create(payload);
      toast.success("Tạo tài khoản thành công!");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo thất bại");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper hiển thị lỗi
  const ErrorMsg = ({ field }) =>
    errors[field] && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-pulse">
        <AlertCircle size={10} /> {errors[field]}
      </p>
    );

  // Helper class border đỏ khi lỗi
  const getInputClass = (fieldName) =>
    `w-full pl-9 pr-4 py-2.5 border rounded-lg outline-none text-sm transition-all ${
      errors[fieldName]
        ? "border-red-500 focus:ring-2 focus:ring-red-200 bg-red-50"
        : "border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white"
    }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Tạo tài khoản mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={getInputClass("username")}
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
            <ErrorMsg field="username" />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Key size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={getInputClass("password")}
                placeholder="Tối thiểu 6 ký tự..."
              />
            </div>
            <ErrorMsg field="password" />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò (Role) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield
                size={16}
                className="absolute left-3 top-3 text-gray-400"
              />
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className={`${getInputClass("roleId")} cursor-pointer`}
              >
                <option value="">-- Chọn vai trò --</option>
                {rolesList.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <ErrorMsg field="roleId" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin" />} Tạo mới
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;
