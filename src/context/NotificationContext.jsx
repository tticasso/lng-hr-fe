import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { leaveAPI } from "../apis/leaveAPI";
import { OTApi } from "../apis/OTAPI";
import { ACCESS } from "../config/accessControl";
import { useAuth } from "./AuthContext";
import { hasAnyPermission } from "../utils/authPermissions";

const NotificationContext = createContext();

const getPendingCountFromResponse = (res) => {
  const payload = res?.data?.data ?? res?.data;
  if (typeof payload === "number") return payload;
  return payload?.pendingCount ?? payload?.count ?? payload?.total ?? 0;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [openNotify, setOpenNotify] = useState(false);
  const [approvalCounts, setApprovalCounts] = useState({
    leave: 0,
    ot: 0,
  });

  const canLoadLeaveApprovals = useMemo(
    () => hasAnyPermission(user, ACCESS.LEAVE_APPROVALS),
    [user],
  );
  const canLoadOTApprovals = useMemo(
    () => hasAnyPermission(user, ACCESS.OT_APPROVALS),
    [user],
  );

  const toggleNotificationPanel = () => {
    setOpenNotify((prev) => !prev);
  };

  const openNotificationPanel = () => {
    setOpenNotify(true);
  };

  const closeNotificationPanel = () => {
    setOpenNotify(false);
  };

  const loadApprovalCounts = useCallback(async ({ leave = true, ot = true } = {}) => {
    const requests = [];

    if (leave && canLoadLeaveApprovals) {
      requests.push(
        leaveAPI.pendingApprovalCount()
          .then((res) => ({ key: "leave", count: getPendingCountFromResponse(res) }))
          .catch(() => ({ key: "leave", count: 0 }))
      );
    } else if (leave) {
      requests.push(Promise.resolve({ key: "leave", count: 0 }));
    }

    if (ot && canLoadOTApprovals) {
      requests.push(
        OTApi.pendingApprovalCount()
          .then((res) => ({ key: "ot", count: getPendingCountFromResponse(res) }))
          .catch(() => ({ key: "ot", count: 0 }))
      );
    } else if (ot) {
      requests.push(Promise.resolve({ key: "ot", count: 0 }));
    }

    if (!requests.length) return;

    const results = await Promise.all(requests);
    setApprovalCounts((prev) => {
      const next = { ...prev };
      results.forEach(({ key, count }) => {
        next[key] = Number(count) || 0;
      });
      return next;
    });
  }, [canLoadLeaveApprovals, canLoadOTApprovals]);

  const refreshApprovalCounts = useCallback((type) => {
    if (type === "leave") return loadApprovalCounts({ leave: true, ot: false });
    if (type === "ot") return loadApprovalCounts({ leave: false, ot: true });
    return loadApprovalCounts();
  }, [loadApprovalCounts]);

  useEffect(() => {
    loadApprovalCounts();
  }, [loadApprovalCounts]);

  return (
    <NotificationContext.Provider
      value={{
        openNotify,
        setOpenNotify,
        toggleNotificationPanel,
        openNotificationPanel,
        closeNotificationPanel,
        approvalCounts,
        loadApprovalCounts,
        refreshApprovalCounts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};
