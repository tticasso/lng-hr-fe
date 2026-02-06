import React, { useState } from "react";
import { X, Loader2, User, Key, Shield } from "lucide-react";
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

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // 1. Required Fields
    if (!formData.username.trim())
      newErrors.username = "Username cannot be empty";
    if (!formData.password.trim())
      newErrors.password = "Password cannot be empty";
    if (formData.password.length < 6)
      newErrors.password = "The minimum allowed length (6).";
    if (!formData.roleName.trim()) newErrors.roleName = "Role cannot be empty";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Vui lòng kiểm tra lại thông tin nhập liệu.");
    } else {
      setErrors({});
    }

    return isValid;
  };
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.password || !formData.roleId) {
      toast.warn("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    // Map Role ID sang Role Name theo yêu cầu payload
    const selectedRole = rolesList.find((r) => r._id === formData.roleId);
    if (!selectedRole) return;

    const payload = {
      username: formData.username,
      password: formData.password,
      roleName: selectedRole.name, // Gửi roleName thay vì ID
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
  const ErrorMsg = ({ field }) =>
    errors[field] && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <AlertCircle size={10} /> {errors[field]}
      </p>
    );
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Tạo tài khoản mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
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
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Nhập tên đăng nhập..."
              />
            </div>
          </div>

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
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>

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
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer"
              >
                <option value="">-- Chọn vai trò --</option>
                {rolesList.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
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
