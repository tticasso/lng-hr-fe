import React, { useEffect, useState } from "react";
import { Building2, Users, Calendar, Edit, Trash2, Plus, User, X, Info, Eye } from "lucide-react";
import { departmentApi } from "../../apis/departmentApi";
import { toast } from "react-toastify";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        deptCode: "",
        saturdayPolicy: "ALWAYS_WORK",
        saturdayOffWeeks: [],
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await departmentApi.getAll();
            console.log("DEPARTMENT RES:", res.data.data);
            setDepartments(res.data.data || []);
        } catch (error) {
            console.log("DEPARTMENT ERROR:", error);
            toast.error("Không thể tải dữ liệu phòng ban");
        } finally {
            setLoading(false);
        }
    };

    // Format Saturday Policy
    const getSaturdayPolicyText = (policy, weeks) => {
        if (policy === "ALWAYS_WORK") return "Làm việc tất cả thứ 7";
        if (policy === "ALWAYS_OFF") return "Nghỉ tất cả thứ 7";
        if (policy === "ALTERNATING" && weeks) {
            return `Nghỉ thứ 7 tuần: ${weeks.join(", ")}`;
        }
        return "Chưa cấu hình";
    };

    // Xem chi tiết phòng ban
    const handleViewDetail = async (deptId) => {
        try {
            setLoadingDetail(true);
            setIsDetailModalOpen(true);
            const res = await departmentApi.getById(deptId);
            setSelectedDepartment(res.data?.data || res.data);
        } catch (error) {
            console.error("Error fetching department detail:", error);
            toast.error("Không thể tải chi tiết phòng ban");
            setIsDetailModalOpen(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    // Mở modal thêm mới
    const handleAdd = () => {
        setEditingDepartment(null);
        setFormData({
            name: "",
            deptCode: "",
            saturdayPolicy: "ALWAYS_WORK",
            saturdayOffWeeks: [],
        });
        setIsFormModalOpen(true);
    };

    // Mở modal sửa
    const handleEdit = (dept) => {
        setEditingDepartment(dept);
        setFormData({
            name: dept.name,
            deptCode: dept.deptCode,
            saturdayPolicy: dept.saturdayPolicy || "ALWAYS_WORK",
            saturdayOffWeeks: dept.saturdayOffWeeks || [],
        });
        setIsFormModalOpen(true);
    };

    // Submit form (thêm hoặc sửa)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.deptCode.trim()) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        }

        // Validate saturdayOffWeeks nếu policy là ALTERNATING
        if (formData.saturdayPolicy === "ALTERNATING" && formData.saturdayOffWeeks.length === 0) {
            toast.error("Vui lòng chọn ít nhất một tuần nghỉ thứ 7");
            return;
        }

        const payload = {
            name: formData.name,
            deptCode: formData.deptCode,
            saturdayPolicy: formData.saturdayPolicy,
            saturdayOffWeeks: formData.saturdayPolicy === "ALTERNATING" ? formData.saturdayOffWeeks : [],
        };

        try {
            if (editingDepartment) {
                await departmentApi.update(editingDepartment._id, payload);
                toast.success("Cập nhật phòng ban thành công");
            } else {
                await departmentApi.create(payload);
                toast.success("Thêm phòng ban thành công");
            }

            setIsFormModalOpen(false);
            fetchDepartments();
        } catch (error) {
            console.error("Error saving department:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra");
        }
    };

    // Xóa phòng ban
    const handleDelete = async (dept) => {
        if (!window.confirm(`Bạn có chắc muốn xóa phòng ban "${dept.name}"?`)) {
            return;
        }

        try {
            await departmentApi.delete(dept._id);
            toast.success("Xóa phòng ban thành công");
            fetchDepartments();
        } catch (error) {
            console.error("Error deleting department:", error);
            toast.error("Không thể xóa phòng ban");
        }
    };

    // Toggle week selection
    const toggleWeek = (week) => {
        setFormData((prev) => {
            const weeks = prev.saturdayOffWeeks.includes(week)
                ? prev.saturdayOffWeeks.filter((w) => w !== week)
                : [...prev.saturdayOffWeeks, week].sort((a, b) => a - b);
            return { ...prev, saturdayOffWeeks: weeks };
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Building2 size={28} className="text-blue-600" />
                        Quản lý Phòng ban
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Danh sách các phòng ban trong công ty
                    </p>
                </div>

                <Button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                    <Plus size={18} />
                    Thêm phòng ban
                </Button>
            </div>

            {/* Department List */}
            {loading ? (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-500">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {departments.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-gray-500 border border-gray-200 rounded-lg">
                            Chưa có phòng ban nào
                        </div>
                    ) : (
                        departments.map((dept) => (
                            <Card key={dept._id} className="hover:shadow-lg transition-shadow">
                                <div className="p-6 space-y-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-50 rounded-lg">
                                                <Building2 size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg">
                                                    {dept.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 font-mono">
                                                    {dept.deptCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manager Info */}
                                    {dept.manager && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User size={14} className="text-purple-600" />
                                                <span className="text-gray-600">Quản lý:</span>
                                            </div>
                                            <p className="font-medium text-gray-800 mt-1">
                                                {dept.manager.fullName}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono">
                                                {dept.manager.employeeCode}
                                            </p>
                                        </div>
                                    )}

                                    {/* Info Grid */}
                                    <div className="space-y-2 pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 flex items-center gap-1">
                                                <Calendar size={14} />
                                                Ngày nghỉ/tháng:
                                            </span>
                                            <span className="font-medium text-gray-800">
                                                {dept.monthlyOffDays} ngày
                                            </span>
                                        </div>

                                        <div className="text-sm">
                                            <span className="text-gray-600">Chính sách thứ 7:</span>
                                            <p className="font-medium text-gray-800 mt-1">
                                                {getSaturdayPolicyText(
                                                    dept.saturdayPolicy,
                                                    dept.saturdayOffWeeks
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                                        <button
                                            onClick={() => handleViewDetail(dept._id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Eye size={14} />
                                            Xem
                                        </button>
                                        <button
                                            onClick={() => handleEdit(dept)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Edit size={14} />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Trash2 size={14} />
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Modal Thêm/Sửa Phòng ban */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">
                                {editingDepartment ? "Sửa phòng ban" : "Thêm phòng ban mới"}
                            </h3>
                            <button onClick={() => setIsFormModalOpen(false)}>
                                <X size={20} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên phòng ban <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: Phòng IT"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mã phòng ban <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.deptCode}
                                    onChange={(e) => setFormData({ ...formData, deptCode: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: IT"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Chính sách thứ 7
                                </label>
                                <select
                                    value={formData.saturdayPolicy}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            saturdayPolicy: e.target.value,
                                            saturdayOffWeeks: e.target.value === "ALTERNATING" ? formData.saturdayOffWeeks : [],
                                        })
                                    }
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="ALWAYS_WORK">Làm việc tất cả thứ 7</option>
                                    <option value="ALWAYS_OFF">Nghỉ tất cả thứ 7</option>
                                    <option value="ALTERNATING">Nghỉ luân phiên</option>
                                </select>
                            </div>

                            {formData.saturdayPolicy === "ALTERNATING" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Chọn các tuần nghỉ thứ 7 <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((week) => (
                                            <button
                                                key={week}
                                                type="button"
                                                onClick={() => toggleWeek(week)}
                                                className={`w-12 h-12 rounded-lg font-bold text-sm transition-all ${
                                                    formData.saturdayOffWeeks.includes(week)
                                                        ? "bg-blue-600 text-white border-2 border-blue-600"
                                                        : "bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-400"
                                                }`}
                                            >
                                                {week}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Đã chọn: {formData.saturdayOffWeeks.length > 0 ? formData.saturdayOffWeeks.join(", ") : "Chưa chọn"}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button type="button" variant="secondary" onClick={() => setIsFormModalOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                    {editingDepartment ? "Cập nhật" : "Thêm mới"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Chi tiết Phòng ban */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Info size={20} className="text-blue-600" />
                                Chi tiết Phòng ban
                            </h3>
                            <button onClick={() => setIsDetailModalOpen(false)}>
                                <X size={20} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </div>

                        {loadingDetail ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
                                <p className="text-sm text-gray-500">Đang tải...</p>
                            </div>
                        ) : selectedDepartment ? (
                            <div className="p-6 space-y-6">
                                {/* Header Card */}
                                <div className="flex items-center gap-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div className="p-4 bg-blue-500 text-white rounded-2xl shadow-lg">
                                        <Building2 size={40} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-2xl font-bold text-gray-800 mb-1">
                                            {selectedDepartment.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 font-mono">
                                            Mã phòng ban: {selectedDepartment.deptCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Manager Info */}
                                {selectedDepartment.manager && (
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="text-xs text-purple-700 mb-2 font-medium uppercase flex items-center gap-1">
                                            <User size={12} />
                                            Quản lý phòng ban
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                                                <User size={24} className="text-purple-700" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800">
                                                    {selectedDepartment.manager.fullName}
                                                </p>
                                                <p className="text-sm text-gray-600 font-mono">
                                                    {selectedDepartment.manager.employeeCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Monthly Off Days */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                                            Ngày nghỉ/tháng
                                        </p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {selectedDepartment.monthlyOffDays}
                                            <span className="text-sm font-normal text-gray-600 ml-1">ngày</span>
                                        </p>
                                    </div>

                                    {/* Saturday Policy */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
                                            Chính sách thứ 7
                                        </p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {getSaturdayPolicyText(
                                                selectedDepartment.saturdayPolicy,
                                                selectedDepartment.saturdayOffWeeks
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Saturday Off Weeks Detail */}
                                {selectedDepartment.saturdayPolicy === "ALTERNATING" &&
                                    selectedDepartment.saturdayOffWeeks &&
                                    selectedDepartment.saturdayOffWeeks.length > 0 && (
                                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                            <p className="text-xs text-amber-700 mb-3 font-medium uppercase flex items-center gap-1">
                                                <Calendar size={12} />
                                                Các tuần nghỉ thứ 7
                                            </p>
                                            <div className="flex gap-2">
                                                {selectedDepartment.saturdayOffWeeks.map((week) => (
                                                    <div
                                                        key={week}
                                                        className="w-12 h-12 bg-amber-100 border-2 border-amber-300 rounded-lg flex items-center justify-center"
                                                    >
                                                        <span className="text-lg font-bold text-amber-700">
                                                            {week}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                {/* Timestamps */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                                        <p className="text-sm text-gray-800 font-medium">
                                            {new Date(selectedDepartment.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(selectedDepartment.createdAt).toLocaleTimeString("vi-VN")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Cập nhật lần cuối</p>
                                        <p className="text-sm text-gray-800 font-medium">
                                            {new Date(selectedDepartment.updatedAt).toLocaleDateString("vi-VN")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(selectedDepartment.updatedAt).toLocaleTimeString("vi-VN")}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsDetailModalOpen(false)}
                                    >
                                        Đóng
                                    </Button>
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                                        <Edit size={16} />
                                        Chỉnh sửa
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                Không có dữ liệu
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Department;