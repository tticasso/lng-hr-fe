import React, { useState, useRef, useEffect } from "react";
import { Clock, Plus, Minus, Check } from "lucide-react";

const TimePicker24h = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [tempHour, setTempHour] = useState(0);
  const [tempMinute, setTempMinute] = useState(0);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
    if (value) {
      const [h, m] = value.split(":").map((v) => parseInt(v) || 0);
      setTempHour(h);
      setTempMinute(m);
    }
  }, [value]);

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

  const handleConfirm = () => {
    const timeString = `${String(tempHour).padStart(2, "0")}:${String(tempMinute).padStart(2, "0")}`;
    setInputValue(timeString);
    if (onChange) {
      onChange({ target: { value: timeString } });
    }
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^[0-9:]*$/.test(val) && val.length <= 5) {
      setInputValue(val);
      if (onChange) {
        onChange(e);
      }
    }
  };

  const handleInputBlur = () => {
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

  const incrementHour = () => setTempHour((prev) => (prev + 1) % 24);
  const decrementHour = () => setTempHour((prev) => (prev - 1 + 24) % 24);
  const incrementMinute = () => setTempMinute((prev) => (prev + 1) % 60);
  const decrementMinute = () => setTempMinute((prev) => (prev - 1 + 60) % 60);

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
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Clock size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl w-48 p-3">
          <div className="flex items-center justify-center gap-3">
            {/* Hour Control */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementHour}
                className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded transition-colors"
              >
                <Plus size={14} className="text-blue-600" />
              </button>
              <div className="my-1 w-12 h-14 flex items-center justify-center bg-blue-50 rounded-lg border-2 border-blue-500">
                <span className="text-2xl font-bold text-blue-600 font-mono">
                  {String(tempHour).padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={decrementHour}
                className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded transition-colors"
              >
                <Minus size={14} className="text-blue-600" />
              </button>
              <span className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">Giờ</span>
            </div>

            {/* Separator */}
            <div className="text-2xl font-bold text-gray-300 mb-5">:</div>

            {/* Minute Control */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={incrementMinute}
                className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded transition-colors"
              >
                <Plus size={14} className="text-blue-600" />
              </button>
              <div className="my-1 w-12 h-14 flex items-center justify-center bg-blue-50 rounded-lg border-2 border-blue-500">
                <span className="text-2xl font-bold text-blue-600 font-mono">
                  {String(tempMinute).padStart(2, "0")}
                </span>
              </div>
              <button
                type="button"
                onClick={decrementMinute}
                className="w-8 h-8 flex items-center justify-center hover:bg-blue-50 rounded transition-colors"
              >
                <Minus size={14} className="text-blue-600" />
              </button>
              <span className="text-[10px] text-gray-400 mt-0.5 uppercase font-medium">Phút</span>
            </div>
          </div>

          {/* OK Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 text-sm font-medium"
          >
            <Check size={16} />
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default TimePicker24h;
