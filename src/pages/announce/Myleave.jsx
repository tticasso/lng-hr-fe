import React, { useEffect, useMemo, useState } from "react";
import { Search, Loader2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { leaveAPI } from "../../apis/leaveAPI";
import { OTApi } from "../../apis/OTAPI";
import ApproveOTModal from "../../components/modals/ApproveOTModal";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

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

const otTypeLabel = {
    WEEKDAY: "Ngày thường",
    WEEKEND: "Cuối tuần",
    HOLIDAY: "Ngày lễ",
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

const formatHours = (n) => {
    if (n === null || n === undefined) return "--";
    return `${Number(n)}h`;
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
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
            {statusText}
        </span>
    );
};

const MyLeave = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("LEAVE"); // "LEAVE" | "OT"

    // ✅ Nhận activeTab từ navigation state
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    // LEAVE
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

    // OT
    const [otLoading, setOtLoading] = useState(false);
    const [ots, setOts] = useState([]);

    // ✅ OT Filters (LOCAL)
    const [otFilters, setOtFilters] = useState({
        searchName: "",
        statusGroup: "", // "" | "PENDING" | "APPROVED"
        otType: "", // "" | "WEEKDAY" | "WEEKEND" | "HOLIDAY"
    });

    // ✅ OT Approve Modal
    const [approveOTModal, setApproveOTModal] = useState({
        isOpen: false,
        otData: null,
    });

    const pendingOTCount = useMemo(() => {
        return ots.filter((ot) => normalizeStatus(ot?.status) === "PENDING").length;
    }, [ots]);

    const role = useMemo(() => {
        const raw = localStorage.getItem("role");
        try {
            return JSON.parse(raw);
        } catch {
            return raw;
        }
    }, []);

    const isAdmin = useMemo(() => {
        if (typeof role === "string") return role === "ADMIN";
        if (Array.isArray(role)) return role.includes("ADMIN");
        if (role?.name) return role.name === "ADMIN";
        return false;
    }, [role]);

    const isHR = useMemo(() => {
        if (typeof role === "string") return role === "HR";
        if (Array.isArray(role)) return role.includes("HR");
        if (role?.name) return role.name === "HR";
        return false;
    }, [role]);

    const isManager = useMemo(() => {
        if (typeof role === "string") return role === "MANAGER";
        if (Array.isArray(role)) return role.includes("MANAGER");
        if (role?.name) return role.name === "MANAGER";
        return false;
    }, [role]);

    // Kiểm tra có quyền duyệt không (ADMIN, HR, MANAGER)
    const canApprove = useMemo(() => {
        return isAdmin || isHR || isManager;
    }, [isAdmin, isHR, isManager]);

    const searchQuery = useMemo(() => filters.search.trim().toLowerCase(), [filters.search]);
    const otSearchQuery = useMemo(
        () => otFilters.searchName.trim().toLowerCase(),
        [otFilters.searchName]
    );

    useEffect(() => {
        fetchLeaves();
        fetchOTs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const raw = localStorage.getItem("role");
            let res;

            // ADMIN, HR, MANAGER gọi API getbyADMIN, còn lại gọi getbyUSER
            if (raw === "ADMIN" || raw === "HR" || raw === "MANAGER") {
                res = await leaveAPI.getbyADMIN();
            } else {
                res = await leaveAPI.getbyUSER();
            }

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

    const fetchOTs = async () => {
        setOtLoading(true);
        try {
            const raw = localStorage.getItem("role");
            let res;

            // ADMIN, HR, MANAGER gọi API getALL, còn lại gọi get
            if (raw === "ADMIN" || raw === "HR" || raw === "MANAGER") {
                res = await OTApi.getALL();
            } else {
                res = await OTApi.get();
            }

            const root = res?.data?.data?.data ? res.data.data : res?.data;
            const rows = root?.data || root || [];
            setOts(Array.isArray(rows) ? rows : []);
        } catch (error) {
            console.log("DỮ LIỆU OT Lỗi :", error);
            setOts([]);
        } finally {
            setOtLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== "LEAVE") return;
        const t = setTimeout(() => fetchLeaves(), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line
    }, [activeTab, pagination.page, pagination.limit]);

    useEffect(() => {
        if (activeTab !== "OT") return;
        const t = setTimeout(() => fetchOTs(), 200);
        return () => clearTimeout(t);
        // eslint-disable-next-line
    }, [activeTab]);

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

    const pendingCount = useMemo(() => {
        return leaves.filter((lv) => normalizeStatus(lv.status) === "PENDING").length;
    }, [leaves]);

    const filteredOTs = useMemo(() => {
        const q = otSearchQuery;
        const stGroup = otFilters.statusGroup; // "PENDING" | "APPROVED" | ""
        const type = otFilters.otType;

        return ots.filter((ot) => {
            const name = (ot?.employeeId?.fullName || "").toLowerCase();
            const st = normalizeStatus(ot?.status);

            const matchName = !q || name.includes(q);

            const matchStatus =
                !stGroup || (stGroup === "APPROVED" ? st === "APPROVED" : st === "PENDING");

            const matchType = !type || ot?.otType === type;

            return matchName && matchStatus && matchType;
        });
    }, [ots, otFilters.statusGroup, otFilters.otType, otSearchQuery]);

    const handleApprove = async (leaveId) => {
        try {
            if (leaveAPI.editStatus) await leaveAPI.editStatus(leaveId, "APPROVED");
            else if (leaveAPI.APPROVED) await leaveAPI.APPROVED(leaveId);
            else return console.warn("Thiếu leaveAPI.editStatus / leaveAPI.APPROVED");
            await fetchLeaves();
        } catch (e) {
            console.error("approve error:", e);
        }
    };

    const handleCancel = async (leaveId) => {
        try {
            if (leaveAPI.editStatus) await leaveAPI.editStatus(leaveId, "CANCELLED");
            else if (leaveAPI.CANCELLED) await leaveAPI.CANCELLED(leaveId);
            else return console.warn("Thiếu leaveAPI.editStatus / leaveAPI.CANCELLED");
            await fetchLeaves();
        } catch (e) {
            console.error("cancel error:", e);
        }
    };

    const handleApproveOT = async (otId, approvedHours) => {
        console.log("RES otId: ", otId);
        console.log("RES approvedHours: ", approvedHours);
        try {
            const res = await OTApi.put(otId, approvedHours);
            toast.success("DUYỆT THÀNH CÔNG")
            setApproveOTModal({ isOpen: false, otData: null });
            fetchOTs();
        } catch (e) {
            setApproveOTModal({ isOpen: false, otData: null });
            toast.error("DUYỆT THẤT BẠI")
            console.error("approve OT error:", e);
        }
    };

    const openApproveOTModal = (ot) => {
        setApproveOTModal({
            isOpen: true,
            otData: ot,
        });
    };

    const closeApproveOTModal = () => {
        setApproveOTModal({ isOpen: false, otData: null });
    };

    const colSpanCount = canApprove ? 10 : 9;
    const otColSpanCount = canApprove ? 10 : 9;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-start gap-4">
                    <div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-800">Yêu cầu của tôi</h1>

                            {/* Tabs */}
                            <div className="flex rounded-lg border bg-gray-100 p-1">
                                <button
                                    onClick={() => setActiveTab("LEAVE")}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition flex items-center gap-2
                    ${activeTab === "LEAVE"
                                            ? "bg-white text-blue-600 shadow"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Đơn nghỉ
                                    {pendingCount > 0 && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => setActiveTab("OT")}
                                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition flex items-center gap-2
                    ${activeTab === "OT"
                                            ? "bg-white text-blue-600 shadow"
                                            : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    Đơn OT
                                    {pendingOTCount > 0 && (
                                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-bold">
                                            {pendingOTCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* {activeTab === "LEAVE" ? (
              <>
                <p className="text-sm text-gray-500">Danh sách đơn nghỉ ({pagination.total})</p>
                <p className="text-xs text-gray-400">Hiển thị sau lọc: {filteredLeaves.length}</p>
                <p className="text-xs text-gray-400">
                  Đang chờ duyệt:{" "}
                  <span className="font-semibold text-red-600">{pendingCount}</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Tab hiển thị các đơn tăng ca (OT)</p>
            )} */}
                    </div>
                </div>

                <Button
                    variant="secondary"
                    className="flex gap-2 items-center"
                    onClick={activeTab === "LEAVE" ? fetchLeaves : fetchOTs}
                >
                    {(activeTab === "LEAVE" ? loading : otLoading) ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    Làm mới
                </Button>
            </div>

            {/* Tab LEAVE */}
            {activeTab === "LEAVE" && (
                <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
                    <div className="p-4 bg-gray-50 border-b flex gap-4 flex-wrap">
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
                                    {canApprove && <th className="p-4 text-center">Action</th>}
                                </tr>
                            </thead>

                            <tbody className="divide-y bg-white">
                                {loading ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan={colSpanCount}>
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang tải dữ liệu...
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredLeaves.length === 0 ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan={colSpanCount}>
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
                                                    <p className="text-xs text-gray-500">{lv.employeeId?.employeeCode || ""}</p>
                                                </td>

                                                <td className="p-4 text-gray-700">
                                                    {leaveTypeLabel[lv.leaveType] || lv.leaveType || "--"}
                                                </td>

                                                <td className="p-4 text-gray-700">
                                                    {leaveScopeLabel[lv.leaveScope] || lv.leaveScope || "--"}
                                                </td>

                                                <td className="p-4 text-gray-700">{formatDate(lv.fromDate)}</td>
                                                <td className="p-4 text-gray-700">{formatDate(lv.toDate)}</td>

                                                <td className="p-4 text-gray-700 font-semibold">{lv.totalDays ?? "--"}</td>

                                                <td className="p-4 text-gray-600 max-w-[360px]">
                                                    <span className="line-clamp-2">{lv.reason || "--"}</span>
                                                </td>

                                                <td className="p-4">
                                                    <StatusBadge
                                                        statusKey={displayStatus}
                                                        statusText={statusLabel[displayStatus] || displayStatus}
                                                    />
                                                </td>

                                                <td className="p-4 text-xs text-gray-500">{formatDateTime(lv.createdAt)}</td>

                                                {canApprove && (
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
            )}

            {/* Tab OT */}
            {activeTab === "OT" && (
                <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
                    {/* OT Filter Bar - LEFT */}
                    <div className="p-4 bg-gray-50 border-b flex flex-wrap gap-3 items-center justify-between">
                        {/* ✅ LEFT: search + filters */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Search theo tên */}
                            <div className="relative min-w-[260px] max-w-md">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tìm theo tên nhân sự..."
                                    value={otFilters.searchName}
                                    onChange={(e) => setOtFilters((p) => ({ ...p, searchName: e.target.value }))}
                                />
                            </div>

                            {/* Trạng thái: Đã duyệt / Chưa duyệt */}
                            <select
                                className="border rounded-lg px-3 py-2 text-sm outline-none"
                                value={otFilters.statusGroup}
                                onChange={(e) => setOtFilters((p) => ({ ...p, statusGroup: e.target.value }))}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="PENDING">Chưa duyệt</option>
                                <option value="APPROVED">Đã duyệt</option>
                            </select>

                            {/* Loại OT */}
                            <select
                                className="border rounded-lg px-3 py-2 text-sm outline-none"
                                value={otFilters.otType}
                                onChange={(e) => setOtFilters((p) => ({ ...p, otType: e.target.value }))}
                            >
                                <option value="">Tất cả loại OT</option>
                                <option value="WEEKDAY">Ngày thường</option>
                                <option value="WEEKEND">Cuối tuần</option>
                                <option value="HOLIDAY">Ngày lễ</option>
                            </select>
                        </div>

                        {/* ✅ RIGHT: refresh only */}
                        {/* <Button variant="secondary" className="flex gap-2 items-center" onClick={fetchOTs}>
              {otLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Làm mới
            </Button> */}
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-white border-b text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
                                <tr>
                                    <th className="p-4">Nhân sự</th>
                                    <th className="p-4">Ngày OT</th>
                                    <th className="p-4">Loại OT</th>
                                    <th className="p-4">Từ - Đến</th>
                                    <th className="p-4">Tổng giờ</th>
                                    <th className="p-4">Giờ duyệt</th>
                                    <th className="p-4">Lý do</th>
                                    <th className="p-4">Trạng thái</th>
                                    <th className="p-4">Ngày tạo</th>
                                    {canApprove && <th className="p-4 text-center">Action</th>}
                                </tr>
                            </thead>

                            <tbody className="divide-y bg-white">
                                {otLoading ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan={otColSpanCount}>
                                            <span className="inline-flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Đang tải dữ liệu...
                                            </span>
                                        </td>
                                    </tr>
                                ) : filteredOTs.length === 0 ? (
                                    <tr>
                                        <td className="p-6 text-center text-gray-500" colSpan={otColSpanCount}>
                                            Không có đơn OT nào
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOTs.map((ot) => {
                                        const st = normalizeStatus(ot?.status);
                                        const canApproveOT = canApprove && st === "PENDING";

                                        return (
                                            <tr
                                                key={ot?._id || `${ot?.employeeId?._id}-${ot?.date}-${ot?.startTime}`}
                                                className="hover:bg-blue-50/30"
                                            >
                                                <td className="p-4">
                                                    <p className="font-semibold text-gray-800">
                                                        {ot?.employeeId?.fullName || "--"}
                                                    </p>
                                                </td>

                                                <td className="p-4 text-gray-700">{formatDate(ot?.date)}</td>

                                                <td className="p-4 text-gray-700">
                                                    {otTypeLabel[ot?.otType] || ot?.otType || "--"}
                                                </td>

                                                <td className="p-4 text-gray-700">
                                                    {ot?.startTime || "--"} - {ot?.endTime || "--"}
                                                </td>

                                                <td className="p-4 text-gray-700 font-semibold">
                                                    {formatHours(ot?.totalHours)}
                                                </td>

                                                <td className="p-4 text-gray-700">{formatHours(ot?.approvedHours)}</td>

                                                <td className="p-4 text-gray-600 max-w-[360px]">
                                                    <span className="line-clamp-2">{ot?.reason || "--"}</span>
                                                </td>

                                                <td className="p-4">
                                                    <StatusBadge statusKey={st} statusText={statusLabel[st] || st} />
                                                </td>

                                                <td className="p-4 text-xs text-gray-500">
                                                    {formatDateTime(ot?.createdAt)}
                                                </td>

                                                {canApprove && (
                                                    <td className="p-4">
                                                        <div className="flex justify-center">
                                                            <button
                                                                disabled={!canApproveOT}
                                                                onClick={() => openApproveOTModal(ot)}
                                                                className={`p-2 rounded border text-xs font-semibold inline-flex items-center gap-1
                                  ${canApproveOT
                                                                        ? "text-green-600 border-green-200 hover:bg-green-50"
                                                                        : "text-gray-300 border-gray-200 cursor-not-allowed"
                                                                    }`}
                                                                title="Duyệt OT"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                                Duyệt
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
                </Card>
            )}

            {/* Approve OT Modal */}
            <ApproveOTModal
                isOpen={approveOTModal.isOpen}
                onClose={closeApproveOTModal}
                otData={approveOTModal.otData}
                onConfirm={handleApproveOT}
            />
        </div>
    );
};

export default MyLeave;
