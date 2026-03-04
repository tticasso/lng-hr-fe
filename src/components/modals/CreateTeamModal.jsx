import React, { useState, useEffect } from "react";
import { X, Users, Building2, Crown, Loader2, Plus, Edit } from "lucide-react";
import { teamAPI } from "../../apis/teamAPI";
import { departmentApi } from "../../apis/departmentApi";
import { employeeApi } from "../../apis/employeeApi";
import { toast } from "react-toastify";

const CreateTeamModal = ({ isOpen, onClose, onSuccess, teamData = null }) => {
    const isEditMode = !!teamData;
    const [loading, setLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        name: "",
        teamCode: "",
        departmentId: "",
        leader: "",
        description: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchDepartmentsAndEmployees();
            if (isEditMode && teamData) {
                // Populate form with existing data
                setFormData({
                    name: teamData.name || "",
                    teamCode: teamData.teamCode || "",
                    departmentId: teamData.departmentId?._id || "",
                    leader: teamData.leader?._id || "",
                    description: teamData.description || "",
                });
            } else {
                resetForm();
            }
        }
    }, [isOpen, teamData]);

    const fetchDepartmentsAndEmployees = async () => {
        setLoadingData(true);
        try {
            const [deptRes, empRes] = await Promise.all([
                departmentApi.getAll(),
                employeeApi.getAll()
            ]);

            const deptData = deptRes?.data?.data || [];
            const empData = empRes?.data?.data || [];

            setDepartments(deptData);
            setEmployees(empData);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Không thể tải dữ liệu phòng ban và nhân viên");
        } finally {
            setLoadingData(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            teamCode: "",
            departmentId: "",
            leader: "",
            description: "",
        });
        setErrors({});
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Tên team là bắt buộc";
        }

        if (!formData.teamCode.trim()) {
            newErrors.teamCode = "Mã team là bắt buộc";
        }

        if (!formData.departmentId) {
            newErrors.departmentId = "Vui lòng chọn phòng ban";
        }

        if (!formData.leader) {
            newErrors.leader = "Vui lòng chọn team leader";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                teamCode: formData.teamCode.trim(),
                departmentId: formData.departmentId,
                leader: formData.leader,
                description: formData.description.trim(),
            };

            console.log(`${isEditMode ? 'Update' : 'Create'} Team Payload:`, payload);

            let response;
            if (isEditMode) {
                response = await teamAPI.update(teamData._id, payload);
                console.log("Update Team Response:", response);
                toast.success("Cập nhật team thành công!");
            } else {
                response = await teamAPI.post(payload);
                console.log("Create Team Response:", response);
                toast.success("Tạo team thành công!");
            }

            onSuccess && onSuccess();
            onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} team:`, error);
            const errorMessage = error?.response?.data?.message || 
                `${isEditMode ? 'Cập nhật' : 'Tạo'} team thất bại`;
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            {isEditMode ? (
                                <Edit className="text-blue-600" size={24} />
                            ) : (
                                <Plus className="text-blue-600" size={24} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditMode ? "Cập Nhật Team" : "Tạo Team Mới"}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {isEditMode ? "Chỉnh sửa thông tin team" : "Thêm team mới vào hệ thống"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Team Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên Team <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`pl-10 pr-4 py-2 w-full border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.name ? "border-red-500" : "border-gray-300"
                                        }`}
                                        placeholder="Nhập tên team..."
                                    />
                                </div>
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

                            {/* Team Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mã Team <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="teamCode"
                                    value={formData.teamCode}
                                    onChange={handleChange}
                                    className={`px-4 py-2 w-full border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.teamCode ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="Nhập mã team (VD: DEV, SALE-01)..."
                                />
                                {errors.teamCode && (
                                    <p className="text-red-500 text-xs mt-1">{errors.teamCode}</p>
                                )}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phòng Ban <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        name="departmentId"
                                        value={formData.departmentId}
                                        onChange={handleChange}
                                        className={`pl-10 pr-4 py-2 w-full border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.departmentId ? "border-red-500" : "border-gray-300"
                                        }`}
                                    >
                                        <option value="">-- Chọn phòng ban --</option>
                                        {departments.map((dept) => (
                                            <option key={dept._id} value={dept._id}>
                                                {dept.name} ({dept.deptCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.departmentId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.departmentId}</p>
                                )}
                            </div>

                            {/* Team Leader */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Team Leader <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Crown size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                                    <select
                                        name="leader"
                                        value={formData.leader}
                                        onChange={handleChange}
                                        className={`pl-10 pr-4 py-2 w-full border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.leader ? "border-red-500" : "border-gray-300"
                                        }`}
                                    >
                                        <option value="">-- Chọn team leader --</option>
                                        {employees.map((emp) => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.fullName} ({emp.employeeCode})
                                                {emp.departmentId?.name && ` - ${emp.departmentId.name}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.leader && (
                                    <p className="text-red-500 text-xs mt-1">{errors.leader}</p>
                                )}
                            </div>

                            {/* Description */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mô Tả
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="px-4 py-2 w-full border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Nhập mô tả về team (không bắt buộc)..."
                                />
                            </div> */}

                            {/* Preview Selected Data */}
                            {(formData.departmentId || formData.leader) && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Thông tin đã chọn:</h4>
                                    <div className="space-y-1 text-sm text-gray-700">
                                        {formData.departmentId && (
                                            <p>
                                                <span className="font-medium">Phòng ban:</span>{" "}
                                                {departments.find(d => d._id === formData.departmentId)?.name}
                                            </p>
                                        )}
                                        {formData.leader && (
                                            <p>
                                                <span className="font-medium">Leader:</span>{" "}
                                                {employees.find(e => e._id === formData.leader)?.fullName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading || loadingData}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {isEditMode ? "Đang cập nhật..." : "Đang tạo..."}
                            </>
                        ) : (
                            <>
                                {isEditMode ? (
                                    <>
                                        <Edit size={16} />
                                        Cập Nhật
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Tạo Team
                                    </>
                                )}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTeamModal;
