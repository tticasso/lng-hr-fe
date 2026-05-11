import { useState, useEffect } from "react";
import { X, Users, Crown, User, Loader2, Plus, UserPlus, CalendarSync, Trash2, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { teamAPI } from "../../apis/teamAPI";
import { employeeApi } from "../../apis/employeeApi";
import { saturdayRotations } from "../../apis/saturday-rotations";
import { useAuth } from "../../context/AuthContext";

const StatusBadge = ({ status }) => {
    const statusConfig = {
        Active: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", label: "Đang làm việc" },
        Probation: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", label: "Thử việc" },
        Inactive: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Nghỉ việc" },
        OnLeave: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", label: "Nghỉ phép" },
    };

    const config = statusConfig[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", label: status };

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${config.bg} ${config.text} border ${config.border}`}>
            {config.label}
        </span>
    );
};

const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
    };
};

const getRotationSyncSummary = (response) =>
    response?.data?.data?.syncSummary || response?.data?.syncSummary || null;

const formatPayrollReviewList = (items) =>
    items
        .slice(0, 3)
        .map((item) => item.employeeCode || item.fullName || item.employeeId)
        .filter(Boolean)
        .join(", ");

const TeamDetailModal = ({ isOpen, onClose, teamId }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [teamDetail, setTeamDetail] = useState(null);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [addMemberLoading, setAddMemberLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [memBer, setMemBer] = useState(Number);
    const [rotationData, setRotationData] = useState([]);
    const [showAddToRotationModal, setShowAddToRotationModal] = useState(false);
    const [showManualRotationModal, setShowManualRotationModal] = useState(false);
    const [selectedRotationId, setSelectedRotationId] = useState(null);
    const [selectedRotationEmployees, setSelectedRotationEmployees] = useState([]);
    const [manualRotationSelections, setManualRotationSelections] = useState({});
    const [rotationPayrollReviews, setRotationPayrollReviews] = useState([]);
    const permissions = user?.accountId?.role?.permissions?.map((permission) => permission.name) || [];
    const hasPermission = (permissionName) => permissions.includes(permissionName);
    const userEmployeeId = user?._id?.toString();
    const teamLeaderId = teamDetail?.leader?._id?.toString() || teamDetail?.leader?.toString();
    const canManageAllTeamMembers = hasPermission("WRITE_TEAMS");
    const canManageOwnTeamMembers =
        hasPermission("WRITE_OWN_TEAM_MEMBERS") && teamLeaderId && teamLeaderId === userEmployeeId;
    const canManageTeamMembers = canManageAllTeamMembers || canManageOwnTeamMembers;
    const canManageRotations = hasPermission("WRITE_TEAM_ROTATIONS");
    
    // State cho việc chọn tháng/năm xem lịch luân phiên
    const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonthYear().month);
    const [selectedYear, setSelectedYear] = useState(() => getCurrentMonthYear().year);
    useEffect(() => {
        if (isOpen && teamId) {
            const { month, year } = getCurrentMonthYear();
            setSelectedMonth(month);
            setSelectedYear(year);
            fetchTeamDetail();
        }
    }, [isOpen, teamId]);

    useEffect(() => {
        dataEmplyee();
        setRotationPayrollReviews([]);

        if (teamId) {
            rotationCall();
        }
    }, [teamId, selectedMonth, selectedYear, canManageTeamMembers]) // Thêm selectedMonth và selectedYear vào dependency

    const rotationCall = async () => {
        if (!teamId) return; // Chỉ gọi khi có teamId

        try {
            const res = await saturdayRotations.get(teamId, selectedMonth, selectedYear);

            const rotationList = res?.data?.data || [];
            setRotationData(rotationList);
        } catch (error) {
            setRotationData([]);
        }
    };

    const handleRotationMutationResponse = (response, successMessage) => {
        const syncSummary = getRotationSyncSummary(response);
        const reviews = syncSummary?.finalizedPayrollsRequireReview || [];
        setRotationPayrollReviews(reviews);

        if (reviews.length > 0) {
            const names = formatPayrollReviewList(reviews);
            toast.warning(
                `Lịch nghỉ đã cập nhật. Có ${reviews.length} phiếu lương đã chốt cần review${names ? `: ${names}` : ""}.`,
                { autoClose: 8000 }
            );
            return;
        }

        toast.success(successMessage);
    };

    const rotationadd = async () => {
        try {
            const payload = {
                teamId: teamId,
                month: selectedMonth,
                year: selectedYear,
                minPresent: memBer
            }
            const res = await saturdayRotations.post(payload);
            handleRotationMutationResponse(res, "Đã tạo lịch nghỉ luân phiên");
            await rotationCall();
        } catch (error) {
            console.error("Team detail action failed:", error);
            toast.error(error.normalizedMessage || "Tạo lịch nghỉ luân phiên thất bại");
        }
    }

    const dateToKey = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const getSaturdaysForSelectedMonth = () => {
        const totalDays = new Date(selectedYear, selectedMonth, 0).getDate();
        const saturdays = [];

        for (let day = 1; day <= totalDays; day += 1) {
            const date = new Date(selectedYear, selectedMonth - 1, day);
            if (date.getDay() === 6) {
                saturdays.push({
                    date,
                    key: dateToKey(date),
                    label: date.toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    }),
                });
            }
        }

        return saturdays;
    };

    const getRotationEmployeeIds = (rotation) =>
        (rotation?.employeesOff || []).map((employee) =>
            typeof employee === "string" ? employee : employee?._id
        ).filter(Boolean);

    const openManualRotationModal = () => {
        const existingSelections = {};

        rotationData.forEach((rotation) => {
            const date = new Date(rotation.date);
            existingSelections[dateToKey(date)] = getRotationEmployeeIds(rotation);
        });

        getSaturdaysForSelectedMonth().forEach((saturday) => {
            if (!existingSelections[saturday.key]) {
                existingSelections[saturday.key] = [];
            }
        });

        setManualRotationSelections(existingSelections);
        setSearchTerm("");
        setShowManualRotationModal(true);
    };

    const closeManualRotationModal = () => {
        setShowManualRotationModal(false);
        setManualRotationSelections({});
        setSearchTerm("");
    };

    const toggleManualRotationEmployee = (dateKey, employeeId) => {
        setManualRotationSelections((prev) => {
            const current = prev[dateKey] || [];
            const next = current.includes(employeeId)
                ? current.filter((id) => id !== employeeId)
                : [...current, employeeId];

            return { ...prev, [dateKey]: next };
        });
    };

    const handleSubmitManualRotations = async () => {
        const saturdays = getSaturdaysForSelectedMonth();
        if (saturdays.length === 0) return;

        if (!window.confirm(`Ghi đè lịch nghỉ luân phiên tháng ${selectedMonth}/${selectedYear} bằng cấu hình thủ công?`)) {
            return;
        }

        try {
            const payload = {
                teamId,
                month: selectedMonth,
                year: selectedYear,
                minPresent: memBer,
                customRotations: saturdays.map((saturday) => ({
                    date: saturday.key,
                    employeesOff: manualRotationSelections[saturday.key] || [],
                })),
            };

            const res = await saturdayRotations.post(payload);
            handleRotationMutationResponse(res, "Đã lưu lịch nghỉ thủ công");
            await rotationCall();
            closeManualRotationModal();
        } catch (error) {
            console.error("submit manual rotations error:", error);
            toast.error(error.normalizedMessage || "Lưu lịch nghỉ thủ công thất bại");
        }
    };

    const handleDeleteMonthRotations = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch nghỉ luân phiên của tháng ${selectedMonth}/${selectedYear}?`)) {
            return;
        }
        
        try {
            const res = await saturdayRotations.deleteByMonth(teamId, selectedMonth, selectedYear);
            handleRotationMutationResponse(res, "Đã xóa lịch nghỉ luân phiên trong tháng");
            await rotationCall();
        } catch (error) {
            console.error("Team detail action failed:", error);
            toast.error(error.normalizedMessage || "Xóa lịch nghỉ luân phiên thất bại");
        }
    }

    // Hàm chuyển tháng trước
    const goToPreviousMonth = () => {
        if (selectedMonth === 1) {
            setSelectedMonth(12);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    // Hàm chuyển tháng sau
    const goToNextMonth = () => {
        if (selectedMonth === 12) {
            setSelectedMonth(1);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    // Hàm về tháng hiện tại
    const goToCurrentMonth = () => {
        const { month, year } = getCurrentMonthYear();
        setSelectedMonth(month);
        setSelectedYear(year);
    };

    // Hàm format tháng/năm hiển thị
    const formatMonthYear = (month, year) => {
        const monthNames = [
            "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
            "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
        ];
        return `${monthNames[month - 1]} ${year}`;
    };

    // Kiểm tra có phải tháng hiện tại không
    const isCurrentMonth = () => {
        const now = new Date();
        return selectedMonth === (now.getMonth() + 1) && selectedYear === now.getFullYear();
    };

    const dataEmplyee = async () => {
        if (!teamId || !canManageTeamMembers) {
            setEmployees([]);
            return;
        }

        try {
            const res = await employeeApi.getAll({ limit: 100, teamMemberCandidateFor: teamId });
            const employeeData = res?.data?.data || [];
            setEmployees(employeeData);
        } catch (error) {
            console.error("Team detail action failed:", error);
            setEmployees([]);
        }
    }

    const fetchTeamDetail = async () => {
        setLoading(true);
        try {
            const response = await teamAPI.getbyID(teamId);
            const data = response?.data?.data || response?.data;
            setTeamDetail(data);
            const member = Math.max(1, Math.floor((response.data.data.members.length + 1) / 2));
            setMemBer(member)
        } catch (error) {
            console.error("Error fetching team detail:", error);
            setTeamDetail(null);
        } finally {
            setLoading(false);
        }
    };

    // Lọc nhân viên chưa có team hoặc không thuộc team hiện tại
    const availableEmployees = employees.filter(emp => {
        // Lọc theo search term
        const matchesSearch = !searchTerm ||
            emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());

        // Lọc nhân viên chưa có team hoặc không thuộc team hiện tại
        const notInCurrentTeam = !emp.teamId || emp.teamId._id !== teamId;

        return matchesSearch && notInCurrentTeam;
    });

    const handleEmployeeSelect = (employeeId) => {
        setSelectedEmployees(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handleAddMembers = async () => {
        if (selectedEmployees.length === 0) return;

        setAddMemberLoading(true);
        try {
            const payload = {
                employeeIds: selectedEmployees
            };

            // TODO: Gọi API thêm thành viên vào team
            const res = await teamAPI.addmember(teamId, payload);
            // Sau khi API thành công, reset và đóng modal
            setSelectedEmployees([]);
            setShowAddMemberModal(false);
            setSearchTerm("");

            // Refresh team detail
            await fetchTeamDetail();

        } catch (error) {
            console.error("Error adding members:", error);
            toast.error(error.normalizedMessage || "Thêm thành viên thất bại");
        } finally {
            setAddMemberLoading(false);
        }
    };

    const handleRemoveMember = async (member) => {
        if (!window.confirm(`Xóa ${member.fullName || member.employeeCode} khỏi team?`)) return;

        try {
            await teamAPI.removeMembers(teamId, { employeeIds: [member._id] });
            await fetchTeamDetail();
            await dataEmplyee();
        } catch (error) {
            console.error("Error removing member:", error);
            toast.error(error.normalizedMessage || "Xóa thành viên khỏi team thất bại");
        }
    };

    const handleDeleteRotationById = async (rotationId) => {
        if (!window.confirm("Xóa lịch nghỉ luân phiên này?")) return;

        try {
            const res = await saturdayRotations.deleteById(rotationId);
            handleRotationMutationResponse(res, "Đã xóa lịch nghỉ luân phiên");
            await rotationCall();
        } catch (error) {
            console.error("Error deleting rotation:", error);
            toast.error(error.normalizedMessage || "Xóa lịch nghỉ luân phiên thất bại");
        }
    };

    const openAddMemberModal = () => {
        setShowAddMemberModal(true);
        setSelectedEmployees([]);
        setSearchTerm("");
    };

    const closeAddMemberModal = () => {
        setShowAddMemberModal(false);
        setSelectedEmployees([]);
        setSearchTerm("");
    };

    // Functions for adding members to rotation
    const openAddToRotationModal = (rotationId) => {
        setSelectedRotationId(rotationId);
        setShowAddToRotationModal(true);
        setSelectedRotationEmployees([]);
        setSearchTerm("");
    };

    const closeAddToRotationModal = () => {
        setShowAddToRotationModal(false);
        setSelectedRotationId(null);
        setSelectedRotationEmployees([]);
        setSearchTerm("");
    };

    const handleRotationEmployeeSelect = (employeeId) => {
        setSelectedRotationEmployees(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handleAddToRotation = async () => {
        if (selectedRotationEmployees.length === 0 || !selectedRotationId) return;

        try {
            const payload = {
                employeesOff: selectedRotationEmployees
            };


            const res = await saturdayRotations.patch(selectedRotationId, payload)
            handleRotationMutationResponse(res, "Đã cập nhật lịch nghỉ luân phiên");

            // Sau khi API thành công, refresh data
            await rotationCall();
            closeAddToRotationModal();

        } catch (error) {
            console.error("Error adding to rotation:", error);
            toast.error(error.normalizedMessage || "Cập nhật lịch nghỉ luân phiên thất bại");
        }
    };

    // Lọc nhân viên có thể thêm vào rotation (tất cả thành viên trong team + leader)
    const getAvailableEmployeesForRotation = () => {
        if (!teamDetail) return [];

        // Tạo danh sách bao gồm cả members và leader
        const allTeamMembers = [];
        
        // Thêm tất cả members
        if (teamDetail.members && teamDetail.members.length > 0) {
            allTeamMembers.push(...teamDetail.members);
        }
        
        // Thêm leader nếu có và chưa có trong danh sách members
        if (teamDetail.leader) {
            const isLeaderInMembers = teamDetail.members?.some(member => member._id === teamDetail.leader._id);
            if (!isLeaderInMembers) {
                allTeamMembers.push(teamDetail.leader);
            }
        }

        // Lọc theo search term
        return allTeamMembers.filter(person => {
            const matchesSearch = !searchTerm ||
                person.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-7xl w-full max-h-[92vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b bg-slate-50">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="p-3 bg-blue-600 rounded-lg shadow-sm">
                            <Users className="text-white" size={22} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-bold text-gray-900 truncate">
                                    {teamDetail?.name || "Chi tiết team"}
                                </h2>
                                {teamDetail?.teamCode && (
                                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md border border-blue-200">
                                        {teamDetail.teamCode}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Tổng quan team, thành viên và lịch nghỉ luân phiên
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto bg-gray-50">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                            <span className="ml-3 text-gray-600">Đang tải...</span>
                        </div>
                    ) : !teamDetail ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không thể tải thông tin team</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
                                <span className="font-semibold text-gray-900">{teamDetail.members?.length || 0} thành viên</span>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                <span className="text-gray-600">Leader: {teamDetail.leader?.fullName || "--"}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-300" />
                                <span className="text-gray-600">{rotationData.length} lịch trong {formatMonthYear(selectedMonth, selectedYear)}</span>
                                <span className={`rounded-md px-2 py-1 text-xs font-semibold ${teamDetail.isActive
                                    ? "bg-green-100 text-green-700 border border-green-200"
                                    : "bg-red-100 text-red-700 border border-red-200"
                                    }`}>
                                    {teamDetail.isActive ? "Hoạt động" : "Không hoạt động"}
                                </span>
                            </div>

                            {rotationPayrollReviews.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-600" />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold">
                                                Có {rotationPayrollReviews.length} phiếu lương đã chốt cần review
                                            </div>
                                            <p className="mt-1 text-amber-800">
                                                Lịch nghỉ đã được đồng bộ lại với chấm công. Các phiếu đã chốt/đã thanh toán không tự tính lại, cần mở bảng lương để kiểm tra và xử lý thủ công.
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {rotationPayrollReviews.slice(0, 8).map((item) => (
                                                    <span
                                                        key={`${item.employeeId || item.employeeCode}-${item.month}-${item.year}`}
                                                        className="rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-amber-900"
                                                    >
                                                        {item.employeeCode || item.fullName || item.employeeId}
                                                    </span>
                                                ))}
                                                {rotationPayrollReviews.length > 8 && (
                                                    <span className="rounded-md border border-amber-200 bg-white px-2 py-1 text-xs font-medium text-amber-900">
                                                        +{rotationPayrollReviews.length - 8}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setRotationPayrollReviews([])}
                                            className="rounded-md p-1 text-amber-700 transition-colors hover:bg-amber-100"
                                            aria-label="Ẩn cảnh báo"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                            {/* Left Column - Team Info */}
                            <div className="space-y-4">
                                {/* Team Leader Info */}
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Crown className="text-yellow-600" size={16} />
                                        <h3 className="font-semibold text-sm text-gray-800">Team Leader</h3>
                                    </div>
                                    {teamDetail.leader ? (
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs text-gray-500">Họ tên</p>
                                                <p className="font-medium text-sm text-gray-800">
                                                    {teamDetail.leader.fullName}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Mã nhân viên</p>
                                                <p className="font-medium text-sm text-gray-800">
                                                    {teamDetail.leader.employeeCode}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">Chưa có team leader</p>
                                    )}
                                </div>

                                {/* Rotation Schedule */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarSync className="text-gray-600" size={16} />
                                            <h3 className="font-semibold text-sm text-gray-800">Lịch nghỉ luân phiên</h3>
                                        </div>
                                        {rotationData.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={handleDeleteMonthRotations}
                                                    className="p-1 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-full transition-colors"
                                                    title={`Xóa lịch tháng ${selectedMonth}/${selectedYear}`}
                                                >
                                                    <RotateCcw size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Month/Year Selector */}
                                    <div className="flex items-center justify-between mb-4 p-2 bg-white rounded-lg border border-gray-200">
                                        <button
                                            onClick={goToPreviousMonth}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                            title="Tháng trước"
                                        >
                                            <ChevronLeft size={16} className="text-gray-600" />
                                        </button>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">
                                                {formatMonthYear(selectedMonth, selectedYear)}
                                            </span>
                                            {!isCurrentMonth() && (
                                                <button
                                                    onClick={goToCurrentMonth}
                                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                                                    title="Về tháng hiện tại"
                                                >
                                                    Về tháng này
                                                </button>
                                            )}
                                        </div>
                                        
                                        <button
                                            onClick={goToNextMonth}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                            title="Tháng sau"
                                        >
                                            <ChevronRight size={16} className="text-gray-600" />
                                        </button>
                                    </div>
                                    {rotationData.length > 0 ? (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {rotationData.map((rotation, index) => (
                                                <div key={rotation._id} className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-xs font-semibold text-blue-600">
                                                            Tuần {index + 1}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(rotation.date).toLocaleDateString("vi-VN")}
                                                            </div>
                                                            <button
                                                                onClick={() => openAddToRotationModal(rotation._id)}
                                                                className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-colors"
                                                                title="Thêm thành viên nghỉ"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRotationById(rotation._id)}
                                                                className="p-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                                                                title="Xóa lịch nghỉ"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-gray-500">
                                                            Nghỉ ({rotation.employeesOff.length} người):
                                                        </div>
                                                        <div className="flex flex-wrap gap-1">
                                                            {rotation.employeesOff.map((emp) => (
                                                                <span
                                                                    key={emp._id}
                                                                    className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md border border-red-200"
                                                                    title={`${emp.fullName} (${emp.employeeCode})`}
                                                                >
                                                                    {emp.employeeCode} - {emp.fullName}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {/* <div className="text-xs text-green-600 mt-1">
                                                            Tối thiểu có mặt: {rotation.minPresent} người
                                                        </div> */}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <CalendarSync size={32} className="mx-auto mb-3 text-gray-300" />
                                            <p className="text-xs text-gray-500 italic">
                                                Chưa có lịch nghỉ luân phiên cho {formatMonthYear(selectedMonth, selectedYear)}
                                            </p>
                                            {isCurrentMonth() && (
                                                <p className="text-xs text-gray-400 mt-1">Nhấn "Set lịch làm luân phiên" để tạo</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Team Members */}
                            <div className="min-w-0">
                                <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm h-full flex flex-col">
                                    <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-center gap-2">
                                            <User className="text-green-600" size={18} />
                                            <h3 className="font-semibold text-gray-800">Danh sách thành viên</h3>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-3 py-1 bg-green-100 text-green-700 border border-green-200 text-xs font-semibold rounded-md">
                                                {teamDetail.members?.length || 0} người
                                            </span>
                                            {canManageTeamMembers && (
                                                <button
                                                    onClick={openAddMemberModal}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition-colors"
                                                    title="Thêm thành viên"
                                                >
                                                    <UserPlus size={14} />
                                                    Thêm
                                                </button>
                                            )}
                                            {canManageRotations && (
                                                <>
                                                    <button
                                                        onClick={rotationadd}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-xs font-semibold rounded-md transition-colors"
                                                        title="Tự động chia lịch nghỉ luân phiên"
                                                    >
                                                        <CalendarSync size={14} />
                                                        Set tự động
                                                    </button>
                                                    <button
                                                        onClick={openManualRotationModal}
                                                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-md transition-colors"
                                                        title="Set lịch nghỉ luân phiên thủ công"
                                                    >
                                                        <CalendarSync size={14} />
                                                        Set thủ công
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {teamDetail.members && teamDetail.members.length > 0 ? (
                                        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                                            {teamDetail.members.map((member, index) => (
                                                <div
                                                    key={member._id || index}
                                                    className="border-b border-gray-100 px-3 py-2.5 last:border-b-0 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                                                {member.fullName?.charAt(0) || "?"}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                                    {member.fullName}
                                                                </p>
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                    <span>{member.employeeCode}</span>
                                                                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                                                                    <span>{member.jobTitle || "Chưa có chức danh"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="ml-3 flex shrink-0 items-center gap-2">
                                                            <StatusBadge status={member.status} />
                                                            {canManageTeamMembers && (
                                                                <button
                                                                    onClick={() => handleRemoveMember(member)}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Xóa khỏi team"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-center py-8">
                                                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                                <p className="text-sm text-gray-500">Chưa có thành viên nào trong team</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-green-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <UserPlus className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Thêm thành viên vào team</h3>
                                    <p className="text-xs text-gray-500">Chọn nhân viên để thêm vào team {teamDetail?.name}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeAddMemberModal}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm nhân viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            {selectedEmployees.length > 0 && (
                                <div className="mt-2 text-sm text-blue-600">
                                    Đã chọn {selectedEmployees.length} nhân viên
                                </div>
                            )}
                        </div>

                        {/* Employee List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {availableEmployees.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                    <p>Không có nhân viên nào phù hợp</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availableEmployees.map((employee) => (
                                        <div
                                            key={employee._id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedEmployees.includes(employee._id)
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            onClick={() => handleEmployeeSelect(employee._id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(employee._id)}
                                                    onChange={() => handleEmployeeSelect(employee._id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {employee.fullName?.charAt(0) || "?"}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-800">
                                                        {employee.fullName}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{employee.employeeCode}</span>
                                                        <span>•</span>
                                                        <span>{employee.jobTitle || "Chưa có chức danh"}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {employee.departmentId?.name || "Chưa có phòng ban"}
                                                    </div>
                                                </div>
                                                <StatusBadge status={employee.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-600">
                                {selectedEmployees.length > 0 && (
                                    <span>Đã chọn {selectedEmployees.length} nhân viên</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeAddMemberModal}
                                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddMembers}
                                    disabled={selectedEmployees.length === 0 || addMemberLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                                >
                                    {addMemberLoading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Đang thêm...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} />
                                            Thêm thành viên ({selectedEmployees.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Rotation Modal */}
            {showManualRotationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <CalendarSync className="text-orange-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Set lịch nghỉ thủ công</h3>
                                    <p className="text-xs text-gray-500">
                                        {formatMonthYear(selectedMonth, selectedYear)} - chọn nhân sự nghỉ cho từng thứ 7
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeManualRotationModal}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 border-b bg-gray-50">
                            <input
                                type="text"
                                placeholder="Tìm thành viên..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {getSaturdaysForSelectedMonth().map((saturday, index) => {
                                const selectedIds = manualRotationSelections[saturday.key] || [];
                                return (
                                    <div key={saturday.key} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">
                                                    Tuần {index + 1} - {saturday.label}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Đã chọn nghỉ: {selectedIds.length} người
                                                </p>
                                            </div>
                                            {selectedIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setManualRotationSelections((prev) => ({
                                                            ...prev,
                                                            [saturday.key]: [],
                                                        }))
                                                    }
                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                                                >
                                                    Bỏ chọn ngày này
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                                            {getAvailableEmployeesForRotation().map((member) => {
                                                const checked = selectedIds.includes(member._id);
                                                return (
                                                    <label
                                                        key={`${saturday.key}-${member._id}`}
                                                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                                                            checked
                                                                ? "border-orange-400 bg-orange-50"
                                                                : "border-gray-200 bg-white hover:bg-gray-50"
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleManualRotationEmployee(saturday.key, member._id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-gray-800">
                                                                {member.fullName}
                                                            </p>
                                                            <p className="truncate text-xs text-gray-500">
                                                                {member.employeeCode} - {member.jobTitle || "Chưa có chức danh"}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between gap-3 border-t bg-gray-50 p-4">
                            <p className="text-xs text-gray-500">
                                Lưu sẽ ghi đè lịch tháng {selectedMonth}/{selectedYear}. Ngày không chọn ai sẽ lưu danh sách nghỉ rỗng.
                            </p>
                            <div className="flex shrink-0 gap-3">
                                <button
                                    type="button"
                                    onClick={closeManualRotationModal}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmitManualRotations}
                                    className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
                                >
                                    Lưu lịch thủ công
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add To Rotation Modal */}
            {showAddToRotationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <Plus className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Thêm thành viên nghỉ</h3>
                                    <p className="text-xs text-gray-500">Chọn thành viên để thêm vào danh sách nghỉ tuần này</p>
                                </div>
                            </div>
                            <button
                                onClick={closeAddToRotationModal}
                                className="p-2 hover:bg-white rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b bg-gray-50">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm thành viên..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            {selectedRotationEmployees.length > 0 && (
                                <div className="mt-2 text-sm text-red-600">
                                    Đã chọn {selectedRotationEmployees.length} thành viên
                                </div>
                            )}
                        </div>

                        {/* Employee List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {getAvailableEmployeesForRotation().length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                    <p>Không có thành viên nào có thể thêm</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {getAvailableEmployeesForRotation().map((member) => (
                                        <div
                                            key={member._id}
                                            className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedRotationEmployees.includes(member._id)
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            onClick={() => handleRotationEmployeeSelect(member._id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedRotationEmployees.includes(member._id)}
                                                    onChange={() => handleRotationEmployeeSelect(member._id)}
                                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                                />
                                                <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {member.fullName?.charAt(0) || "?"}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-800">
                                                        {member.fullName}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <span>{member.employeeCode}</span>
                                                        <span>•</span>
                                                        <span>{member.jobTitle || "Chưa có chức danh"}</span>
                                                    </div>
                                                </div>
                                                <StatusBadge status={member.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-between items-center gap-3 p-4 border-t bg-gray-50">
                            <div className="text-sm text-gray-600">
                                {selectedRotationEmployees.length > 0 && (
                                    <span>Đã chọn {selectedRotationEmployees.length} thành viên</span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeAddToRotationModal}
                                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddToRotation}
                                    disabled={selectedRotationEmployees.length === 0}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Thêm vào nghỉ ({selectedRotationEmployees.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDetailModal;
