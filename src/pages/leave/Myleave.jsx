import { useEffect, useMemo, useState, useRef } from "react";
import { Search, Loader2, RefreshCw, CheckCircle2, XCircle, Eye, Plus, Edit, Trash2, Ban, MoreHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { leaveAPI } from "../../apis/leaveAPI";
import { OTApi } from "../../apis/OTAPI";
import ApproveOTModal from "../../components/modals/ApproveOTModal";
import LeaveDetailModal from "../../components/modals/LeaveDetailModal";
import LeaveRequestModal from "../../components/modals/CreateLeaveModal";
import ModalOT from "../../components/modals/OTModal";
import OTDetailModal from "../../components/modals/OTDetailModal";
import { toast } from "react-toastify";

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

const formatDateRange = (fromDate, toDate) => {
    const from = formatDate(fromDate);
    const to = formatDate(toDate);
    if (from === "--" && to === "--") return "--";
    if (from === to || to === "--") return from;
    if (from === "--") return to;
    return `${from} - ${to}`;
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
    // Làm tròn đến 2 chữ số thập phân
    return Number(n).toFixed(2);
};

const normalizeStatus = (st) => {
    if (st === "CANCELED") return "CANCELLED";
    return st;
};

// Sinh dãy số trang có dấu "..." khi nhiều trang
const buildPageList = (current, total) => {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages = [1];
    if (current > 3) pages.push("...");
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
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
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${cls}`}>
            {statusText}
        </span>
    );
};

const actionButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors";

const menuButtonClass =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700";

const tableHeaderClass = "px-3 py-3 text-xs uppercase text-gray-500 font-semibold";
const tableCellClass = "px-3 py-3";

const MyLeave = () => {
    const location = useLocation();
    const isOTOnlyPage = location.pathname === "/leave/ot";
    const initialTab = isOTOnlyPage ? "OT" : location.state?.activeTab || "LEAVE";
    const [activeTab, setActiveTab] = useState(initialTab); // "LEAVE" | "OT"

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

    const [otPagination, setOtPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });

    // ✅ OT Approve Modal
    const [approveOTModal, setApproveOTModal] = useState({
        isOpen: false,
        otData: null,
    });
    const [otDetailModal, setOtDetailModal] = useState({
        isOpen: false,
        otData: null,
    });

    // ✅ Leave Detail Modal
    const [leaveDetailModal, setLeaveDetailModal] = useState({
        isOpen: false,
        leaveId: null,
    });
    const [leaveFormModal, setLeaveFormModal] = useState({
        isOpen: false,
        mode: "create",
        leave: null,
    });
    const [otFormModal, setOtFormModal] = useState({
        isOpen: false,
        mode: "create",
        ot: null,
    });
    const [openActionMenu, setOpenActionMenu] = useState(null);

    useEffect(() => {
        if (isOTOnlyPage && activeTab !== "OT") {
            setActiveTab("OT");
        }
    }, [activeTab, isOTOnlyPage]);

    // ✅ Lưu approval level của user hiện tại
    // const [userApprovalLevel, setUserApprovalLevel] = useState(null);

    // ✅ Ref để track đã fetch data chưa
    const hasFetchedLeaves = useRef(false);
    const hasFetchedOTs = useRef(false);
    const actionMenuRef = useRef(null);

    // Fetch LEAVE lần đầu khi mở tab
    useEffect(() => {
        if (activeTab !== "LEAVE") return;
        if (hasFetchedLeaves.current) return;
        const t = setTimeout(() => {
            fetchLeaves(pagination.page, pagination.limit);
            hasFetchedLeaves.current = true;
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Fetch lại LEAVE khi đổi phân trang sau lần tải đầu
    useEffect(() => {
        if (activeTab !== "LEAVE") return;
        if (!hasFetchedLeaves.current) return;
        const t = setTimeout(() => {
            fetchLeaves(pagination.page, pagination.limit);
        }, 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.limit]);

    // Fetch OT lần đầu khi mở tab
    useEffect(() => {
        if (activeTab !== "OT") return;
        if (hasFetchedOTs.current) return;
        const t = setTimeout(() => {
            fetchOTs(otPagination.page, otPagination.limit);
            hasFetchedOTs.current = true;
        }, 200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Fetch lại OT khi đổi phân trang sau lần tải đầu
    useEffect(() => {
        if (activeTab !== "OT") return;
        if (!hasFetchedOTs.current) return;
        const t = setTimeout(() => {
            fetchOTs(otPagination.page, otPagination.limit);
        }, 200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [otPagination.page, otPagination.limit]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!actionMenuRef.current?.contains(event.target)) {
                setOpenActionMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const isLEADER = useMemo(() => {
        if (typeof role === "string") return role === "LEADER";
        if (Array.isArray(role)) return role.includes("LEADER");
        if (role?.name) return role.name === "LEADER";
        return false;
    }, [role]);

    // Kiểm tra có quyền duyệt không (ADMIN, HR, MANAGER)
    const canApprove = useMemo(() => {
        return isAdmin || isHR || isManager || isLEADER;
    }, [isAdmin, isHR, isManager, isLEADER]);

    const isSuperApprover = useMemo(() => {
        return isAdmin || isHR;
    }, [isAdmin, isHR]);

    const getEntityId = (value) => {
        if (!value) return "";
        if (typeof value === "string") return value;
        return value._id || value.id || "";
    };

    const currentEmployeeId = () => localStorage.getItem("employee_ID") || "";

    const isOwnRequest = (request) => {
        return getEntityId(request?.employeeId) === currentEmployeeId();
    };

    const getSuperApprovalLevel = (leave) => {
        const chain = Array.isArray(leave?.approvalChain) ? leave.approvalChain : [];
        const pendingStep = chain.find((step) => normalizeStatus(step?.status) === "PENDING");
        if (pendingStep?.level) return pendingStep.level;

        const maxLevel = chain.reduce((max, step) => Math.max(max, Number(step?.level) || 0), 0);
        return maxLevel > 0 ? maxLevel + 1 : 1;
    };

    const getLeaveApprovalContext = (leave) => {
        const displayStatus = normalizeStatus(leave?.status);
        if (displayStatus !== "PENDING") {
            return {
                canAction: false,
                approvalLevel: null,
                userApproval: null,
                title: "Đơn đã được xử lý",
            };
        }

        if (isSuperApprover) {
            return {
                canAction: true,
                approvalLevel: getSuperApprovalLevel(leave),
                userApproval: null,
                title: "Duyệt nhanh với quyền Admin/HR",
            };
        }

        const accountID = localStorage.getItem("employee_ID");
        const approvalChain = Array.isArray(leave?.approvalChain) ? leave.approvalChain : [];
        const userApproval = approvalChain.find((step) => getEntityId(step?.approver) === accountID);
        const userApprovalLevel = userApproval?.level || null;

        if (!userApprovalLevel || !userApproval) {
            return {
                canAction: false,
                approvalLevel: null,
                userApproval: null,
                title: "Bạn không nằm trong cấp duyệt của đơn này",
            };
        }

        if (normalizeStatus(userApproval.status) !== "PENDING") {
            return {
                canAction: false,
                approvalLevel: userApprovalLevel,
                userApproval,
                title: "Đã xử lý cấp duyệt này",
            };
        }

        if (userApprovalLevel > 1) {
            const lowerLevelsApproved = approvalChain
                .filter((step) => Number(step?.level) < Number(userApprovalLevel))
                .every((step) => normalizeStatus(step?.status) === "APPROVED");

            if (!lowerLevelsApproved) {
                return {
                    canAction: false,
                    approvalLevel: userApprovalLevel,
                    userApproval,
                    title: "Chưa đến lượt duyệt",
                };
            }
        }

        return {
            canAction: true,
            approvalLevel: userApprovalLevel,
            userApproval,
            title: "Duyệt",
        };
    };

    const searchQuery = useMemo(() => filters.search.trim().toLowerCase(), [filters.search]);
    const otSearchQuery = useMemo(
        () => otFilters.searchName.trim().toLowerCase(),
        [otFilters.searchName]
    );

    const fetchLeaves = async (page = pagination.page, limit = pagination.limit) => {
        setLoading(true);
        try {
            const raw = localStorage.getItem("role");
            let res;

            // ADMIN, HR, MANAGER, LEADER gọi API getbyADMIN, còn lại gọi getbyUSER
            if (raw === "ADMIN" || raw === "HR" || raw === "MANAGER" || raw === "LEADER") {
                res = await leaveAPI.getbyADMIN(page, limit);
            } else {
                res = await leaveAPI.getbyUSER(page, limit);
            }

            // ✅ Response LEAVE: { data: [...], pagination: { page, limit, totalRecords, totalPages } }
            const responseData = res?.data;
            const rows = responseData?.data || [];
            const paginationData = responseData?.pagination || {};
            const total = paginationData.totalRecords ?? paginationData.total ?? rows.length;
            const totalPages =
                paginationData.totalPages ?? Math.max(1, Math.ceil(total / (paginationData.limit ?? limit)));

            // ✅ Lấy employee_ID từ localStorage
            const accountID = localStorage.getItem("employee_ID");
            console.log("employee_ID:", accountID);

            // ✅ Kiểm tra level duyệt của user hiện tại
            let currentUserLevel = null;

            rows.forEach((leave) => {
                if (leave.approvalChain && Array.isArray(leave.approvalChain)) {
                    // Kiểm tra level 1
                    const level1 = leave.approvalChain.find(a => a.level === 1);
                    if (level1?.approver?._id === accountID) {
                        currentUserLevel = 1;
                        console.log(`[Approver] User là cấp duyệt level 1 cho đơn ${leave._id}`);
                    }

                    // Kiểm tra level 2
                    const level2 = leave.approvalChain.find(a => a.level === 2);
                    if (level2?.approver?._id === accountID) {
                        currentUserLevel = 2;
                        console.log(`[Approver] User là cấp duyệt level 2 cho đơn ${leave._id}`);
                    }
                }
            });

            // Lưu level vào state
            // setUserApprovalLevel(currentUserLevel);

            if (currentUserLevel) {
                console.log(`[Approver] User hiện tại có quyền duyệt ở level ${currentUserLevel}`);
            } else {
                console.log("[Approver] User hiện tại KHÔNG có quyền duyệt");
            }


            const normalizedRows = rows.map((lv) => ({
                ...lv,
                status: normalizeStatus(lv?.status),
            }));

            setLeaves(normalizedRows);
            setPagination((p) => ({ ...p, total, totalPages }));
        } catch (e) {
            console.error("fetchLeaves error:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchOTs = async (page = otPagination.page, limit = otPagination.limit) => {
        setOtLoading(true);
        try {
            const raw = localStorage.getItem("role");
            let res;

            // ADMIN, HR, MANAGER gọi API getALL, còn lại gọi get
            if (raw === "ADMIN" || raw === "HR" || raw === "MANAGER") {
                res = await OTApi.getALL(page, limit);
            } else {
                res = await OTApi.get(page, limit);
            }

            // ✅ Response OT: { data: [...], total, currentPage, results }
            const responseData = res?.data;
            const rows = responseData?.data || [];
            const safeRows = Array.isArray(rows) ? rows : [];
            const total = responseData?.total ?? safeRows.length;
            const totalPages = Math.max(1, Math.ceil(total / limit));

            setOts(safeRows);
            setOtPagination((p) => ({ ...p, total, totalPages }));
        } catch (error) {
            console.log("DỮ LIỆU OT Lỗi :", error);
            setOts([]);
        } finally {
            setOtLoading(false);
        }
    };

    const filteredLeaves = useMemo(() => {
        const type = filters.leaveType;
        const st = filters.status;
        const q = searchQuery;

        const filtered = leaves.filter((lv) => {
            const name = (lv.employeeId?.fullName || "").toLowerCase();
            const reason = (lv.reason || "").toLowerCase();

            const matchSearch = !q || name.includes(q) || reason.includes(q);
            const matchType = !type || lv?.leaveType === type;
            const matchStatus = !st || normalizeStatus(lv?.status) === st;

            return matchSearch && matchType && matchStatus;
        });

        // Sắp xếp: PENDING lên đầu, sau đó sắp xếp theo thời gian tạo mới nhất
        return filtered.sort((a, b) => {
            const statusA = normalizeStatus(a.status);
            const statusB = normalizeStatus(b.status);
            
            // PENDING lên đầu
            if (statusA === "PENDING" && statusB !== "PENDING") return -1;
            if (statusA !== "PENDING" && statusB === "PENDING") return 1;
            
            // Trong cùng trạng thái, sắp xếp theo thời gian tạo mới nhất lên đầu
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
    }, [leaves, filters.leaveType, filters.status, searchQuery]);

    const pendingCount = useMemo(() => {
        return leaves.filter((lv) => normalizeStatus(lv.status) === "PENDING").length;
    }, [leaves]);

    const filteredOTs = useMemo(() => {
        const q = otSearchQuery;
        const stGroup = otFilters.statusGroup; // "PENDING" | "APPROVED" | "REJECTED" | ""
        const type = otFilters.otType;

        const filtered = ots.filter((ot) => {
            const name = (ot?.employeeId?.fullName || "").toLowerCase();
            const st = normalizeStatus(ot?.status);

            const matchName = !q || name.includes(q);
            const matchStatus = !stGroup || st === stGroup;
            const matchType = !type || ot?.otType === type;

            return matchName && matchStatus && matchType;
        });

        // Sắp xếp: PENDING lên đầu, sau đó sắp xếp theo thời gian tạo mới nhất
        return filtered.sort((a, b) => {
            const statusA = normalizeStatus(a?.status);
            const statusB = normalizeStatus(b?.status);
            
            // PENDING lên đầu
            if (statusA === "PENDING" && statusB !== "PENDING") return -1;
            if (statusA !== "PENDING" && statusB === "PENDING") return 1;
            
            // Trong cùng trạng thái, sắp xếp theo thời gian tạo mới nhất lên đầu
            const dateA = new Date(a?.createdAt || 0);
            const dateB = new Date(b?.createdAt || 0);
            return dateB - dateA;
        });
    }, [ots, otFilters.statusGroup, otFilters.otType, otSearchQuery]);

    // ✅ Pagination từ server
    const leaveTotalPages = pagination.totalPages || 1;
    const otTotalPages = otPagination.totalPages || 1;

    const handleApprove = async (leaveId) => {
        try {
            const leave = leaves.find((lv) => lv._id === leaveId);
            if (!leave) {
                toast.error("Không tìm thấy đơn nghỉ");
                return;
            }

            const approvalContext = getLeaveApprovalContext(leave);
            if (!approvalContext.canAction || !approvalContext.approvalLevel) {
                toast.error(approvalContext.title || "Bạn không có quyền duyệt đơn này");
                return;
            }

            const payload = {
                approvalLevel: approvalContext.approvalLevel,
                status: "APPROVED",
            };

            console.log("[handleApprove] Payload:", payload);
            const res = await leaveAPI.APPROVED(leaveId, payload);
            console.log("[handleApprove] res:", res);

            toast.success(`Đã duyệt đơn nghỉ (Level ${approvalContext.approvalLevel})`);
            await fetchLeaves();
        } catch (e) {
            console.error("approve error:", e);
            const errorMsg = e.response?.data?.message || "Duyệt đơn thất bại";
            toast.error(errorMsg);
        }
    };
    const handleCancel = async (leaveId) => {
        try {
            if (!window.confirm("Hủy đơn nghỉ này?")) return;
            await leaveAPI.CANCELLED(leaveId);
            toast.success("Đã hủy đơn nghỉ");
            await fetchLeaves();
        } catch (e) {
            console.error("cancel error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Hủy đơn nghỉ thất bại");
        }
    };

    const handleRejectLeave = async (leave) => {
        const approvalContext = getLeaveApprovalContext(leave);
        if (!approvalContext.canAction || !approvalContext.approvalLevel) {
            toast.error(approvalContext.title || "Bạn không có quyền từ chối đơn này");
            return;
        }

        const rejectionReason = window.prompt("Nhập lý do từ chối đơn nghỉ:");
        if (!rejectionReason?.trim()) return;

        try {
            await leaveAPI.APPROVED(leave._id, {
                approvalLevel: approvalContext.approvalLevel,
                status: "REJECTED",
                rejectionReason: rejectionReason.trim(),
            });
            toast.success("Đã từ chối đơn nghỉ");
            await fetchLeaves();
        } catch (e) {
            console.error("reject leave error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Từ chối đơn nghỉ thất bại");
        }
    };

    const handleDeleteLeave = async (leaveId) => {
        if (!window.confirm("Xóa vĩnh viễn đơn nghỉ đang chờ duyệt này?")) return;
        try {
            await leaveAPI.delete(leaveId);
            toast.success("Đã xóa đơn nghỉ");
            await fetchLeaves();
        } catch (e) {
            console.error("delete leave error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Xóa đơn nghỉ thất bại");
        }
    };

    const handleSubmitLeaveForm = async (payload) => {
        try {
            if (leaveFormModal.mode === "edit" && leaveFormModal.leave?._id) {
                await leaveAPI.updatePending(leaveFormModal.leave._id, payload);
                toast.success("Đã cập nhật đơn nghỉ");
            } else {
                await leaveAPI.post(payload);
                toast.success("Đã tạo đơn nghỉ");
            }
            setLeaveFormModal({ isOpen: false, mode: "create", leave: null });
            await fetchLeaves(1, pagination.limit);
            setPagination((p) => ({ ...p, page: 1 }));
        } catch (e) {
            console.error("submit leave error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Lưu đơn nghỉ thất bại");
        }
    };
    const handleApproveOT = async (otId, payload) => {
        console.log("RES otId: ", otId);
        console.log("RES payload: ", payload);
        try {
            const res = await OTApi.put(otId, payload);
            console.log("RESPONSE :", res)
            toast.success("DUYỆT THÀNH CÔNG")
            setApproveOTModal({ isOpen: false, otData: null });
            fetchOTs();
        } catch (e) {
            setApproveOTModal({ isOpen: false, otData: null });

            toast.error(`${e.normalizedMessage}`)
            console.error("approve OT error:", e);
        }
    };

    const handleCancelOT = async (otId) => {
        try {
            if (!window.confirm("Hủy đơn OT này?")) return;
            await OTApi.cancel(otId);
            toast.success("Đã hủy đơn OT");
            fetchOTs();
        } catch (e) {
            console.error("cancel OT error:", e);
            const errorMsg = e.normalizedMessage || e.response?.data?.message || "Hủy đơn OT thất bại";
            toast.error(errorMsg);
        }
    };

    const handleRejectOT = async (ot) => {
        const rejectionReason = window.prompt("Nhập lý do từ chối đơn OT:");
        if (!rejectionReason?.trim()) return;

        try {
            await OTApi.approve(ot._id, {
                status: "REJECTED",
                approvedStartTime: ot.startTime,
                approvedEndTime: ot.endTime,
                rejectionReason: rejectionReason.trim(),
            });
            toast.success("Đã từ chối đơn OT");
            fetchOTs();
        } catch (e) {
            console.error("reject OT error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Từ chối đơn OT thất bại");
        }
    };

    const handleDeleteOT = async (otId) => {
        if (!window.confirm("Xóa vĩnh viễn đơn OT đang chờ duyệt này?")) return;
        try {
            await OTApi.delete(otId);
            toast.success("Đã xóa đơn OT");
            fetchOTs();
        } catch (e) {
            console.error("delete OT error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Xóa đơn OT thất bại");
        }
    };

    const handleSubmitOTForm = async (payload) => {
        try {
            if (otFormModal.mode === "edit" && otFormModal.ot?._id) {
                await OTApi.update(otFormModal.ot._id, payload);
                toast.success("Đã cập nhật đơn OT");
            } else {
                await OTApi.post(payload);
                toast.success("Đã tạo đơn OT");
            }
            setOtFormModal({ isOpen: false, mode: "create", ot: null });
            await fetchOTs(1, otPagination.limit);
            setOtPagination((p) => ({ ...p, page: 1 }));
        } catch (e) {
            console.error("submit OT error:", e);
            toast.error(e.normalizedMessage || e.response?.data?.message || "Lưu đơn OT thất bại");
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

    const openLeaveDetailModal = (leaveId) => {
        setLeaveDetailModal({
            isOpen: true,
            leaveId: leaveId,
        });
    };

    const closeLeaveDetailModal = () => {
        setLeaveDetailModal({ isOpen: false, leaveId: null });
    };

    const toggleActionMenu = (key) => {
        setOpenActionMenu((prev) => (prev === key ? null : key));
    };

    const colSpanCount = 6;
    const otColSpanCount = 6;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div className="flex items-start gap-4">
                    <div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-800">
                                {isOTOnlyPage ? "Đơn OT" : "Yêu cầu Nghỉ/OT"}
                            </h1>

                            {/* Tabs */}
                            <div className="flex rounded-lg border bg-gray-100 p-1">
                                {!isOTOnlyPage && (
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
                                )}

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

                <div className="flex flex-wrap gap-2">
                    <Button
                        className="flex gap-2 items-center"
                        onClick={() =>
                            activeTab === "LEAVE"
                                ? setLeaveFormModal({ isOpen: true, mode: "create", leave: null })
                                : setOtFormModal({ isOpen: true, mode: "create", ot: null })
                        }
                    >
                        <Plus size={16} />
                        {activeTab === "LEAVE" ? "Tạo đơn nghỉ" : "Tạo đơn OT"}
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex gap-2 items-center"
                        onClick={() =>
                            activeTab === "LEAVE"
                                ? fetchLeaves(pagination.page, pagination.limit)
                                : fetchOTs(otPagination.page, otPagination.limit)
                        }
                    >
                        {(activeTab === "LEAVE" ? loading : otLoading) ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Tab LEAVE */}
            {activeTab === "LEAVE" && (
                <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
                    <div className="border-b bg-gray-50/80 p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative min-w-[260px] flex-[1_1_320px] max-w-xl">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tìm theo lý do / tên nhân sự..."
                                value={filters.search}
                                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                            />
                        </div>

                        <select
                            className="min-w-[190px] border rounded-lg bg-white px-3 py-2 text-sm outline-none"
                            value={filters.leaveType}
                            onChange={(e) => setFilters((p) => ({ ...p, leaveType: e.target.value }))}
                        >
                            <option value="">Tất cả loại nghỉ</option>
                            <option value="ANNUAL">Nghỉ phép năm</option>
                            <option value="UNPAID">Nghỉ không lương</option>
                            <option value="SICK">Nghỉ ốm / bệnh</option>
                            <option value="MATERNITY">Nghỉ thai sản</option>
                        </select>

                        <select
                            className="min-w-[190px] border rounded-lg bg-white px-3 py-2 text-sm outline-none"
                            value={filters.status}
                            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ duyệt</option>
                            <option value="APPROVED">Đã duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-white border-b text-xs uppercase text-gray-500 font-semibold sticky top-0 z-10">
                                <tr>
                                    <th className="w-[144px] px-2.5 py-3">Nhân sự</th>
                                    <th className="w-[120px] px-2.5 py-3">Loại nghỉ</th>
                                    <th className="w-[156px] px-2.5 py-3">Xin nghỉ ngày</th>
                                    <th className="w-[110px] px-2.5 py-3">Trạng thái</th>
                                    <th className="w-[52px] px-2.5 py-3 text-center">Chi tiết</th>
                                    <th className="w-[86px] px-2.5 py-3 text-center">Hành động</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
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
                                        const approvalContext = getLeaveApprovalContext(lv);
                                        const canAction = approvalContext.canAction;
                                        const ownLeave = isOwnRequest(lv);
                                        const canEditLeave = ownLeave && displayStatus === "PENDING";
                                        const canDeleteLeave = (ownLeave || isSuperApprover) && displayStatus === "PENDING";
                                        const canCancelLeave = (ownLeave || canApprove) && ["PENDING", "APPROVED"].includes(displayStatus);
                                        const leaveMenuKey = `leave-${lv._id}`;
                                        const showLeavePrimaryApprove = canApprove && canAction;
                                        const showLeavePrimaryEdit = !showLeavePrimaryApprove && canEditLeave;

                                        return (
                                            <tr key={lv._id} className="align-top hover:bg-blue-50/30">
                                                <td className="px-2.5 py-3">
                                                    <p className="font-semibold text-gray-800">
                                                        {lv.employeeId?.fullName || "--"}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{lv.employeeId?.employeeCode || ""}</p>
                                                </td>

                                                <td className="px-2.5 py-3 text-gray-700">
                                                    {leaveTypeLabel[lv.leaveType] || lv.leaveType || "--"}
                                                </td>

                                                <td className="px-2.5 py-3 text-gray-700 whitespace-nowrap">
                                                    {formatDateRange(lv.fromDate, lv.toDate)}
                                                </td>


                                                <td className="px-2.5 py-3 align-middle">
                                                    <StatusBadge
                                                        statusKey={displayStatus}
                                                        statusText={statusLabel[displayStatus] || displayStatus}
                                                    />
                                                </td>

                                                <td className="px-2.5 py-3 align-middle">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => openLeaveDetailModal(lv._id)}
                                                            className={`${actionButtonClass} text-blue-600 border-blue-200 hover:bg-blue-50`}
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className="px-2.5 py-3 align-middle">
                                                    <div className="relative flex items-center justify-center gap-1.5" ref={openActionMenu === leaveMenuKey ? actionMenuRef : null}>
                                                        {showLeavePrimaryApprove && (
                                                            <button
                                                                onClick={() => handleApprove(lv._id)}
                                                                className={`${actionButtonClass} border-green-200 text-green-600 hover:bg-green-50`}
                                                                title={approvalContext.title}
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        )}
                                                        {showLeavePrimaryEdit && (
                                                            <button
                                                                onClick={() => setLeaveFormModal({ isOpen: true, mode: "edit", leave: lv })}
                                                                className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
                                                                title="Sửa đơn nghỉ"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                        {!showLeavePrimaryApprove && !showLeavePrimaryEdit && (
                                                            <span className="inline-block h-9 w-9" />
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => toggleActionMenu(leaveMenuKey)}
                                                            className={menuButtonClass}
                                                            title="Thêm thao tác"
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>

                                                        {openActionMenu === leaveMenuKey && (
                                                            <div className="absolute right-0 top-11 z-20 min-w-[176px] rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        openLeaveDetailModal(lv._id);
                                                                        setOpenActionMenu(null);
                                                                    }}
                                                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <Eye size={14} />
                                                                    Xem chi tiết
                                                                </button>
                                                                {canApprove && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={!canAction}
                                                                        onClick={() => {
                                                                            handleRejectLeave(lv);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white"
                                                                    >
                                                                        <XCircle size={14} />
                                                                        Từ chối
                                                                    </button>
                                                                )}
                                                                {canEditLeave && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setLeaveFormModal({ isOpen: true, mode: "edit", leave: lv });
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
                                                                    >
                                                                        <Edit size={14} />
                                                                        Sửa
                                                                    </button>
                                                                )}
                                                                {canCancelLeave && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleCancel(lv._id);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-orange-600 hover:bg-orange-50"
                                                                    >
                                                                        <Ban size={14} />
                                                                        Hủy
                                                                    </button>
                                                                )}
                                                                {canDeleteLeave && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            handleDeleteLeave(lv._id);
                                                                            setOpenActionMenu(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        Xóa
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t bg-white flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Trang {pagination.page}/{leaveTotalPages} • Tổng {pagination.total} đơn
                        </p>
                        <div className="flex gap-1 items-center">
                            <select
                                className="border rounded-lg px-2 py-1 text-xs outline-none mr-2"
                                value={pagination.limit}
                                onChange={(e) =>
                                    setPagination((p) => ({ ...p, page: 1, limit: Number(e.target.value) }))
                                }
                            >
                                {[10, 20, 50, 100].map((n) => (
                                    <option key={n} value={n}>
                                        {n} / trang
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            {buildPageList(pagination.page, leaveTotalPages).map((p, idx) =>
                                p === "..." ? (
                                    <span key={`dots-${idx}`} className="px-2 text-gray-400 text-sm">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                                        className={`px-3 py-1 text-sm border rounded-md ${
                                            p === pagination.page
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                type="button"
                                disabled={pagination.page >= leaveTotalPages}
                                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Tab OT */}
            {activeTab === "OT" && (
                <Card className="flex flex-col h-full p-0 overflow-hidden border border-gray-200">
                    {/* OT Filter Bar - LEFT */}
                    <div className="border-b bg-gray-50/80 p-4">
                        {/* ✅ LEFT: search + filters */}
                        <div className="flex flex-wrap gap-3">
                            {/* Search theo tên */}
                            <div className="relative min-w-[260px] flex-[1_1_320px] max-w-xl">
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

                            {/* Trạng thái: Đã duyệt / Chưa duyệt / Từ chối */}
                            <select
                                className="min-w-[190px] border rounded-lg bg-white px-3 py-2 text-sm outline-none"
                                value={otFilters.statusGroup}
                                onChange={(e) => setOtFilters((p) => ({ ...p, statusGroup: e.target.value }))}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="PENDING">Chưa duyệt</option>
                                <option value="APPROVED">Đã duyệt</option>
                                <option value="REJECTED">Từ chối</option>
                            </select>

                            {/* Loại OT */}
                            <select
                                className="min-w-[190px] border rounded-lg bg-white px-3 py-2 text-sm outline-none"
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
                                    <th className="w-[144px] px-2.5 py-3">Nhân sự</th>
                                    <th className="w-[96px] px-2.5 py-3">Ngày OT</th>
                                    <th className="w-[118px] px-2.5 py-3">Loại OT</th>
                                    <th className="w-[132px] px-2.5 py-3">Giờ đăng ký</th>
                                    <th className="w-[110px] px-2.5 py-3">Trạng thái</th>
                                    <th className="w-[86px] px-2.5 py-3 text-center">Hành động</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
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
                                        const ownOT = isOwnRequest(ot);
                                        const canEditOT = ownOT && st === "PENDING";
                                        const canDeleteOT = ownOT && st === "PENDING";
                                        const canCancelOT = !ownOT && canApprove && ["PENDING", "APPROVED"].includes(st);
                                        return (
                                            <tr
                                                key={ot?._id || `${ot?.employeeId?._id}-${ot?.date}-${ot?.startTime}`}
                                                className="align-top hover:bg-blue-50/30"
                                            >
                                                <td className="px-2.5 py-3">
                                                    <p className="font-semibold text-gray-800">
                                                        {ot?.employeeId?.fullName || "--"}
                                                    </p>
                                                </td>

                                                <td className="px-2.5 py-3 text-gray-700 whitespace-nowrap">{formatDate(ot?.date)}</td>

                                                <td className="px-2.5 py-3 text-gray-700">
                                                    {otTypeLabel[ot?.otType] || ot?.otType || "--"}
                                                </td>

                                                <td className="px-2.5 py-3 text-gray-700 whitespace-nowrap">
                                                    {ot?.startTime && ot?.endTime 
                                                        ? `${ot.startTime} - ${ot.endTime}`
                                                        : "--"}
                                                </td>

                                                <td className="px-2.5 py-3 align-middle">
                                                    <StatusBadge statusKey={st} statusText={statusLabel[st] || st} />
                                                </td>

                                                <td className="px-2.5 py-3 align-middle">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOtDetailModal({ isOpen: true, otData: ot })}
                                                            className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
                                                            title="Chi tiết đơn OT"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        {canApproveOT && (
                                                            <button
                                                                onClick={() => openApproveOTModal(ot)}
                                                                className={`${actionButtonClass} border-green-200 text-green-600 hover:bg-green-50`}
                                                                title="Duyệt OT"
                                                            >
                                                                <CheckCircle2 size={14} />
                                                            </button>
                                                        )}
                                                        {canApprove && (
                                                            <button
                                                                type="button"
                                                                disabled={!canApproveOT}
                                                                onClick={() => handleRejectOT(ot)}
                                                                className={`${actionButtonClass} border-red-200 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300`}
                                                                title="Từ chối OT"
                                                            >
                                                                <XCircle size={14} />
                                                            </button>
                                                        )}
                                                        {canEditOT && (
                                                            <button
                                                                onClick={() => setOtFormModal({ isOpen: true, mode: "edit", ot })}
                                                                className={`${actionButtonClass} border-blue-200 text-blue-600 hover:bg-blue-50`}
                                                                title="Sửa đơn OT"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                        )}
                                                        {canCancelOT && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCancelOT(ot._id)}
                                                                className={`${actionButtonClass} border-orange-200 text-orange-600 hover:bg-orange-50`}
                                                                title="Hủy đơn OT"
                                                            >
                                                                <Ban size={14} />
                                                            </button>
                                                        )}
                                                        {canDeleteOT && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteOT(ot._id)}
                                                                className={`${actionButtonClass} border-gray-200 text-gray-700 hover:bg-gray-50`}
                                                                title="Xóa đơn OT"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t bg-white flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Trang {otPagination.page}/{otTotalPages} • Tổng {otPagination.total} đơn
                        </p>
                        <div className="flex gap-1 items-center">
                            <select
                                className="border rounded-lg px-2 py-1 text-xs outline-none mr-2"
                                value={otPagination.limit}
                                onChange={(e) =>
                                    setOtPagination((p) => ({ ...p, page: 1, limit: Number(e.target.value) }))
                                }
                            >
                                {[10, 20, 50, 100].map((n) => (
                                    <option key={n} value={n}>
                                        {n} / trang
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                disabled={otPagination.page <= 1}
                                onClick={() => setOtPagination((p) => ({ ...p, page: p.page - 1 }))}
                                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Trước
                            </button>
                            {buildPageList(otPagination.page, otTotalPages).map((p, idx) =>
                                p === "..." ? (
                                    <span key={`ot-dots-${idx}`} className="px-2 text-gray-400 text-sm">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setOtPagination((prev) => ({ ...prev, page: p }))}
                                        className={`px-3 py-1 text-sm border rounded-md ${
                                            p === otPagination.page
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "hover:bg-gray-50"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                            <button
                                type="button"
                                disabled={otPagination.page >= otTotalPages}
                                onClick={() => setOtPagination((p) => ({ ...p, page: p.page + 1 }))}
                                className="px-3 py-1 text-sm border rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {leaveFormModal.isOpen && (
                <LeaveRequestModal
                    onClose={() => setLeaveFormModal({ isOpen: false, mode: "create", leave: null })}
                    onConfirm={handleSubmitLeaveForm}
                    initialValues={leaveFormModal.leave}
                    title={leaveFormModal.mode === "edit" ? "Sửa đơn nghỉ" : "Tạo đơn nghỉ"}
                    submitLabel={leaveFormModal.mode === "edit" ? "Cập nhật" : "Gửi đơn"}
                />
            )}

            {otFormModal.isOpen && (
                <ModalOT
                    open={otFormModal.isOpen}
                    onClose={() => setOtFormModal({ isOpen: false, mode: "create", ot: null })}
                    onSubmit={handleSubmitOTForm}
                    initialValues={otFormModal.ot}
                    title={otFormModal.mode === "edit" ? "Sửa đơn OT" : "Tạo đơn OT"}
                    submitLabel={otFormModal.mode === "edit" ? "Cập nhật" : "Gửi đơn"}
                />
            )}

            {/* Approve OT Modal */}
            <ApproveOTModal
                isOpen={approveOTModal.isOpen}
                onClose={closeApproveOTModal}
                otData={approveOTModal.otData}
                onConfirm={handleApproveOT}
            />

            <OTDetailModal
                isOpen={otDetailModal.isOpen}
                onClose={() => setOtDetailModal({ isOpen: false, otData: null })}
                otData={otDetailModal.otData}
            />

            {/* Leave Detail Modal */}
            <LeaveDetailModal
                isOpen={leaveDetailModal.isOpen}
                onClose={closeLeaveDetailModal}
                leaveId={leaveDetailModal.leaveId}
            />
        </div>
    );
};

export default MyLeave;
