import React, { useState, useEffect, useMemo } from "react";
import { Users, Calendar, TrendingUp, TrendingDown, Search, Filter, RefreshCw, Loader2, Edit, X, Save, AlertCircle, Plus, Minus } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { leavebalanceAPI } from "../../apis/leavebalaneAPI";
import { toast } from "react-toastify";

const LeaveBalance = () => {
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [yearFilter, setYearFilter] = useState("2026");
    
    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        totalAccrued: 0,
        reason: ""
    });
    const [editErrors, setEditErrors] = useState({});

    // Adjust Modal State
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustLoading, setAdjustLoading] = useState(false);
    const [adjustForm, setAdjustForm] = useState({
        amount: 0,
        reason: "",
        action: "ADD" // "ADD" | "SUBTRACT"
    });
    const [adjustErrors, setAdjustErrors] = useState({});

    useEffect(() => {
        callAPI();
    }, []);

    const callAPI = async () => {
        setLoading(true);
        try {
            const res = await leavebalanceAPI.get();
            console.log("res :", res);
            const data = res?.data?.data || [];
            setLeaveBalances(data);
        } catch (error) {
            console.log("error :", error);
        } finally {
            setLoading(false);
        }
    };

    // Lọc dữ liệu theo search và year
    const filteredData = useMemo(() => {
        return leaveBalances.filter(item => {
            const matchesSearch = !searchTerm || 
                item.employeeId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.employeeId?.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesYear = !yearFilter || item.year.toString() === yearFilter;
            
            return matchesSearch && matchesYear;
        });
    }, [leaveBalances, searchTerm, yearFilter]);

    // Tính toán thống kê
    const stats = useMemo(() => {
        const totalEmployees = filteredData.length;
        const totalBalance = filteredData.reduce((sum, item) => sum + item.currentBalance, 0);
        const totalUsed = filteredData.reduce((sum, item) => sum + item.totalUsed, 0);
        const totalAccrued = filteredData.reduce((sum, item) => sum + item.totalAccrued, 0);
        
        return { totalEmployees, totalBalance, totalUsed, totalAccrued };
    }, [filteredData]);

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };
    // Edit Modal Functions
    const openEditModal = (leaveBalance) => {
        setSelectedLeaveBalance(leaveBalance);
        setEditForm({
            totalAccrued: leaveBalance.totalAccrued,
            reason: ""
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedLeaveBalance(null);
        setEditForm({ totalAccrued: 0, reason: "" });
        setEditErrors({});
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: name === 'totalAccrued' ? Number(value) : value
        }));
        
        // Clear error khi user bắt đầu nhập
        if (editErrors[name]) {
            setEditErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateEditForm = () => {
        const errors = {};
        
        // Validate totalAccrued
        if (editForm.totalAccrued < 0) {
            errors.totalAccrued = "Số ngày phép không được âm";
        } else if (editForm.totalAccrued > 365) {
            errors.totalAccrued = "Số ngày phép không được vượt quá 365 ngày";
        }
        
        // Validate reason
        const reason = editForm.reason.trim();
        if (!reason) {
            errors.reason = "Lý do điều chỉnh là bắt buộc";
        } else if (reason.length < 5) {
            errors.reason = "Lý do phải có ít nhất 5 ký tự";
        } else if (reason.length > 500) {
            errors.reason = "Lý do không được vượt quá 500 ký tự";
        }
        
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdateLeaveBalance = async () => {
        console.log("handleUpdateLeaveBalance called"); // Debug log
        
        if (!selectedLeaveBalance) {
            console.log("No selected leave balance");
            return;
        }
        
        // Validate form
        if (!validateEditForm()) {
            console.log("Validation failed");
            toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
            return;
        }

        console.log("Starting API call...");
        setEditLoading(true);
        try {
            const payload = {
                totalAccrued: editForm.totalAccrued,
                reason: editForm.reason.trim()
            };

            console.log("Update payload:", payload);
            console.log("Leave Balance ID:", selectedLeaveBalance._id);

            await leavebalanceAPI.put(selectedLeaveBalance._id, payload);
            console.log("API call successful");
            toast.success("Cập nhật số dư phép thành công!");
            closeEditModal();
            await callAPI(); // Refresh data
        } catch (error) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Cập nhật thất bại");
        } finally {
            setEditLoading(false);
        }
    };

    // Adjust Modal Functions
    const openAdjustModal = (leaveBalance) => {
        setSelectedLeaveBalance(leaveBalance);
        setAdjustForm({
            amount: 0,
            reason: "",
            action: "ADD"
        });
        setAdjustErrors({});
        setShowAdjustModal(true);
    };

    const closeAdjustModal = () => {
        setShowAdjustModal(false);
        setSelectedLeaveBalance(null);
        setAdjustForm({ amount: 0, reason: "", action: "ADD" });
        setAdjustErrors({});
    };

    const handleAdjustFormChange = (e) => {
        const { name, value } = e.target;
        setAdjustForm(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
        
        // Clear error khi user bắt đầu nhập
        if (adjustErrors[name]) {
            setAdjustErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateAdjustForm = () => {
        const errors = {};
        
        // Validate amount
        if (adjustForm.amount <= 0) {
            errors.amount = "Số ngày điều chỉnh phải lớn hơn 0";
        } else if (adjustForm.amount > 365) {
            errors.amount = "Số ngày điều chỉnh không được vượt quá 365 ngày";
        }
        
        // Validate reason
        const reason = adjustForm.reason.trim();
        if (!reason) {
            errors.reason = "Lý do điều chỉnh là bắt buộc";
        } else if (reason.length < 5) {
            errors.reason = "Lý do phải có ít nhất 5 ký tự";
        } else if (reason.length > 500) {
            errors.reason = "Lý do không được vượt quá 500 ký tự";
        }
        
        setAdjustErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAdjustLeaveBalance = async () => {
        if (!selectedLeaveBalance) {
            return;
        }
        
        // Validate form
        if (!validateAdjustForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
            return;
        }

        setAdjustLoading(true);
        try {
            const payload = {
                amount: adjustForm.amount,
                reason: adjustForm.reason.trim(),
                action: adjustForm.action
            };

            console.log("Adjust payload:", payload);
            console.log("Leave Balance ID:", selectedLeaveBalance._id);

            await leavebalanceAPI.patch(selectedLeaveBalance._id, payload);
            toast.success("Điều chỉnh số dư phép thành công!");
            closeAdjustModal();
            await callAPI(); // Refresh data
        } catch (error) {
            console.error("Adjust error:", error);
            toast.error(error.response?.data?.message || "Điều chỉnh thất bại");
        } finally {
            setAdjustLoading(false);
        }
    };
    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Quản lý số dư phép</h1>
                        <p className="text-sm text-gray-500">
                            Theo dõi số dư phép năm của nhân viên ({filteredData.length} bản ghi)
                        </p>
                    </div>
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2"
                        onClick={callAPI}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
        

            {/* Filters - Fixed */}
            <Card className="p-4 flex-shrink-0 mb-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    {/* <div className="flex gap-3">
                        <div className="relative">
                            <Filter
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <select
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer min-w-[120px]"
                            >
                                <option value="">Tất cả năm</option>
                                <option value="2026">2026</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                    </div> */}
                </div>
            </Card>
            {/* Data Table - Scrollable */}
            <Card className="p-0 overflow-hidden border border-gray-200 flex-1 flex flex-col">
                <div className="overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Loader2 size={40} className="animate-spin text-blue-500 mb-2" />
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Calendar size={48} className="mb-3 text-gray-300" />
                            <p>Không tìm thấy dữ liệu phù hợp.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                                <tr className="text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                    <th className="p-4 w-10">#</th>
                                    <th className="p-4">Nhân viên</th>
                                    <th className="p-4">Năm</th>
                                    {/* <th className="p-4">Tỷ lệ/tháng</th> */}
                                    {/* <th className="p-4">Đã tích lũy</th> */}
                                    <th className="p-4">Đã sử dụng</th>
                                    <th className="p-4">Số dư hiện tại</th>
                                    <th className="p-4">Chuyển từ năm trước</th>
                                    <th className="p-4">Cập nhật cuối</th>
                                    <th className="p-4 text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredData.map((item, index) => (
                                    <tr
                                        key={item._id}
                                        className="group transition-colors hover:bg-blue-50/50"
                                    >
                                        <td className="p-4 text-sm text-gray-500">
                                            {index + 1}
                                        </td>

                                        {/* Employee Info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 border border-white shadow-sm flex items-center justify-center text-blue-700 font-bold text-sm overflow-hidden shrink-0">
                                                    <span>
                                                        {(item.employeeId?.fullName || "U")
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {item.employeeId?.fullName || "N/A"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {item.employeeId?.employeeCode || "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Year */}
                                        <td className="p-4">
                                            <span className="font-mono text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {item.year}
                                            </span>
                                        </td>

                                        {/* Monthly Rate */}
                                        {/* <td className="p-4 text-sm text-gray-600">
                                            {item.monthlyRate} ngày/tháng
                                        </td> */}

                                        {/* Total Accrued */}
                                        {/* <td className="p-4">
                                            <span className="text-sm font-medium text-green-600">
                                                {item.totalAccrued} ngày
                                            </span>
                                        </td> */}

                                        {/* Total Used */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium text-red-600">
                                                {item.totalUsed} ngày
                                            </span>
                                        </td>

                                        {/* Current Balance */}
                                        <td className="p-4">
                                            <span className={`text-sm font-bold px-2 py-1 rounded ${
                                                item.currentBalance > 0 
                                                    ? "text-green-700 bg-green-100" 
                                                    : item.currentBalance === 0
                                                    ? "text-gray-700 bg-gray-100"
                                                    : "text-red-700 bg-red-100"
                                            }`}>
                                                {item.currentBalance} ngày
                                            </span>
                                        </td>

                                        {/* Carried Over */}
                                        <td className="p-4 text-sm text-gray-600">
                                            {item.carriedOver} ngày
                                        </td>

                                        {/* Last Updated */}
                                        <td className="p-4 text-sm text-gray-600">
                                            {formatDate(item.updatedAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="Chỉnh sửa số dư phép"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openAdjustModal(item)}
                                                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                    title="Điều chỉnh số dư phép"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination Info - Fixed at bottom */}
                {!loading && filteredData.length > 0 && (
                    <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
                        Hiển thị <strong>{filteredData.length}</strong> bản ghi
                    </div>
                )}
            </Card>
            {/* Edit Modal */}
            {showEditModal && selectedLeaveBalance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-green-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Edit className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Chỉnh sửa số dư phép</h3>
                                    <p className="text-xs text-gray-500">
                                        {selectedLeaveBalance.employeeId?.fullName} ({selectedLeaveBalance.employeeId?.employeeCode})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeEditModal}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Current Info */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-gray-700 text-sm">Thông tin hiện tại:</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Đã tích lũy:</span>
                                        <span className="font-medium text-green-600 ml-2">
                                            {selectedLeaveBalance.totalAccrued} ngày
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Đã sử dụng:</span>
                                        <span className="font-medium text-red-600 ml-2">
                                            {selectedLeaveBalance.totalUsed} ngày
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Số dư:</span>
                                        <span className="font-medium text-blue-600 ml-2">
                                            {selectedLeaveBalance.currentBalance} ngày
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Năm:</span>
                                        <span className="font-medium text-gray-700 ml-2">
                                            {selectedLeaveBalance.year}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tổng phép tích lũy mới <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="totalAccrued"
                                        value={editForm.totalAccrued}
                                        onChange={handleEditFormChange}
                                        min="0"
                                        max="365"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            editErrors.totalAccrued 
                                                ? "border-red-500 focus:ring-red-200" 
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                        placeholder="Nhập số ngày phép"
                                    />
                                    {editErrors.totalAccrued && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {editErrors.totalAccrued}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lý do điều chỉnh <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={editForm.reason}
                                        onChange={handleEditFormChange}
                                        rows="3"
                                        maxLength="500"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                                            editErrors.reason 
                                                ? "border-red-500 focus:ring-red-200" 
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                        placeholder="VD: Điều chỉnh phép năm do thâm niên, bổ sung phép theo quy định..."
                                    />
                                    <div className="flex justify-between items-start mt-1">
                                        <div>
                                            {editErrors.reason && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {editErrors.reason}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {editForm.reason.length}/500
                                        </p>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                    <h5 className="font-medium text-blue-800 text-sm mb-2">Xem trước thay đổi:</h5>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Phép tích lũy:</span>
                                            <span className="font-medium">
                                                {selectedLeaveBalance.totalAccrued} → {editForm.totalAccrued} ngày
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Số dư mới:</span>
                                            <span className="font-medium text-blue-600">
                                                {editForm.totalAccrued - selectedLeaveBalance.totalUsed} ngày
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                            <Button
                                variant="secondary"
                                onClick={closeEditModal}
                                disabled={editLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleUpdateLeaveBalance}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {editLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save size={16} />
                                )}
                                Lưu thay đổi
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Adjust Modal */}
            {showAdjustModal && selectedLeaveBalance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Plus className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Điều chỉnh số dư phép</h3>
                                    <p className="text-xs text-gray-500">
                                        {selectedLeaveBalance.employeeId?.fullName} ({selectedLeaveBalance.employeeId?.employeeCode})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeAdjustModal}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Current Info */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <h4 className="font-semibold text-gray-700 text-sm">Thông tin hiện tại:</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Đã tích lũy:</span>
                                        <span className="font-medium text-green-600 ml-2">
                                            {selectedLeaveBalance.totalAccrued} ngày
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Đã sử dụng:</span>
                                        <span className="font-medium text-red-600 ml-2">
                                            {selectedLeaveBalance.totalUsed} ngày
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Số dư:</span>
                                        <span className="font-medium text-blue-600 ml-2">
                                            {selectedLeaveBalance.currentBalance} ngày
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Năm:</span>
                                        <span className="font-medium text-gray-700 ml-2">
                                            {selectedLeaveBalance.year}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Adjust Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại điều chỉnh <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="action"
                                                value="ADD"
                                                checked={adjustForm.action === "ADD"}
                                                onChange={handleAdjustFormChange}
                                                className="text-green-600 focus:ring-green-500"
                                            />
                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <Plus size={14} />
                                                Cộng thêm
                                            </span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="action"
                                                value="SUBTRACT"
                                                checked={adjustForm.action === "SUBTRACT"}
                                                onChange={handleAdjustFormChange}
                                                className="text-red-600 focus:ring-red-500"
                                            />
                                            <span className="text-sm text-red-600 font-medium flex items-center gap-1">
                                                <Minus size={14} />
                                                Trừ bớt
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số ngày điều chỉnh <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={adjustForm.amount}
                                        onChange={handleAdjustFormChange}
                                        min="1"
                                        max="365"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                            adjustErrors.amount 
                                                ? "border-red-500 focus:ring-red-200" 
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                        placeholder="Nhập số ngày cần điều chỉnh"
                                    />
                                    {adjustErrors.amount && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {adjustErrors.amount}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lý do điều chỉnh <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={adjustForm.reason}
                                        onChange={handleAdjustFormChange}
                                        rows="3"
                                        maxLength="500"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                                            adjustErrors.reason 
                                                ? "border-red-500 focus:ring-red-200" 
                                                : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                        placeholder="VD: Điều chỉnh do sai sót, bổ sung phép đặc biệt, khấu trừ do vi phạm..."
                                    />
                                    <div className="flex justify-between items-start mt-1">
                                        <div>
                                            {adjustErrors.reason && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {adjustErrors.reason}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            {adjustForm.reason.length}/500
                                        </p>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className={`rounded-lg p-3 border ${
                                    adjustForm.action === "ADD" 
                                        ? "bg-green-50 border-green-200" 
                                        : "bg-red-50 border-red-200"
                                }`}>
                                    <h5 className={`font-medium text-sm mb-2 ${
                                        adjustForm.action === "ADD" ? "text-green-800" : "text-red-800"
                                    }`}>
                                        Xem trước thay đổi:
                                    </h5>
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Số dư hiện tại:</span>
                                            <span className="font-medium">
                                                {selectedLeaveBalance.currentBalance} ngày
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Điều chỉnh:</span>
                                            <span className={`font-medium ${
                                                adjustForm.action === "ADD" ? "text-green-600" : "text-red-600"
                                            }`}>
                                                {adjustForm.action === "ADD" ? "+" : "-"}{adjustForm.amount} ngày
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1">
                                            <span className="text-gray-600">Số dư sau điều chỉnh:</span>
                                            <span className={`font-bold ${
                                                adjustForm.action === "ADD" 
                                                    ? "text-green-600" 
                                                    : selectedLeaveBalance.currentBalance - adjustForm.amount >= 0
                                                        ? "text-blue-600"
                                                        : "text-red-600"
                                            }`}>
                                                {adjustForm.action === "ADD" 
                                                    ? selectedLeaveBalance.currentBalance + adjustForm.amount
                                                    : selectedLeaveBalance.currentBalance - adjustForm.amount
                                                } ngày
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                            <Button
                                variant="secondary"
                                onClick={closeAdjustModal}
                                disabled={adjustLoading}
                            >
                                Hủy
                            </Button>
                            <Button
                                onClick={handleAdjustLeaveBalance}
                                className={`flex items-center gap-2 text-white ${
                                    adjustForm.action === "ADD" 
                                        ? "bg-green-600 hover:bg-green-700" 
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {adjustLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : adjustForm.action === "ADD" ? (
                                    <Plus size={16} />
                                ) : (
                                    <Minus size={16} />
                                )}
                                {adjustForm.action === "ADD" ? "Cộng thêm" : "Trừ bớt"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveBalance;