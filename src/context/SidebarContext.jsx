import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMobileSidebarOpen((prev) => !prev);
      return;
    }

    setIsCollapsed((prev) => !prev);
  }, [isMobile]);

  const openMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const handleViewportChange = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsMobileSidebarOpen(false);
      }
    };

    handleViewportChange();
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => {
      mediaQuery.removeEventListener("change", handleViewportChange);
    };
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobile,
        isMobileSidebarOpen,
        toggleSidebar,
        openMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
