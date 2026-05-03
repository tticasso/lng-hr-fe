import { useState, useEffect } from "react";
import { X, Users, Building2, Crown, User, Loader2, Plus, UserPlus, CalendarSync, Trash2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { teamAPI } from "../../apis/teamAPI";
import { employeeApi } from "../../apis/employeeApi";
import { saturdayRotations } from "../../apis/saturday-rotations";

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

const TeamDetailModal = ({ isOpen, onClose, teamId }) => {
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
    const [selectedRotationId, setSelectedRotationId] = useState(null);
    const [selectedRotationEmployees, setSelectedRotationEmployees] = useState([]);
    
    // State cho việc chọn tháng/năm xem lịch luân phiên
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    useEffect(() => {
        if (isOpen && teamId) {
            fetchTeamDetail();
        }
    }, [isOpen, teamId]);

    useEffect(() => {
        dataEmplyee();

        if (teamId) {
            rotationCall();
        }
    }, [teamId, selectedMonth, selectedYear]) // Thêm selectedMonth và selectedYear vào dependency

    const rotationCall = async () => {
        if (!teamId) return; // Chỉ gọi khi có teamId

        try {
            const res = await saturdayRotations.get(teamId, selectedMonth, selectedYear);

            console.log("getRotation res :", res);
            const rotationList = res?.data?.data || [];
            setRotationData(rotationList);
        } catch (error) {
            console.log("getRotation error :", error);
            setRotationData([]);
        }
    };

    const rotationadd = async () => {
        try {
            const payload = {
                teamId: teamId,
                month: selectedMonth,
                year: selectedYear,
                minPresent: memBer
            }
            console.log("PAYLOAD_CHECK :", payload)
            const res = await saturdayRotations.post(payload);
            rotationCall();
            console.log("addrotation res :", res);
        } catch (error) {
            console.log("addrotation error :", error);
        }
    }

    const handleDeleteAllRotations = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch nghỉ luân phiên của team này?")) {
            return;
        }
        
        try {
            const res = await saturdayRotations.deleteAll(teamId);
            console.log("Delete all rotations res:", res);
            await rotationCall(); // Refresh data
        } catch (error) {
            console.log("Delete all rotations error:", error);
        }
    }

    const handleDeleteMonthRotations = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch nghỉ luân phiên của tháng ${selectedMonth}/${selectedYear}?`)) {
            return;
        }
        
        try {
            const res = await saturdayRotations.deleteByMonth(teamId, selectedMonth, selectedYear);
            console.log("Delete month rotations res:", res);
            await rotationCall(); // Refresh data
        } catch (error) {
            console.log("Delete month rotations error:", error);
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
        const now = new Date();
        setSelectedMonth(now.getMonth() + 1);
        setSelectedYear(now.getFullYear());
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
        try {
            const res = await employeeApi.getAll();
            console.log("EMPLOYEE RES :", res);
            const employeeData = res?.data?.data || [];
            setEmployees(employeeData);
        } catch (error) {
            console.log("EMPLOYEE error :", error);
        }
    }

    const fetchTeamDetail = async () => {
        setLoading(true);
        try {
            const response = await teamAPI.getbyID(teamId);
            console.log("Team Detail Response:", response);
            const data = response?.data?.data || response?.data;
            setTeamDetail(data);
            const member = Math.max(1, Math.floor((response.data.data.members.length + 1) / 2));
            console.log("member_lenght :", member)
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
            console.log("Add members payload:", payload);
            console.log("Team ID:", teamId);
            const res = await teamAPI.addmember(teamId, payload);
            console.log("TEAM_API RES :", res)
            // Sau khi API thành công, reset và đóng modal
            setSelectedEmployees([]);
            setShowAddMemberModal(false);
            setSearchTerm("");

            // Refresh team detail
            await fetchTeamDetail();

        } catch (error) {
            console.log("TEAM_API error :", error)
            console.error("Error adding members:", error);
        } finally {
            setAddMemberLoading(false);
        }
    };

    const handleRemoveMember = async (member) => {
        if (!window.confirm(`Xoa ${member.fullName || member.employeeCode} khoi team?`)) return;

        try {
            await teamAPI.removeMembers(teamId, { employeeIds: [member._id] });
            await fetchTeamDetail();
            await dataEmplyee();
        } catch (error) {
            console.error("Error removing member:", error);
        }
    };

    const handleDeleteRotationById = async (rotationId) => {
        if (!window.confirm("Xoa lich nghi luan phien nay?")) return;

        try {
            await saturdayRotations.deleteById(rotationId);
            await rotationCall();
        } catch (error) {
            console.error("Error deleting rotation:", error);
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

            console.log("Add to rotation payload:", payload);
            console.log("Rotation ID:", selectedRotationId);

            const res = await saturdayRotations.patch(selectedRotationId, payload)
            console.log("CHECK_LOG RES", res)

            // Sau khi API thành công, refresh data
            await rotationCall();
            closeAddToRotationModal();

        } catch (error) {
            console.log("CHECK_LOG error", error)
            console.error("Error adding to rotation:", error);
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
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Chi tiết Team 123</h2>
                            <p className="text-xs text-gray-500">Thông tin đầy đủ về team</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
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
                        <div className="grid grid-cols-3 gap-4">
                            {/* Left Column - Team Info */}
                            <div className="col-span-1 space-y-4">
                                {/* Team Basic Info */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {teamDetail.name}
                                    </h3>
                                    <div className="flex flex-col gap-2 mb-3">
                                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded w-fit">
                                            {teamDetail.teamCode}
                                        </span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded w-fit ${teamDetail.isActive
                                            ? "bg-green-100 text-green-700 border border-green-200"
                                            : "bg-red-100 text-red-700 border border-red-200"
                                            }`}>
                                            {teamDetail.isActive ? "Hoạt động" : "Không hoạt động"}
                                        </span>
                                    </div>

                                    {teamDetail.description && (
                                        <div className="mt-3 p-2 bg-white rounded text-xs text-gray-700">
                                            {teamDetail.description}
                                        </div>
                                    )}
                                </div>

                                {/* Department Info */}
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Building2 className="text-purple-600" size={16} />
                                        <h3 className="font-semibold text-sm text-gray-800">Phòng ban</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Tên phòng ban</p>
                                            <p className="font-medium text-sm text-gray-800">
                                                {teamDetail.departmentId?.name || "--"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Mã phòng ban</p>
                                            <p className="font-medium text-sm text-gray-800">
                                                {teamDetail.teamCode || "--"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

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
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
                                                    Hiện tại
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
                                                                title="Xoa lich nghi"
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
                            <div className="col-span-2">
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <User className="text-green-600" size={18} />
                                            <h3 className="font-semibold text-gray-800">Danh sách thành viên</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                                                {teamDetail.members?.length || 0} người
                                            </span>
                                            <button
                                                onClick={openAddMemberModal}
                                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors"
                                                title="Thêm thành viên"
                                            >
                                                <UserPlus size={14} />
                                                Thêm
                                            </button>
                                            {isCurrentMonth() && (
                                                <button
                                                    onClick={rotationadd}
                                                    className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded-full transition-colors"
                                                    title="Set lịch làm luân phiên"
                                                >
                                                    <CalendarSync size={14} />
                                                    Set lịch làm luân phiên
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {teamDetail.members && teamDetail.members.length > 0 ? (
                                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                            {teamDetail.members.map((member, index) => (
                                                <div
                                                    key={member._id || index}
                                                    className="bg-white rounded-lg p-3 border border-green-200 hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                {member.fullName?.charAt(0) || "?"}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-sm text-gray-800">
                                                                    {member.fullName}
                                                                </p>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                    <span>{member.employeeCode}</span>
                                                                    <span>•</span>
                                                                    <span>{member.jobTitle || "Chưa có chức danh"}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={member.status} />
                                                            <button
                                                                onClick={() => handleRemoveMember(member)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Xoa khoi team"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-white rounded-lg border border-green-200">
                                            <div className="text-center py-8">
                                                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                                                <p className="text-sm text-gray-500">Chưa có thành viên nào trong team</p>
                                            </div>
                                        </div>
                                    )}
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
