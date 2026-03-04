import { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText, Tag, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { leaveAPI } from "../../apis/leaveAPI";

const leaveTypeLabel = {
    ANNUAL: "Nghỉ phép năm",
    UNPAID: "Nghỉ không lương",
    SICK: "Nghỉ ốm / bệnh",
    MATERNITY: "Nghỉ thai sản",
};

const leaveScopeLabel = {
    FULL_DAY: "Cả ngày",
    MORNING: "Ca sáng (08:00 - 12:00)",
    AFTERNOON: "Ca chiều (13:30 - 17:30)",
};

const statusLabel = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    CANCELLED: "Đã hủy",
};

const formatDate = (isoString) => {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

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

const normalizeStatus = (st) => {
    if (st === "CANCELED") return "CANCELLED";
    return st;
};

const StatusBadge = ({ statusKey, statusText }) => {
    const cls = (() => {
        switch (statusKey) {
            case "APPROVED":
                return "bg-green-50 text-green-700 border border-green-200";
            case "PENDING":
                return "bg-yellow-50 text-yellow-700 border border-yellow-200";
            case "CANCELLED":
            case "REJECTED":
                return "bg-red-50 text-red-700 border border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border border-gray-200";
        }
    })();

    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${cls}`}>
            {statusText}
        </span>
    );
};

const LeaveDetailModal = ({ isOpen, onClose, leaveId }) => {
    const [loading, setLoading] = useState(false);
    const [leaveDetail, setLeaveDetail] = useState(null);

    useEffect(() => {
        if (isOpen && leaveId) {
            fetchLeaveDetail();
        }
    }, [isOpen, leaveId]);

    const fetchLeaveDetail = async () => {
        setLoading(true);
        try {
            const response = await leaveAPI.getbyID(leaveId);
            const data = response?.data?.data || response?.data;
            setLeaveDetail(data);
        } catch (error) {
            console.error("Error fetching leave detail:", error);
            setLeaveDetail(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const displayStatus = normalizeStatus(leaveDetail?.status);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn nghỉ</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Đang tải...</span>
                        </div>
                    ) : !leaveDetail ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Không thể tải thông tin đơn nghỉ</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4">
                            {/* Left Column - Main Info */}
                            <div className="col-span-2 space-y-4">
                                {/* Employee Info - Compact */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <User className="text-blue-600" size={18} />
                                        <h3 className="font-semibold text-gray-800">Thông tin nhân sự</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Họ tên</p>
                                            <p className="font-semibold text-gray-800">{leaveDetail.employeeId?.fullName || "--"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Mã nhân viên</p>
                                            <p className="font-semibold text-gray-800">{leaveDetail.employeeId?.employeeCode || "--"}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Leave Info - Compact Grid */}
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Calendar className="text-green-600" size={18} />
                                        <h3 className="font-semibold text-gray-800">Thông tin nghỉ phép</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Loại nghỉ</p>
                                            <p className="font-medium text-sm">
                                                {leaveTypeLabel[leaveDetail.leaveType] || leaveDetail.leaveType || "--"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Hình thức</p>
                                            <p className="font-medium text-sm">
                                                {leaveScopeLabel[leaveDetail.leaveScope] || leaveDetail.leaveScope || "--"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Số ngày</p>
                                            <p className="font-semibold text-lg text-blue-600">
                                                {leaveDetail.totalDays ?? "--"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Từ ngày</p>
                                            <p className="font-medium text-sm">{formatDate(leaveDetail.fromDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Đến ngày</p>
                                            <p className="font-medium text-sm">{formatDate(leaveDetail.toDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Trạng thái</p>
                                            <StatusBadge
                                                statusKey={displayStatus}
                                                statusText={statusLabel[displayStatus] || displayStatus}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Reason - Compact */}
                                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FileText className="text-yellow-600" size={18} />
                                        <h3 className="font-semibold text-gray-800">Lý do nghỉ</h3>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {leaveDetail.reason || "Không có lý do cụ thể"}
                                    </p>
                                </div>

                                {/* Timestamps - Compact */}
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="text-gray-600" size={18} />
                                        <h3 className="font-semibold text-gray-800">Thời gian</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Ngày tạo</p>
                                            <p className="font-medium text-sm">{formatDateTime(leaveDetail.createdAt)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Cập nhật</p>
                                            <p className="font-medium text-sm">{formatDateTime(leaveDetail.updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Approval Timeline */}
                            <div className="col-span-1">
                                {leaveDetail.approvalChain && leaveDetail.approvalChain.length > 0 ? (
                                    <div className="bg-white rounded-lg border border-purple-200 p-4 h-full">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Tag className="text-purple-600" size={18} />
                                            <h3 className="font-semibold text-gray-800">Chuỗi phê duyệt</h3>
                                        </div>
                                        <div className="relative">
                                            {leaveDetail.approvalChain.map((approval, index) => {
                                                const approvalStatus = normalizeStatus(approval.status);
                                                const isLast = index === leaveDetail.approvalChain.length - 1;
                                                
                                                return (
                                                    <div key={approval._id || index} className="relative flex gap-3 pb-4">
                                                        {/* Timeline line */}
                                                        {!isLast && (
                                                            <div className="absolute left-[13px] top-[28px] bottom-0 w-0.5 bg-gray-200"></div>
                                                        )}
                                                        
                                                        {/* Status icon */}
                                                        <div className="relative z-10 flex-shrink-0">
                                                            {approvalStatus === "APPROVED" ? (
                                                                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                                                                    <CheckCircle2 size={16} className="text-green-600" />
                                                                </div>
                                                            ) : approvalStatus === "REJECTED" ? (
                                                                <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                                                                    <XCircle size={16} className="text-red-600" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-yellow-100 flex items-center justify-center">
                                                                    <AlertCircle size={16} className="text-yellow-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Content */}
                                                        <div className="flex-1 pt-0.5">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                    Cấp {approval.level}
                                                                </span>
                                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded
                                                                    ${approvalStatus === "APPROVED" ? "bg-green-100 text-green-700" : 
                                                                      approvalStatus === "REJECTED" ? "bg-red-100 text-red-700" : 
                                                                      "bg-yellow-100 text-yellow-700"}`}>
                                                                    {approvalStatus === "APPROVED" ? "Đã duyệt" : 
                                                                     approvalStatus === "REJECTED" ? "Từ chối" : 
                                                                     "Chờ duyệt"}
                                                                </span>
                                                            </div>
                                                            
                                                            <p className="font-semibold text-sm text-gray-800">
                                                                {approval.approver?.fullName || "--"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {approval.approver?.employeeCode || "--"}
                                                            </p>
                                                            
                                                            {approval.approvedAt && (
                                                                <p className="text-[10px] text-gray-400 mt-1">
                                                                    {formatDateTime(approval.approvedAt)}
                                                                </p>
                                                            )}
                                                            
                                                            {approval.comment && (
                                                                <div className="mt-1.5 p-1.5 bg-gray-50 rounded text-xs text-gray-700 border-l-2 border-gray-300">
                                                                    <span className="text-[10px] text-gray-500 font-medium">Nhận xét: </span>
                                                                    {approval.comment}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 h-full flex items-center justify-center">
                                        <p className="text-sm text-gray-400">Chưa có thông tin phê duyệt</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeaveDetailModal;
