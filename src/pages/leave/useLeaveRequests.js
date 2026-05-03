import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { leaveAPI } from "../../apis/leaveAPI";
import {
  getEntityId,
  getRoleFlags,
  getStoredRole,
  normalizeStatus,
} from "./shared";

const currentEmployeeId = () => localStorage.getItem("employee_ID") || "";

export const useLeaveRequests = ({ mode }) => {
  const role = useMemo(() => getStoredRole(), []);
  const { canApprove, isSuperApprover } = useMemo(() => getRoleFlags(role), [role]);

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
  const [leaveDetailModal, setLeaveDetailModal] = useState({
    isOpen: false,
    leaveId: null,
  });
  const [leaveFormModal, setLeaveFormModal] = useState({
    isOpen: false,
    mode: "create",
    leave: null,
  });
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const hasFetched = useRef(false);
  const actionMenuRef = useRef(null);

  const searchQuery = useMemo(() => filters.search.trim().toLowerCase(), [filters.search]);

  const isOwnRequest = (request) => getEntityId(request?.employeeId) === currentEmployeeId();

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
        title: "Đơn đã được xử lý",
      };
    }

    if (isSuperApprover) {
      return {
        canAction: true,
        approvalLevel: getSuperApprovalLevel(leave),
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

  const fetchLeaves = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res =
        mode === "approvals"
          ? await leaveAPI.getbyADMIN(page, limit)
          : await leaveAPI.getbyUSER(page, limit);

      const responseData = res?.data;
      const rows = responseData?.data || [];
      const paginationData = responseData?.pagination || {};
      const total = paginationData.totalRecords ?? paginationData.total ?? rows.length;
      const totalPages =
        paginationData.totalPages ?? Math.max(1, Math.ceil(total / (paginationData.limit ?? limit)));

      const normalizedRows = rows.map((item) => ({
        ...item,
        status: normalizeStatus(item?.status),
      }));

      setLeaves(normalizedRows);
      setPagination((prev) => ({ ...prev, total, totalPages }));
    } catch (error) {
      console.error("fetchLeaves error:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    const timer = setTimeout(() => {
      fetchLeaves(pagination.page, pagination.limit);
      hasFetched.current = true;
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasFetched.current) return;
    const timer = setTimeout(() => {
      fetchLeaves(pagination.page, pagination.limit);
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!actionMenuRef.current?.contains(event.target)) {
        setOpenActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLeaves = useMemo(() => {
    const filtered = leaves.filter((leave) => {
      const name = (leave.employeeId?.fullName || "").toLowerCase();
      const reason = (leave.reason || "").toLowerCase();

      const matchSearch = !searchQuery || name.includes(searchQuery) || reason.includes(searchQuery);
      const matchType = !filters.leaveType || leave?.leaveType === filters.leaveType;
      const matchStatus = !filters.status || normalizeStatus(leave?.status) === filters.status;

      return matchSearch && matchType && matchStatus;
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
  }, [filters.leaveType, filters.status, leaves, searchQuery]);

  const pendingCount = useMemo(
    () => leaves.filter((leave) => normalizeStatus(leave?.status) === "PENDING").length,
    [leaves]
  );

  const getRowState = (leave) => {
    const displayStatus = normalizeStatus(leave?.status);
    const approvalContext = getLeaveApprovalContext(leave);
    const ownLeave = isOwnRequest(leave);

    if (mode === "approvals") {
      return {
        displayStatus,
        approvalContext,
        canApprove: canApprove && approvalContext.canAction,
        canReject: canApprove,
        canEdit: false,
        canCancel: false,
        canDelete: false,
      };
    }

    return {
      displayStatus,
      approvalContext,
      canApprove: false,
      canReject: false,
      canEdit: ownLeave && displayStatus === "PENDING",
      canCancel: false,
      canDelete: ownLeave && displayStatus === "PENDING",
    };
  };

  const refresh = async () => {
    await fetchLeaves(pagination.page, pagination.limit);
  };

  const handleApprove = async (leave) => {
    const approvalContext = getLeaveApprovalContext(leave);
    if (!approvalContext.canAction || !approvalContext.approvalLevel) {
      toast.error(approvalContext.title || "Bạn không có quyền duyệt đơn này");
      return;
    }

    try {
      await leaveAPI.APPROVED(leave._id, {
        approvalLevel: approvalContext.approvalLevel,
        status: "APPROVED",
      });
      toast.success(`Đã duyệt đơn nghỉ (Level ${approvalContext.approvalLevel})`);
      await refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Duyệt đơn thất bại");
    }
  };

  const handleReject = async (leave) => {
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
      await refresh();
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Từ chối đơn nghỉ thất bại");
    }
  };

  const handleCancel = async (leaveId) => {
    try {
      if (!window.confirm("Hủy đơn nghỉ này?")) return;
      await leaveAPI.CANCELLED(leaveId);
      toast.success("Đã hủy đơn nghỉ");
      await refresh();
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Hủy đơn nghỉ thất bại");
    }
  };

  const handleDelete = async (leaveId) => {
    try {
      if (!window.confirm("Xóa vĩnh viễn đơn nghỉ đang chờ duyệt này?")) return;
      await leaveAPI.delete(leaveId);
      toast.success("Đã xóa đơn nghỉ");
      await refresh();
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Xóa đơn nghỉ thất bại");
    }
  };

  const handleSubmitForm = async (payload) => {
    try {
      if (leaveFormModal.mode === "edit" && leaveFormModal.leave?._id) {
        await leaveAPI.updatePending(leaveFormModal.leave._id, payload);
        toast.success("Đã cập nhật đơn nghỉ");
      } else {
        await leaveAPI.post(payload);
        toast.success("Đã tạo đơn nghỉ");
      }

      setLeaveFormModal({ isOpen: false, mode: "create", leave: null });
      setPagination((prev) => ({ ...prev, page: 1 }));
      if (pagination.page === 1) {
        await fetchLeaves(1, pagination.limit);
      }
    } catch (error) {
      toast.error(error.normalizedMessage || error.response?.data?.message || "Lưu đơn nghỉ thất bại");
    }
  };

  return {
    loading,
    filters,
    setFilters,
    leaves: filteredLeaves,
    pendingCount,
    pagination,
    setPagination,
    totalPages: pagination.totalPages || 1,
    leaveDetailModal,
    openLeaveDetailModal: (leaveId) => setLeaveDetailModal({ isOpen: true, leaveId }),
    closeLeaveDetailModal: () => setLeaveDetailModal({ isOpen: false, leaveId: null }),
    leaveFormModal,
    openCreateLeaveModal: () => setLeaveFormModal({ isOpen: true, mode: "create", leave: null }),
    openEditLeaveModal: (leave) => setLeaveFormModal({ isOpen: true, mode: "edit", leave }),
    closeLeaveFormModal: () => setLeaveFormModal({ isOpen: false, mode: "create", leave: null }),
    handleSubmitForm,
    refresh,
    getRowState,
    handleApprove,
    handleReject,
    handleCancel,
    handleDelete,
    actionMenuRef,
    openActionMenu,
    toggleActionMenu: (key) => setOpenActionMenu((prev) => (prev === key ? null : key)),
    closeActionMenu: () => setOpenActionMenu(null),
    canApprove,
    mode,
  };
};
