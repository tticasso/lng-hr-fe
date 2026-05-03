import React, { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

const MonthYearPicker = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(() => {
    if (value) return parseInt(value.split("-")[0], 10);
    return new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (value) return parseInt(value.split("-")[1], 10);
    return new Date().getMonth() + 1;
  });

  const dropdownRef = useRef(null);

  const months = [
    { value: 1, label: "Tháng 1" },
    { value: 2, label: "Tháng 2" },
    { value: 3, label: "Tháng 3" },
    { value: 4, label: "Tháng 4" },
    { value: 5, label: "Tháng 5" },
    { value: 6, label: "Tháng 6" },
    { value: 7, label: "Tháng 7" },
    { value: 8, label: "Tháng 8" },
    { value: 9, label: "Tháng 9" },
    { value: 10, label: "Tháng 10" },
    { value: 11, label: "Tháng 11" },
    { value: 12, label: "Tháng 12" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    const formattedValue = `${selectedYear}-${String(month).padStart(2, "0")}`;
    onChange({ target: { value: formattedValue } });
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
    const formattedValue = `${year}-${String(selectedMonth).padStart(2, "0")}`;
    onChange({ target: { value: formattedValue } });
  };

  const displayValue = `Tháng ${selectedMonth}/${selectedYear}`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full min-w-[260px] items-center justify-between rounded-lg border border-gray-300 bg-white p-3 outline-none transition-all hover:border-blue-400 focus:ring-2 focus:ring-blue-500 group"
      >
        <div className="flex items-center gap-3">
          <Calendar
            size={20}
            className="text-gray-400 transition-colors group-hover:text-blue-500"
          />
          <span className="whitespace-nowrap font-semibold text-gray-700">
            {displayValue}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl duration-200">
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <div className="p-3">
              <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
                Chọn tháng
              </div>
              <div className="grid max-h-64 grid-cols-3 gap-1 overflow-y-auto">
                {months.map((month) => (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => handleMonthSelect(month.value)}
                    className={`rounded-md p-2 text-sm transition-all ${
                      selectedMonth === month.value
                        ? "bg-blue-600 font-semibold text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    T{month.value}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3">
              <div className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
                Chọn năm
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`w-full rounded-md p-2 text-left text-sm transition-all ${
                      selectedYear === year
                        ? "bg-blue-600 font-semibold text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
