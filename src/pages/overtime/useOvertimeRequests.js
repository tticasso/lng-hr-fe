import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { OTApi } from "../../apis/OTAPI";
import {
  getEntityId,
  getRoleFlags,
  getStoredRole,
  normalizeStatus,
} from "./shared";

const currentEmployeeId = () => localStorage.getItem("employee_ID") || "";

export const useOvertimeRequests = ({ mode }) => {
  const role = useMemo(() => getStoredRole(), []);
  const { canApprove, isSuperApprover } = useMemo(() => getRoleFlags(role), [role]);

  const [loading, setLoading] = useState(true);
  const [ots, setOts] = useState([]);
  const [filters, setFilters] = useState({
    searchName: "",
    statusGroup: "",
    otType: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [otDetailModal, setOtDetailModal] = useState({
    isOpen: false,
    otData: null,
  });
  const [approveOTModal, setApproveOTModal] = useState({
    isOpen: false,
    otData: null,
  });
  const [otFormModal, setOtFormModal] = useState({
    isOpen: false,
    mode: "create",
    ot: null,
  });

  const searchQuery = useMemo(
    () => filters.searchName.trim().toLowerCase(),
    [filters.searchName]
  );

  const isOwnRequest = (request) => getEntityId(request?.employeeId) === currentEmployeeId();

  const getSuperApprovalLevel = (ot) => {
    const chain = Array.isArray(ot?.approvalChain) ? ot.approvalChain : [];
    const pendingStep = chain.find((step) => normalizeStatus(step?.status) === "PENDING");
    if (pendingStep?.level) return pendingStep.level;

    const maxLevel = chain.reduce((max, step) => Math.max(max, Number(step?.level) || 0), 0);
    return maxLevel > 0 ? maxLevel + 1 : 1;
  };

  const getOTApprovalContext = (ot) => {
    const status = normalizeStatus(ot?.status);
    if (status !== "PENDING") {
      return {
        canAction: false,
        approvalLevel: null,
        title: "Đơn đã được xử lý",
      };
    }

    if (isSuperApprover) {
      return {
        canAction: true,
        approvalLevel: getSuperApprovalLevel(ot),
        title: "Duyệt nhanh với quyền Admin/HR",
      };
    }

    const accountID = currentEmployeeId();
    const approvalChain = Array.isArray(ot?.approvalChain) ? ot.approvalChain : [];
    const userApproval = approvalChain.find((step) => getEntityId(step?.approver) === accountID);
    const userApprovalLevel = userApproval?.level || null;

    if (!userApprovalLevel || !userApproval) {
      return {
        canAction: false,
        approvalLevel: null,
        title: "Bạn không nằm trong cấp duyệt của đơn này",
      };
    }

    if (normalizeStatus(userApproval.status) !== "PENDING") {
      return {
        canAction: false,
        approvalLevel: userApprovalLevel,
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
          title: "Chưa đến lượt duyệt",
        };
      }
    }

    return {
      canAction: true,
      approvalLevel: userApprovalLevel,
      title: "Duyệt",
    };
  };

  const fetchOTs = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const serverFilters = {
        ...(filters.statusGroup && { status: filters.statusGroup }),
        ...(filters.otType && { otType: filters.otType }),
        ...(filters.searchName.trim() && { search: filters.searchName.trim() }),
      };
      const res =
        mode === "approvals"
          ? await OTApi.getALL(page, limit, serverFilters)
          : await OTApi.getMy({ page, limit, ...serverFilters });

      const responseData = res?.data;
      const rows = responseData?.data || [];
      const safeRows = Array.isArray(rows) ? rows : [];
      const total = responseData?.total ?? safeRows.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));

      setOts(safeRows);
      setPagination((prev) => ({ ...prev, total, totalPages }));
    } catch (error) {
      console.error("fetchOTs error:", error);
      setOts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOTs(pagination.page, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.page !== 1) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      } else {
        fetchOTs(1, pagination.limit);
      }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchName, filters.statusGroup, filters.otType]);

  const filteredOTs = useMemo(() => {
    const filtered = ots.filter((ot) => {
      const name = (ot?.employeeId?.fullName || "").toLowerCase();
      const status = normalizeStatus(ot?.status);

      const matchName = !searchQuery || name.includes(searchQuery);
      const matchStatus = !filters.statusGroup || status === filters.statusGroup;
      const matchType = !filters.otType || ot?.otType === filters.otType;

      return matchName && matchStatus && matchType;
    });

    return filtered.sort((a, b) => {
      const statusA = normalizeStatus(a?.status);
      const statusB = normalizeStatus(b?.status);

      if (statusA === "PENDING" && statusB !== "PENDING") return -1;
      if (statusA !== "PENDING" && statusB === "PENDING") return 1;

      const dateA = new Date(a?.createdAt || 0);
      const dateB = new Date(b?.createdAt || 0);
      return dateB - dateA;
    });
  }, [filters.otType, filters.statusGroup, ots, searchQuery]);

  const pendingCount = useMemo(
    () => ots.filter((ot) => normalizeStatus(ot?.status) === "PENDING").length,
    [ots]
  );

  const refresh = async () => {
    await fetchOTs(pagination.page, pagination.limit);
  };

  const handleApproveOT = async (otId, payload) => {
    const ot = approveOTModal.otData || ots.find((item) => item?._id === otId);
    const approvalContext = getOTApprovalContext(ot);
    if (!approvalContext.canAction || !approvalContext.approvalLevel) {
      toast.error(approvalContext.title || "Bạn không có quyền duyệt đơn OT này");
      return;
    }

    try {
      await OTApi.approve(otId, {
        ...payload,
        approvalLevel: approvalContext.approvalLevel,
      });
      toast.success("Duyệt đơn OT thành công");
      setApproveOTModal({ isOpen: false, otData: null });
      await refresh();
    } catch (error) {
      setApproveOTModal({ isOpen: false, otData: null });
      toast.error(error.normalizedMessage || error.response?.data?.message || "Duyệt đơn OT thất bại");
    }
  };

  const handleRejectOT = async (ot) => {
    const approvalContext = getOTApprovalContext(ot);
    if (!approvalContext.canAction || !approvalContext.approvalLevel) {
      toast.error(approvalContext.title || "Bạn không có quyền từ chối đơn OT này");
      return;
    }

    const rejectionReason = window.prompt("Nhập lý do từ chối đơn OT:");
    if (!rejectionReason?.trim()) return;

    try {
      await OTApi.approve(ot._id, {
        approvalLevel: approvalContext.approvalLevel,
        status: "REJECTED",
        approvedStartTime: ot.startTime,
        approvedEndTime: ot.endTime,
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Đã từ chối đơn OT");
      await refresh();
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Từ chối đơn OT thất bại");
    }
  };

  const handleDeleteOT = async (otId) => {
    if (!window.confirm("Xóa vĩnh viễn đơn OT đang chờ duyệt này?")) return;
    try {
      await OTApi.delete(otId);
      toast.success("Đã xóa đơn OT");
      await refresh();
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Xóa đơn OT thất bại");
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
      setPagination((prev) => ({ ...prev, page: 1 }));
      if (pagination.page === 1) {
        await fetchOTs(1, pagination.limit);
      }
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Lưu đơn OT thất bại");
    }
  };

  const getRowState = (ot) => {
    const status = normalizeStatus(ot?.status);
    const ownOT = isOwnRequest(ot);
    const approvalContext = getOTApprovalContext(ot);

    if (mode === "approvals") {
      return {
        status,
        ownOT,
        approvalContext,
        canApproveOT: !ownOT && approvalContext.canAction,
        canRejectOT: !ownOT && approvalContext.canAction,
        canEditOT: false,
        canDeleteOT: false,
      };
    }

    return {
      status,
      ownOT,
      approvalContext,
      canApproveOT: false,
      canRejectOT: false,
      canEditOT: ownOT && status === "PENDING",
      canDeleteOT: ownOT && status === "PENDING",
    };
  };

  return {
    loading,
    filters,
    setFilters,
    ots: filteredOTs,
    pendingCount,
    pagination,
    setPagination,
    totalPages: pagination.totalPages || 1,
    refresh,
    getRowState,
    otDetailModal,
    openOTDetailModal: (otData) => setOtDetailModal({ isOpen: true, otData }),
    closeOTDetailModal: () => setOtDetailModal({ isOpen: false, otData: null }),
    approveOTModal,
    openApproveOTModal: (otData) => setApproveOTModal({ isOpen: true, otData }),
    closeApproveOTModal: () => setApproveOTModal({ isOpen: false, otData: null }),
    handleApproveOT,
    handleRejectOT,
    otFormModal,
    openCreateOTModal: () => setOtFormModal({ isOpen: true, mode: "create", ot: null }),
    openEditOTModal: (ot) => setOtFormModal({ isOpen: true, mode: "edit", ot }),
    closeOTFormModal: () => setOtFormModal({ isOpen: false, mode: "create", ot: null }),
    handleSubmitOTForm,
    handleDeleteOT,
    canApprove,
    isSuperApprover,
    mode,
  };
};
