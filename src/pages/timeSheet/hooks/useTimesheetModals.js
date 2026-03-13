import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { leaveAPI } from "../../../apis/leaveAPI";
import { OTApi } from "../../../apis/OTAPI";

/**
 * Custom hook để quản lý modals trong Timesheet
 */
export const useTimesheetModals = () => {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isOTModalOpen, setIsOTModalOpen] = useState(false);
  const [defaultFromDate, setDefaultFromDate] = useState("");
  const [otPrefillDate, setOtPrefillDate] = useState("");

  // Leave Modal handlers
  const openLeaveModal = useCallback((isoDate) => {
    setDefaultFromDate(isoDate);
    setIsLeaveModalOpen(true);
  }, []);

  const closeLeaveModal = useCallback(() => {
    setIsLeaveModalOpen(false);
    setDefaultFromDate("");
  }, []);

  const submitLeaveRequest = useCallback(async (data) => {
    try {
      await leaveAPI.post(data);
      setIsLeaveModalOpen(false);
      toast.success("Xin nghỉ thành công, Vui lòng chờ quản trị duyệt");
    } catch (error) {
      setIsLeaveModalOpen(false);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        "Có lỗi xảy ra";
      toast.error(`Xin nghỉ thất bại: ${errorMessage}`, { autoClose: 5000 });
    }
  }, []);

  // OT Modal handlers
  const openOTModal = useCallback((isoDate) => {
    setOtPrefillDate(isoDate);
    setIsOTModalOpen(true);
  }, []);

  const closeOTModal = useCallback(() => {
    setIsOTModalOpen(false);
    setOtPrefillDate("");
  }, []);

  const submitOTRequest = useCallback(async (payload) => {
    try {
      await OTApi.post(payload);
      setIsOTModalOpen(false);
      toast.success("Đăng ký OT thành công, vui lòng chờ quản trị duyệt");
    } catch (error) {
      setIsOTModalOpen(false);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Có lỗi xảy ra";
      toast.error(`Đăng ký OT thất bại: ${errorMessage}`, { autoClose: 5000 });
    }
  }, []);

  return {
    // Leave Modal
    isLeaveModalOpen,
    defaultFromDate,
    openLeaveModal,
    closeLeaveModal,
    submitLeaveRequest,

    // OT Modal
    isOTModalOpen,
    otPrefillDate,
    openOTModal,
    closeOTModal,
    submitOTRequest,
  };
};
