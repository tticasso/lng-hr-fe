import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { leaveAPI } from "../../../apis/leaveAPI";
import { OTApi } from "../../../apis/OTAPI";

/**
 * Custom hook để quản lý tất cả modals trong Dashboard
 */
export const useDashboardModals = () => {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [isHRSupportModalOpen, setIsHRSupportModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  // Leave Modal handlers
  const openLeaveModal = useCallback(() => {
    setIsLeaveModalOpen(true);
  }, []);

  const closeLeaveModal = useCallback(() => {
    setIsLeaveModalOpen(false);
  }, []);

  const submitLeaveRequest = useCallback(async (data) => {
    try {
      await leaveAPI.post(data);
      setIsLeaveModalOpen(false);
      toast.success("Xin nghỉ thành công, Vui lòng chờ quản trị duyệt");
    } catch (error) {
      setIsLeaveModalOpen(false);

      const errors = error?.response?.data?.errors;
      const errorMessage = Array.isArray(errors) && errors.length
        ? errors.map((e) => e.message).join(", ")
        : error?.response?.data?.message || error?.message || "Có lỗi xảy ra";

      toast.error(`Xin nghỉ thất bại: ${errorMessage}`, { autoClose: 5000 });
    }
  }, []);

  // OT Modal handlers
  const openOTModal = useCallback(() => {
    setIsOTModalOpen(true);
  }, []);

  const closeOTModal = useCallback(() => {
    setIsOTModalOpen(false);
  }, []);

  const submitOTRequest = useCallback(async (payload) => {
    try {
      await OTApi.post(payload);
      setIsOTModalOpen(false);
      toast.success("Đăng ký OT thành công, vui lòng chờ quản trị duyệt");
    } catch (error) {
      setIsOTModalOpen(false);
      toast.error(
        `Đăng ký OT thất bại : ${error.response?.data?.message || error.message}`,
        { autoClose: 5000 }
      );
    }
  }, []);

  // HR Support Modal handlers
  const openHRSupportModal = useCallback(() => {
    setIsHRSupportModalOpen(true);
  }, []);

  const closeHRSupportModal = useCallback(() => {
    setIsHRSupportModalOpen(false);
  }, []);

  // Announcement Modal handlers
  const openAnnouncementModal = useCallback((announcementId) => {
    setSelectedAnnouncementId(announcementId);
    setIsAnnouncementModalOpen(true);
  }, []);

  const closeAnnouncementModal = useCallback(() => {
    setIsAnnouncementModalOpen(false);
    setSelectedAnnouncementId(null);
  }, []);

  return {
    // Leave Modal
    isLeaveModalOpen,
    openLeaveModal,
    closeLeaveModal,
    submitLeaveRequest,

    // OT Modal
    isOTModalOpen,
    openOTModal,
    closeOTModal,
    submitOTRequest,

    // HR Support Modal
    isHRSupportModalOpen,
    openHRSupportModal,
    closeHRSupportModal,

    // Announcement Modal
    isAnnouncementModalOpen,
    selectedAnnouncementId,
    openAnnouncementModal,
    closeAnnouncementModal,
  };
};
