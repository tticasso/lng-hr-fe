import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Users, Calendar, TrendingUp, TrendingDown, Search, Filter, RefreshCw, Loader2, Edit, X, Save, AlertCircle, Plus, Minus, History } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { leavebalanceAPI } from "../../apis/leavebalaneAPI";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/authPermissions";
import { formatEmployeeCode } from "../../utils/employeeDisplay";
import { matchesSearchText } from "../../utils/searchText";
import {
    getLeaveBalanceReadMode,
    LEAVE_BALANCE_READ_MODES,
    LEAVE_BALANCE_WRITE_PERMISSION,
} from "./leaveBalanceAccess";

const buildPageList = (current, total) => {
    if (total <= 1) return [1];
    const pages = [1];
    if (current > 3) pages.push("...");

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i += 1) {
        pages.push(i);
    }

    if (current < total - 2) pages.push("...");
    if (total > 1) pages.push(total);
    return pages;
};

const HISTORY_ACTION_LABELS = {
    INITIAL_SETUP: "Khởi tạo",
    MONTHLY_ACCRUAL: "Cộng phép tháng",
    LEAVE_DEDUCTION: "Trừ phép",
    MANUAL_ADJUSTMENT: "Điều chỉnh thủ công",
    ANNUAL_RESET: "Reset năm",
    CARRY_OVER: "Chuyển phép",
    CARRY_OVER_RESET: "Reset phép chuyển",
    LEAVE_CANCEL_REFUND: "Hoàn phép do huỷ đơn",
};

const getHistoryActionLabel = (action) => HISTORY_ACTION_LABELS[action] || action || "Cập nhật";

const getHistoryTone = (amount) => {
    if (Number(amount) > 0) return "text-green-700 bg-green-50 border-green-200";
    if (Number(amount) < 0) return "text-red-700 bg-red-50 border-red-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
};

const getSortedHistory = (leaveBalance) =>
    [...(leaveBalance?.history || [])].sort(
        (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );

const formatHistoryDateTime = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString("vi-VN");
};

