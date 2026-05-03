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
  const { canApprove } = useMemo(() => getRoleFlags(role), [role]);

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

  const fetchOTs = async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const res =
        mode === "approvals"
          ? await OTApi.getALL(page, limit)
          : await OTApi.getMy({ page, limit });

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
    try {
      await OTApi.put(otId, payload);
      toast.success("Duyệt đơn OT thành công");
      setApproveOTModal({ isOpen: false, otData: null });
      await refresh();
    } catch (error) {
      setApproveOTModal({ isOpen: false, otData: null });
      toast.error(error.normalizedMessage || error.response?.data?.message || "Duyệt đơn OT thất bại");
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

    if (mode === "approvals") {
      return {
        status,
        ownOT,
        canApproveOT: canApprove && !ownOT && status === "PENDING",
        canRejectOT: canApprove && !ownOT,
        canEditOT: false,
        canDeleteOT: false,
      };
    }

    return {
      status,
      ownOT,
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
    mode,
  };
};
