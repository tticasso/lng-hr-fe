import { useState, useCallback } from "react";

/**
 * Custom hook để quản lý navigation tháng
 */
export const useMonthNavigation = () => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    console.log("=== MONTH NAVIGATION INIT ===");
    console.log("Current date:", now);
    console.log("Current month (0-based):", now.getMonth());
    console.log("Current year:", now.getFullYear());
    return now.getMonth(); // 0-11
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const [todayInfo] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    };
  });

  const handlePreviousMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 0) {
        setSelectedYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setSelectedMonth((prev) => {
      if (prev === 11) {
        setSelectedYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  return {
    selectedMonth,
    selectedYear,
    todayInfo,
    handlePreviousMonth,
    handleNextMonth,
  };
};
