import React, { useEffect, useMemo, useState } from "react";
import {
    Search,
    Loader2,
    RefreshCw,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
// ❗️Không import StatusBadge từ common nữa nếu bạn làm cách 2 ngay trong file này
// import StatusBadge from "../../components/common/StatusBadge";
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
    // Chuẩn hoá dữ liệu cũ (nếu backend trả về CANCELED)
    if (st === "CANCELED") return "CANCELLED";
    return st;
};

// ✅ CÁCH 2: StatusBadge tự đổi màu theo statusKey (đặt OUTSIDE MyLeave)
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
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
            {statusText}
        </span>
    );
};

const MyLeave = () => {
    const [loading, setLoading] = useState(true);
    const [leaves, setLeaves] = useState([]);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    const [filters, setFilters] = useState({
        search: "",
        leaveType: "",
        status: "",
    });

    // ✅ Lấy role đã lưu localStorage
    const role = useMemo(() => {
        const raw = localStorage.getItem("role"); // ví dụ "ADMIN"
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }, []);

    const isAdmin = useMemo(() => {
        if (typeof role === "string") {
            console.log("BẠN ĐANG Ở ROLE ADMIN")
            return role === "ADMIN"
        };
        if (Array.isArray(role)) return role.includes("ADMIN");
        if (role?.name) return role.name === "ADMIN";
        return false;
    }, [role]);

    const searchQuery = useMemo(() => filters.search.trim().toLowerCase(), [
        filters.search,
    ]);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            // const params = {
            //     page: pagination.page,
            //     limit: pagination.limit,
            // };

            const raw = localStorage.getItem("role"); // "ADMIN" hoặc khác
            console.log("CHECK RAW :",raw)
            let res;

            if (raw === "ADMIN") {
                console.log("BẠN LÀ ADMIN")
                res = await leaveAPI.getbyADMIN();
                console.log("RES :",res)
            } else {
                console.log("BẠN LÀ USER")
                res = await leaveAPI.getbyUSER();
                 console.log("RES :",res)
            }

            // 1) res.data = { data: [...], results: number }
            // 2) res.data = { data: { data: [...], results: number } }
            const root = res?.data?.data?.data ? res.data.data : res?.data;
            const rows = root?.data || [];
            const total = root?.results || 0;

            const normalizedRows = rows.map((lv) => ({
                ...lv,
                status: normalizeStatus(lv?.status),
            }));

            setLeaves(normalizedRows);
            setPagination((prev) => ({
                ...prev,
                total,
                totalPages: Math.ceil(total / prev.limit) || 1,
            }));
        } catch (e) {
            console.error("fetchLeaves error:", e);
        } finally {
            setLoading(false);
        }

    };

    useEffect(() => {
        const t = setTimeout(() => fetchLeaves(), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line
    }, [pagination.page, pagination.limit]);

    // ✅ Lọc LOCAL: search + leaveType + status
    const filteredLeaves = useMemo(() => {
        const type = filters.leaveType;
        const st = filters.status;
        const q = searchQuery;

        return leaves.filter((lv) => {
            const name = (lv.employeeId?.fullName || "").toLowerCase();
            const reason = (lv.reason || "").toLowerCase();

            const matchSearch = !q || name.includes(q) || reason.includes(q);
            const matchType = !type || lv?.leaveType === type;
            const matchStatus = !st || normalizeStatus(lv?.status) === st;

            return matchSearch && matchType && matchStatus;
        });
    }, [leaves, filters.leaveType, filters.status, searchQuery]);

    // ✅ Action ADMIN: Duyệt / Hủy
    // Khuyến nghị: dùng leaveAPI.editStatus(id, "APPROVED"/"CANCELLED")
    const handleApprove = async (leaveId) => {
        try {
            if (leaveAPI.editStatus) {
                await leaveAPI.editStatus(leaveId, "APPROVED");
            } else if (leaveAPI.APPROVED) {
                await leaveAPI.APPROVED(leaveId);
            } else {
                console.warn("Thiếu leaveAPI.editStatus / leaveAPI.APPROVED");
                return;
            }
            await fetchLeaves();
        } catch (e) {
            console.error("approve error:", e);
        }
    };

    const handleCancel = async (leaveId) => {
        try {
            if (leaveAPI.editStatus) {
                await leaveAPI.editStatus(leaveId, "CANCELLED");
            } else if (leaveAPI.CANCELLED) {
                await leaveAPI.CANCELLED(leaveId);
            } else {
                console.warn("Thiếu leaveAPI.editStatus / leaveAPI.CANCELLED");
                return;
            }
            await fetchLeaves();
        } catch (e) {
            console.error("cancel error:", e);
        }
    };

    const colSpanCount = isAdmin ? 10 : 9;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Leave</h1>
                    <p className="text-sm text-gray-500">
                        Danh sách đơn nghỉ ({pagination.total})
                    </p>
                    <p className="text-xs text-gray-400">
                        Hiển thị sau lọc: {filteredLeaves.length}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    className="flex gap-2 items-center"
                    onClick={fetchLeaves}
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    Làm mới
                </Button>
            </div>

            {/* Filters + Table */}
            <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
                <div className="p-4 bg-gray-50 border-b flex gap-4 flex-wrap">
                    {/* Search (lọc local) */}
                    <div className="relative flex-1 min-w-[260px] max-w-md">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tìm theo lý do / tên nhân sự..."
                            value={filters.search}
                            onChange={(e) => {
                                setPagination((p) => ({ ...p, page: 1 }));
                                setFilters((p) => ({ ...p, search: e.target.value }));
                            }}
                        />
                    </div>

                    {/* leaveType (lọc local theo enum) */}
                    <select
                        className="border rounded-lg px-3 py-2 text-sm outline-none"
                        value={filters.leaveType}
                        onChange={(e) => {
                            setPagination((p) => ({ ...p, page: 1 }));
                            setFilters((p) => ({ ...p, leaveType: e.target.value }));
                        }}
                    >
                        <option value="">Tất cả loại nghỉ</option>
                        <option value="ANNUAL">Nghỉ phép năm</option>
                        <option value="UNPAID">Nghỉ không lương</option>
                        <option value="SICK">Nghỉ ốm / bệnh</option>
                        <option value="MATERNITY">Nghỉ thai sản</option>
                    </select>

                    {/* status (lọc local) */}
                    <select
                        className="border rounded-lg px-3 py-2 text-sm outline-none"
                        value={filters.status}
                        onChange={(e) => {
                            setPagination((p) => ({ ...p, page: 1 }));
                            setFilters((p) => ({ ...p, status: e.target.value }));
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ duyệt</option>
                        <option value="APPROVED">Đã duyệt</option>
                        <option value="REJECTED">Từ chối</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-white border-b text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="p-4">Nhân sự</th>
                                <th className="p-4">Loại nghỉ</th>
                                <th className="p-4">Hình thức</th>
                                <th className="p-4">Từ ngày</th>
                                <th className="p-4">Đến ngày</th>
                                <th className="p-4">Số ngày</th>
                                <th className="p-4">Lý do</th>
                                <th className="p-4">Trạng thái</th>
                                <th className="p-4">Ngày tạo</th>
                                {isAdmin && <th className="p-4 text-center">Action</th>}
                            </tr>
                        </thead>

                        <tbody className="divide-y bg-white">
                            {loading ? (
                                <tr>
                                    <td
                                        className="p-6 text-center text-gray-500"
                                        colSpan={colSpanCount}
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            Đang tải dữ liệu...
                                        </span>
                                    </td>
                                </tr>
                            ) : filteredLeaves.length === 0 ? (
                                <tr>
                                    <td
                                        className="p-6 text-center text-gray-500"
                                        colSpan={colSpanCount}
                                    >
                                        Không có đơn nghỉ nào
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves.map((lv) => {
                                    const displayStatus = normalizeStatus(lv.status);
                                    const canAction = displayStatus === "PENDING";

                                    return (
                                        <tr key={lv._id} className="hover:bg-blue-50/30">
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-800">
                                                    {lv.employeeId?.fullName || "--"}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {lv.employeeId?.employeeCode || ""}
                                                </p>
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {leaveTypeLabel[lv.leaveType] || lv.leaveType || "--"}
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {leaveScopeLabel[lv.leaveScope] ||
                                                    lv.leaveScope ||
                                                    "--"}
                                            </td>

                                            <td className="p-4 text-gray-700">
                                                {formatDate(lv.fromDate)}
                                            </td>
                                            <td className="p-4 text-gray-700">
                                                {formatDate(lv.toDate)}
                                            </td>

                                            <td className="p-4 text-gray-700 font-semibold">
                                                {lv.totalDays ?? "--"}
                                            </td>

                                            <td className="p-4 text-gray-600 max-w-[360px]">
                                                <span className="line-clamp-2">{lv.reason || "--"}</span>
                                            </td>

                                            <td className="p-4">
                                                <StatusBadge
                                                    statusKey={displayStatus}
                                                    statusText={statusLabel[displayStatus] || displayStatus}
                                                />
                                            </td>

                                            <td className="p-4 text-xs text-gray-500">
                                                {formatDateTime(lv.createdAt)}
                                            </td>

                                            {isAdmin && (
                                                <td className="p-4">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            disabled={!canAction}
                                                            onClick={() => handleApprove(lv._id)}
                                                            className={`p-2 rounded border text-xs font-semibold inline-flex items-center gap-1
                                ${canAction
                                                                    ? "text-green-600 border-green-200 hover:bg-green-50"
                                                                    : "text-gray-300 border-gray-200 cursor-not-allowed"
                                                                }`}
                                                            title="Duyệt"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Duyệt
                                                        </button>

                                                        <button
                                                            disabled={!canAction}
                                                            onClick={() => handleCancel(lv._id)}
                                                            className={`p-2 rounded border text-xs font-semibold inline-flex items-center gap-1
                                ${canAction
                                                                    ? "text-red-500 border-red-200 hover:bg-red-50"
                                                                    : "text-gray-300 border-gray-200 cursor-not-allowed"
                                                                }`}
                                                            title="Hủy"
                                                        >
                                                            <XCircle size={14} />
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t bg-white flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Trang {pagination.page}/{pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            type="button"
                            disabled={pagination.page <= 1}
                            onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                        >
                            Trước
                        </Button>
                        <Button
                            variant="secondary"
                            type="button"
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default MyLeave;
