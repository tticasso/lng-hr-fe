import React, { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";

const TimePicker24h = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleTimeSelect = (hour, minute) => {
    const timeString = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    setInputValue(timeString);
    if (onChange) {
      onChange({ target: { value: timeString } });
    }
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Allow only numbers and colon
    if (/^[0-9:]*$/.test(val) && val.length <= 5) {
      setInputValue(val);
      if (onChange) {
        onChange(e);
      }
    }
  };

  const handleInputBlur = () => {
    // Auto-format on blur
    if (inputValue) {
      const parts = inputValue.split(":");
      if (parts.length === 2) {
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
          const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          setInputValue(formatted);
          if (onChange) {
            onChange({ target: { value: formatted } });
          }
        }
      }
    }
  };

  // Generate hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate minutes (0-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="HH:mm"
          maxLength="5"
          className={`w-full pr-10 ${className}`}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Clock size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg w-64">
          <div className="p-3">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Chọn giờ</p>
            <div className="grid grid-cols-2 gap-2">
              {/* Hours Column */}
              <div>
                <p className="text-xs text-gray-400 mb-1 text-center">Giờ</p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {hours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      className="w-full px-3 py-1.5 text-sm hover:bg-blue-50 text-center font-mono"
                      onClick={() => {
                        const currentMinute = inputValue.split(":")?.[1] || "00";
                        handleTimeSelect(hour, parseInt(currentMinute) || 0);
                      }}
                    >
                      {String(hour).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes Column */}
              <div>
                <p className="text-xs text-gray-400 mb-1 text-center">Phút</p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded">
                  {minutes.map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      className="w-full px-3 py-1.5 text-sm hover:bg-blue-50 text-center font-mono"
                      onClick={() => {
                        const currentHour = inputValue.split(":")?.[0] || "00";
                        handleTimeSelect(parseInt(currentHour) || 0, minute);
                      }}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker24h;
