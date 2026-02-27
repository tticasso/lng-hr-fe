import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [openNotify, setOpenNotify] = useState(false);

  const toggleNotificationPanel = () => {
    setOpenNotify((prev) => !prev);
  };

  const openNotificationPanel = () => {
    setOpenNotify(true);
  };

  const closeNotificationPanel = () => {
    setOpenNotify(false);
  };

  return (
    <NotificationContext.Provider
      value={{
        openNotify,
        setOpenNotify,
        toggleNotificationPanel,
        openNotificationPanel,
        closeNotificationPanel,
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
