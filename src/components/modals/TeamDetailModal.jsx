import { useState, useEffect } from "react";
import { X, Users, Building2, Crown, Calendar, Clock, User, Tag, Loader2 } from "lucide-react";
import { teamAPI } from "../../apis/teamAPI";

const formatDateTime = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

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

    useEffect(() => {
        if (isOpen && teamId) {
            fetchTeamDetail();
        }
    }, [isOpen, teamId]);

    const fetchTeamDetail = async () => {
        setLoading(true);
        try {
            const response = await teamAPI.getbyID(teamId);
            console.log("Team Detail Response:", response);
            const data = response?.data?.data || response?.data;
            setTeamDetail(data);
        } catch (error) {
            console.error("Error fetching team detail:", error);
            setTeamDetail(null);
        } finally {
            setLoading(false);
        }
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
                            <h2 className="text-lg font-bold text-gray-800">Chi tiết Team</h2>
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
                                        <span className={`px-2 py-1 text-xs font-semibold rounded w-fit ${
                                            teamDetail.isActive 
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
                                                {teamDetail.departmentId?.deptCode || "--"}
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

                                {/* Statistics */}
                                <div className="grid grid-cols-1 gap-2">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                        <p className="text-xs text-blue-600 font-medium mb-1">Tổng thành viên</p>
                                        <p className="text-xl font-bold text-blue-700">
                                            {teamDetail.members?.length || 0}
                                        </p>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                        <p className="text-xs text-green-600 font-medium mb-1">Đang làm việc</p>
                                        <p className="text-xl font-bold text-green-700">
                                            {teamDetail.members?.filter(m => m.status === "Active").length || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="text-gray-600" size={16} />
                                        <h3 className="font-semibold text-sm text-gray-800">Thời gian</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Ngày tạo</p>
                                            <p className="font-medium text-xs text-gray-800">
                                                {formatDateTime(teamDetail.createdAt)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Cập nhật</p>
                                            <p className="font-medium text-xs text-gray-800">
                                                {formatDateTime(teamDetail.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
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
                                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                                            {teamDetail.members?.length || 0} người
                                        </span>
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
                                                        <StatusBadge status={member.status} />
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
        </div>
    );
};

export default TeamDetailModal;