const LeaveBalanceHistoryList = ({ leaveBalance, limit }) => {
    const historyItems = getSortedHistory(leaveBalance);
    const visibleItems = limit ? historyItems.slice(0, limit) : historyItems;

    if (historyItems.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
                Chưa có lịch sử công phép.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {visibleItems.map((item, index) => {
                const amount = Number(item.amount || 0);
                const userLabel = item.user?.username || "Hệ thống";

                return (
                    <div
                        key={item._id || `${item.action}-${item.date}-${index}`}
                        className="rounded-lg border border-gray-200 bg-white p-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800">
                                    {getHistoryActionLabel(item.action)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">{item.reason || "--"}</p>
                            </div>
                            <span
                                className={`shrink-0 rounded-full border px-2 py-1 text-xs font-bold ${getHistoryTone(amount)}`}
                            >
                                {amount > 0 ? "+" : ""}
                                {amount} ngày
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                            <span>{formatHistoryDateTime(item.date)}</span>
                            <span>Người thực hiện: {userLabel}</span>
                        </div>
                    </div>
                );
            })}

            {limit && historyItems.length > limit ? (
                <p className="text-xs text-gray-500">Còn {historyItems.length - limit} dòng lịch sử khác.</p>
            ) : null}
        </div>
    );
};

const LeaveBalance = () => {
    const { user } = useAuth();
    const readMode = useMemo(
        () => getLeaveBalanceReadMode((permission) => hasPermission(user, permission)),
        [user],
    );
    const canUpdateLeave = hasPermission(user, LEAVE_BALANCE_WRITE_PERMISSION);
    const canReadLeaveBalanceDirectory = readMode === LEAVE_BALANCE_READ_MODES.DIRECTORY;
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [yearFilter, setYearFilter] = useState("2026");
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    
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
        action: "MANUAL_ADJUSTMENT" // "ADD" | "LEAVE_DEDUCTION"
    });
    const [adjustErrors, setAdjustErrors] = useState({});
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedLeaveBalanceIds, setSelectedLeaveBalanceIds] = useState([]);
    const [showBulkAdjustModal, setShowBulkAdjustModal] = useState(false);
    const [bulkAdjustLoading, setBulkAdjustLoading] = useState(false);
    const [bulkAdjustForm, setBulkAdjustForm] = useState({
        amount: 0,
        reason: "",
        action: "MANUAL_ADJUSTMENT"
    });
    const [bulkAdjustErrors, setBulkAdjustErrors] = useState({});
    const [bulkPreview, setBulkPreview] = useState(null);
    const [showAccrualModal, setShowAccrualModal] = useState(false);
    const [accrualLoading, setAccrualLoading] = useState(false);

    const callAPI = useCallback(async () => {
        setLoading(true);
        try {
            let data = [];
            if (readMode === LEAVE_BALANCE_READ_MODES.DIRECTORY) {
                const res = await leavebalanceAPI.get();
                data = res?.data?.data || [];
            } else if (readMode === LEAVE_BALANCE_READ_MODES.MINE) {
                const res = await leavebalanceAPI.getMine();
                const myLeaveBalance = res?.data?.data;
                data = myLeaveBalance ? [myLeaveBalance] : [];
            }
            setLeaveBalances(data);
        } catch {
            setLeaveBalances([]);
        } finally {
            setLoading(false);
        }
    }, [readMode]);

    useEffect(() => {
        callAPI();
    }, [callAPI]);

    // Lọc dữ liệu theo search và year
    const filteredData = useMemo(() => {
        return leaveBalances.filter(item => {
            const matchesSearch = matchesSearchText(
                [item.employeeId?.fullName, item.employeeId?.employeeCode],
                searchTerm,
            );
            
            const matchesYear = !yearFilter || item.year.toString() === yearFilter;
            
            return matchesSearch && matchesYear;
        });
    }, [leaveBalances, searchTerm, yearFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pagination.limit));
    const currentPage = Math.min(pagination.page, totalPages);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pagination.limit;
        return filteredData.slice(start, start + pagination.limit);
    }, [currentPage, filteredData, pagination.limit]);
    const visibleLeaveBalanceIds = useMemo(
        () => paginatedData.map((item) => item._id),
        [paginatedData],
    );
    const allVisibleSelected = visibleLeaveBalanceIds.length > 0
        && visibleLeaveBalanceIds.every((id) => selectedLeaveBalanceIds.includes(id));

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    useEffect(() => {
        setPagination((prev) => ({ ...prev, page: 1 }));
        setSelectedLeaveBalanceIds([]);
    }, [searchTerm, yearFilter]);

    useEffect(() => {
        if (pagination.page > totalPages) {
            setPagination((prev) => ({ ...prev, page: totalPages }));
        }
    }, [pagination.page, totalPages]);

    // Edit Modal Functions
    const openEditModal = (leaveBalance) => {
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để điều chỉnh công phép");
            return;
        }

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
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để điều chỉnh công phép");
            return;
        }

        
        if (!selectedLeaveBalance) {
            return;
        }
        
        // Validate form
        if (!validateEditForm()) {
            toast.error("Vui lòng kiểm tra lại thông tin nhập vào");
            return;
        }

        setEditLoading(true);
        try {
            const payload = {
                totalAccrued: editForm.totalAccrued,
                reason: editForm.reason.trim()
            };


            await leavebalanceAPI.put(selectedLeaveBalance._id, payload);
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
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để điều chỉnh công phép");
            return;
        }

        setSelectedLeaveBalance(leaveBalance);
        setAdjustForm({
            amount: 0,
            reason: "",
            action: "MANUAL_ADJUSTMENT"
        });
        setAdjustErrors({});
        setShowAdjustModal(true);
    };

    const closeAdjustModal = () => {
        setShowAdjustModal(false);
        setSelectedLeaveBalance(null);
        setAdjustForm({ amount: 0, reason: "", action: "MANUAL_ADJUSTMENT" });
        setAdjustErrors({});
    };

    const openHistoryModal = async (leaveBalance) => {
        setShowEditModal(false);
        setShowAdjustModal(false);
        setSelectedLeaveBalance(leaveBalance);
        setShowHistoryModal(true);

        if (!leaveBalance?._id) return;

        setHistoryLoading(true);
        try {
            const res = canReadLeaveBalanceDirectory
                ? await leavebalanceAPI.getById(leaveBalance._id)
                : await leavebalanceAPI.getMine();
            setSelectedLeaveBalance(res?.data?.data || leaveBalance);
        } catch (error) {
            toast.error(error.normalizedMessage || "Không thể tải lịch sử công phép");
        } finally {
            setHistoryLoading(false);
        }
    };

    const closeHistoryModal = () => {
        setShowHistoryModal(false);
        setSelectedLeaveBalance(null);
        setHistoryLoading(false);
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

    const validateBulkAdjustForm = () => {
        const errors = {};
        const amount = Number(bulkAdjustForm.amount);
        const reason = bulkAdjustForm.reason.trim();

        if (!Number.isFinite(amount) || amount <= 0 || amount > 365) {
            errors.amount = "Số ngày điều chỉnh phải từ 0 đến 365";
        }
        if (reason.length < 5 || reason.length > 500) {
            errors.reason = "Lý do phải có từ 5 đến 500 ký tự";
        }

        setBulkAdjustErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const openBulkAdjustModal = () => {
        if (!canUpdateLeave || selectedLeaveBalanceIds.length === 0) return;
        setBulkAdjustForm({ amount: 0, reason: "", action: "MANUAL_ADJUSTMENT" });
        setBulkAdjustErrors({});
        setBulkPreview(null);
        setShowBulkAdjustModal(true);
    };

    const closeBulkAdjustModal = () => {
        setShowBulkAdjustModal(false);
        setBulkPreview(null);
        setBulkAdjustErrors({});
    };

    const handleBulkAdjustFormChange = (event) => {
        const { name, value } = event.target;
        setBulkAdjustForm((prev) => ({
            ...prev,
            [name]: name === "amount" ? Number(value) : value
        }));
        setBulkPreview(null);
        if (bulkAdjustErrors[name]) {
            setBulkAdjustErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const buildBulkAdjustPayload = (confirm = false) => ({
        leaveBalanceIds: selectedLeaveBalanceIds,
        amount: Math.abs(Number(bulkAdjustForm.amount)),
        action: bulkAdjustForm.action,
        reason: bulkAdjustForm.reason.trim(),
        ...(confirm ? { confirm: true } : { dryRun: true })
    });

    const handleBulkAdjustPreview = async () => {
        if (!validateBulkAdjustForm()) return;

        setBulkAdjustLoading(true);
        try {
            const response = await leavebalanceAPI.bulkAdjust(buildBulkAdjustPayload());
            setBulkPreview(response?.data?.details || null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Không thể xem trước điều chỉnh");
        } finally {
            setBulkAdjustLoading(false);
        }
    };

    const handleBulkAdjust = async () => {
        if (!canUpdateLeave || !bulkPreview || !validateBulkAdjustForm()) return;

        setBulkAdjustLoading(true);
        try {
            const response = await leavebalanceAPI.bulkAdjust(buildBulkAdjustPayload(true));
            toast.success(`Đã điều chỉnh ${response?.data?.details?.modified || 0} nhân viên`);
            setSelectedLeaveBalanceIds([]);
            closeBulkAdjustModal();
            await callAPI();
        } catch (error) {
            toast.error(error.response?.data?.message || "Điều chỉnh hàng loạt thất bại");
        } finally {
            setBulkAdjustLoading(false);
        }
    };

    const toggleLeaveBalanceSelection = (id) => {
        setSelectedLeaveBalanceIds((selected) => selected.includes(id)
            ? selected.filter((selectedId) => selectedId !== id)
            : [...selected, id]);
    };

    const toggleVisibleLeaveBalanceSelection = () => {
        setSelectedLeaveBalanceIds((selected) => allVisibleSelected
            ? selected.filter((id) => !visibleLeaveBalanceIds.includes(id))
            : [...new Set([...selected, ...visibleLeaveBalanceIds])]);
    };

    const handleAdjustLeaveBalance = async () => {
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để điều chỉnh công phép");
            return;
        }

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
            const signedAmount =
                adjustForm.action === "LEAVE_DEDUCTION"
                    ? -Math.abs(adjustForm.amount)
                    : Math.abs(adjustForm.amount);
            const payload = {
                amount: signedAmount,
                reason: adjustForm.reason.trim(),
                action: adjustForm.action
            };


            const adjustedLeaveBalanceId = selectedLeaveBalance._id;
            await leavebalanceAPI.patch(adjustedLeaveBalanceId, payload);
            toast.success("Điều chỉnh số dư phép thành công!");
            setShowAdjustModal(false);
            setAdjustForm({ amount: 0, reason: "", action: "MANUAL_ADJUSTMENT" });
            setAdjustErrors({});
            await callAPI(); // Refresh data

            try {
                const latestRes = await leavebalanceAPI.getById(adjustedLeaveBalanceId);
                setSelectedLeaveBalance(latestRes?.data?.data || null);
                setShowHistoryModal(true);
            } catch {
                toast.warning("Đã cập nhật công phép nhưng chưa tải được lịch sử mới nhất.");
            }
        } catch (error) {
            console.error("Adjust error:", error);
            toast.error(error.response?.data?.message || "Điều chỉnh thất bại");
        } finally {
            setAdjustLoading(false);
        }
    };

    const runLeaveBalanceJob = async (type) => {
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để vận hành công phép");
            return;
        }

        const selectedYear = Number(yearFilter || new Date().getFullYear());
        const labels = {
            reset: "reset phép năm",
            carry: "chuyển phép năm",
        };
        if (!window.confirm(`Bạn có chắc muốn ${labels[type]}?`)) return;

        try {
            if (type === "reset") await leavebalanceAPI.resetYear({ year: selectedYear });
            if (type === "carry") {
                await leavebalanceAPI.carryOver({
                    fromYear: selectedYear - 1,
                    toYear: selectedYear,
                });
            }
            toast.success("Thao tác thành công");
            await callAPI();
        } catch (error) {
            toast.error(error.normalizedMessage || "Thao tác thất bại");
        }
    };

    const openAccrualModal = () => {
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để vận hành công phép");
            return;
        }
        setShowAccrualModal(true);
    };

    const runManualAccrual = async () => {
        const selectedYear = Number(yearFilter || new Date().getFullYear());
        const currentMonth = new Date().getMonth();

        setAccrualLoading(true);
        try {
            await leavebalanceAPI.triggerManualAccrual({
                date: new Date(selectedYear, currentMonth, 1).toISOString()
            });
            toast.success("Chạy cộng phép thành công");
            setShowAccrualModal(false);
            await callAPI();
        } catch (error) {
            toast.error(error.normalizedMessage || "Chạy cộng phép thất bại");
        } finally {
            setAccrualLoading(false);
        }
    };

    const handleDeleteLeaveBalance = async (leaveBalance) => {
        if (!canUpdateLeave) {
            toast.error("Bạn không có quyền WRITE_LEAVE_BALANCES để xóa số dư phép");
            return;
        }

        if (!window.confirm(`Xóa số dư phép của ${leaveBalance.employeeId?.fullName || "nhân viên này"}?`)) return;

        try {
            await leavebalanceAPI.delete(leaveBalance._id);
            toast.success("Xóa số dư phép thành công");
            await callAPI();
        } catch (error) {
            toast.error(error.normalizedMessage || "Xóa số dư phép thất bại");
        }
    };
    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Header - Fixed */}
            <div className="flex-shrink-0 mb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-800">Quản lý số dư phép</h1>
                        </div>
                        <p className="text-sm text-gray-500">
                            Theo dõi số dư phép năm của nhân viên ({filteredData.length} nhân viên)
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

                    {canUpdateLeave && (
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={openAccrualModal}>
                            Cộng phép
                        </Button>
                        <Button variant="secondary" onClick={() => runLeaveBalanceJob("carry")}>
                            Chuyển phép
                        </Button>
                        <Button variant="secondary" onClick={() => runLeaveBalanceJob("reset")}>
                            Reset năm
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={selectedLeaveBalanceIds.length === 0}
                            onClick={openBulkAdjustModal}
                        >
                            Điều chỉnh đã chọn ({selectedLeaveBalanceIds.length})
                        </Button>
                    </div>
                    )}

                    <div className="flex gap-3">
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
                    </div>
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
                                    {canUpdateLeave && (
                                        <th className="p-4 w-10">
                                            <input
                                                type="checkbox"
                                                aria-label="Chọn tất cả nhân viên trên trang"
                                                checked={allVisibleSelected}
                                                onChange={toggleVisibleLeaveBalanceSelection}
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                    )}
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
                                {paginatedData.map((item, index) => (
                                    <tr
                                        key={item._id}
                                        className="group transition-colors hover:bg-blue-50/50"
                                    >
                                        <td className="p-4 text-sm text-gray-500">
                                            {(currentPage - 1) * pagination.limit + index + 1}
                                        </td>
                                        {canUpdateLeave && (
                                            <td className="p-4">
                                                <input
                                                    type="checkbox"
                                                    aria-label={`Chọn ${item.employeeId?.fullName || "nhân viên"}`}
                                                    checked={selectedLeaveBalanceIds.includes(item._id)}
                                                    onChange={() => toggleLeaveBalanceSelection(item._id)}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                        )}

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
                                                        {formatEmployeeCode(item.employeeId?.employeeCode, "N/A")}
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
                                                    onClick={() => openHistoryModal(item)}
                                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Xem lịch sử công phép"
                                                >
                                                    <History size={16} />
                                                </button>
                                                {canUpdateLeave && (
                                                <>
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
                                                <button
                                                    onClick={() => handleDeleteLeaveBalance(item)}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Xóa số dư phép"
                                                >
                                                    <X size={16} />
                                                </button>
                                                </>
                                                )}
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
                    <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                            <span>
                                Hiển thị <strong>{(currentPage - 1) * pagination.limit + 1}</strong>-<strong>{Math.min(currentPage * pagination.limit, filteredData.length)}</strong> trong tổng số <strong>{filteredData.length}</strong> nhân viên
                            </span>
                            <label className="flex items-center gap-2">
                                <span>Mỗi trang</span>
                                <select
                                    value={pagination.limit}
                                    onChange={(e) =>
                                        setPagination({
                                            page: 1,
                                            limit: Number(e.target.value),
                                        })
                                    }
                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 outline-none"
                                >
                                    {[10, 20, 50].map((limit) => (
                                        <option key={limit} value={limit}>
                                            {limit}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="secondary"
                                className="px-3 py-1.5 text-sm"
                                disabled={currentPage <= 1}
                                onClick={() =>
                                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                                }
                            >
                                Trước
                            </Button>

                            {buildPageList(currentPage, totalPages).map((page, index) =>
                                page === "..." ? (
                                    <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => setPagination((prev) => ({ ...prev, page }))}
                                        className={`min-w-9 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                                            page === currentPage
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <Button
                                variant="secondary"
                                className="px-3 py-1.5 text-sm"
                                disabled={currentPage >= totalPages}
                                onClick={() =>
                                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                                }
                            >
                                Sau
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
            {showAccrualModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex shrink-0 items-center justify-between border-b bg-green-50 p-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Chạy cộng phép thủ công</h3>
                                <p className="text-xs text-gray-500">Xem trước trước khi thực hiện</p>
                            </div>
                            <button type="button" onClick={() => setShowAccrualModal(false)} disabled={accrualLoading} className="rounded-full p-2 hover:bg-white">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="min-h-0 overflow-y-auto p-5">
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-gray-700">
                                <p className="font-semibold text-green-800">Xem trước thay đổi</p>
                                <dl className="mt-3 space-y-2">
                                    <div className="flex justify-between gap-4"><dt>Tháng chạy</dt><dd className="font-medium">{new Date(Number(yearFilter || new Date().getFullYear()), new Date().getMonth(), 1).toLocaleDateString("vi-VN", { month: "long", year: "numeric" })}</dd></div>
                                    <div className="flex justify-between gap-4"><dt>Phạm vi</dt><dd className="text-right font-medium">Toàn bộ nhân viên Active</dd></div>
                                    <div className="flex justify-between gap-4"><dt>Định mức</dt><dd className="font-medium">Theo cấu hình từng nhân viên</dd></div>
                                </dl>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-gray-600">Hệ thống chỉ cộng khi nhân viên chưa được cộng phép cho tháng này; các bản ghi đã có sẽ được bỏ qua để tránh cộng trùng.</p>
                        </div>
                        <div className="flex shrink-0 justify-end gap-3 border-t bg-gray-50 p-4">
                            <Button variant="secondary" onClick={() => setShowAccrualModal(false)} disabled={accrualLoading}>Hủy</Button>
                            <Button onClick={runManualAccrual} disabled={accrualLoading} className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700">
                                {accrualLoading && <Loader2 size={16} className="animate-spin" />}
                                Chạy cộng phép
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {showBulkAdjustModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b bg-blue-50 p-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Điều chỉnh công phép hàng loạt</h3>
                                <p className="text-xs text-gray-500">{selectedLeaveBalanceIds.length} nhân viên đã chọn</p>
                            </div>
                            <button onClick={closeBulkAdjustModal} className="rounded-full p-2 hover:bg-white" disabled={bulkAdjustLoading}>
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4 p-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Loại điều chỉnh</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-green-700">
                                        <input type="radio" name="action" value="MANUAL_ADJUSTMENT" checked={bulkAdjustForm.action === "MANUAL_ADJUSTMENT"} onChange={handleBulkAdjustFormChange} />
                                        Cộng thêm
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-red-700">
                                        <input type="radio" name="action" value="LEAVE_DEDUCTION" checked={bulkAdjustForm.action === "LEAVE_DEDUCTION"} onChange={handleBulkAdjustFormChange} />
                                        Trừ bớt
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Số ngày điều chỉnh</label>
                                <input type="number" name="amount" min="0.25" max="365" step="0.25" value={bulkAdjustForm.amount} onChange={handleBulkAdjustFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {bulkAdjustErrors.amount && <p className="mt-1 text-xs text-red-500">{bulkAdjustErrors.amount}</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Lý do điều chỉnh</label>
                                <textarea name="reason" rows="3" maxLength="500" value={bulkAdjustForm.reason} onChange={handleBulkAdjustFormChange} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {bulkAdjustErrors.reason && <p className="mt-1 text-xs text-red-500">{bulkAdjustErrors.reason}</p>}
                            </div>
                            {bulkPreview && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                                    Sẽ {bulkPreview.amount > 0 ? "cộng" : "trừ"} {Math.abs(bulkPreview.amount)} ngày cho {bulkPreview.totalSelected} nhân viên. Chưa có dữ liệu nào được ghi.
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
                            <Button variant="secondary" onClick={closeBulkAdjustModal} disabled={bulkAdjustLoading}>Hủy</Button>
                            <Button variant="secondary" onClick={handleBulkAdjustPreview} disabled={bulkAdjustLoading}>
                                {bulkAdjustLoading ? <Loader2 size={16} className="animate-spin" /> : "Xem trước"}
                            </Button>
                            <Button onClick={handleBulkAdjust} disabled={bulkAdjustLoading || !bulkPreview} className="bg-blue-600 text-white hover:bg-blue-700">
                                Áp dụng
                            </Button>
                        </div>
                    </div>
                </div>
            )}
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
                                        {selectedLeaveBalance.employeeId?.fullName} ({formatEmployeeCode(selectedLeaveBalance.employeeId?.employeeCode)})
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
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 p-4 sm:items-center">
                    <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                        {/* Header */}
                        <div className="flex shrink-0 items-center justify-between border-b bg-gradient-to-r from-green-50 to-blue-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Plus className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Điều chỉnh số dư phép</h3>
                                    <p className="text-xs text-gray-500">
                                        {selectedLeaveBalance.employeeId?.fullName} ({formatEmployeeCode(selectedLeaveBalance.employeeId?.employeeCode)})
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
                        <div className="min-h-0 space-y-4 overflow-y-auto p-5">
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

                            <div className="rounded-lg border border-gray-200 bg-white p-4">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <History size={16} />
                                        Lịch sử gần đây
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => openHistoryModal(selectedLeaveBalance)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Xem tất cả
                                    </button>
                                </div>
                                <LeaveBalanceHistoryList leaveBalance={selectedLeaveBalance} limit={3} />
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
                                                value="MANUAL_ADJUSTMENT"
                                                checked={adjustForm.action === "MANUAL_ADJUSTMENT"}
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
                                                value="LEAVE_DEDUCTION"
                                                checked={adjustForm.action === "LEAVE_DEDUCTION"}
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
                                    adjustForm.action === "MANUAL_ADJUSTMENT" 
                                        ? "bg-green-50 border-green-200" 
                                        : "bg-red-50 border-red-200"
                                }`}>
                                    <h5 className={`font-medium text-sm mb-2 ${
                                        adjustForm.action === "MANUAL_ADJUSTMENT" ? "text-green-800" : "text-red-800"
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
                                                adjustForm.action === "MANUAL_ADJUSTMENT" ? "text-green-600" : "text-red-600"
                                            }`}>
                                                {adjustForm.action === "MANUAL_ADJUSTMENT" ? "+" : "-"}{adjustForm.amount} ngày
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-t pt-1">
                                            <span className="text-gray-600">Số dư sau điều chỉnh:</span>
                                            <span className={`font-bold ${
                                                adjustForm.action === "MANUAL_ADJUSTMENT" 
                                                    ? "text-green-600" 
                                                    : selectedLeaveBalance.currentBalance - adjustForm.amount >= 0
                                                        ? "text-blue-600"
                                                        : "text-red-600"
                                            }`}>
                                                {adjustForm.action === "MANUAL_ADJUSTMENT" 
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
                        <div className="flex shrink-0 justify-end gap-3 border-t bg-gray-50 p-4">
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
                                    adjustForm.action === "MANUAL_ADJUSTMENT" 
                                        ? "bg-green-600 hover:bg-green-700" 
                                        : "bg-red-600 hover:bg-red-700"
                                }`}
                            >
                                {adjustLoading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : adjustForm.action === "MANUAL_ADJUSTMENT" ? (
                                    <Plus size={16} />
                                ) : (
                                    <Minus size={16} />
                                )}
                                {adjustForm.action === "MANUAL_ADJUSTMENT" ? "Cộng thêm" : "Trừ bớt"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showHistoryModal && selectedLeaveBalance && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b bg-slate-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-slate-100 p-2">
                                    <History className="text-slate-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Lịch sử công phép</h3>
                                    <p className="text-xs text-gray-500">
                                        {selectedLeaveBalance.employeeId?.fullName} ({formatEmployeeCode(selectedLeaveBalance.employeeId?.employeeCode)})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeHistoryModal}
                                className="rounded-full p-2 transition-colors hover:bg-white"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 border-b bg-white p-4 text-sm">
                            <div>
                                <p className="text-xs uppercase text-gray-400">Tích luỹ</p>
                                <p className="font-semibold text-green-700">{selectedLeaveBalance.totalAccrued} ngày</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400">Đã dùng</p>
                                <p className="font-semibold text-red-700">{selectedLeaveBalance.totalUsed} ngày</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-gray-400">Còn lại</p>
                                <p className="font-semibold text-blue-700">{selectedLeaveBalance.currentBalance} ngày</p>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50 p-4">
                            {historyLoading ? (
                                <div className="flex h-40 items-center justify-center text-gray-500">
                                    <Loader2 size={24} className="mr-2 animate-spin" />
                                    Đang tải lịch sử...
                                </div>
                            ) : (
                                <LeaveBalanceHistoryList leaveBalance={selectedLeaveBalance} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveBalance;


