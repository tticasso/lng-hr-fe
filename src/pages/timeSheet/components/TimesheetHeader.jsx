import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TimesheetHeader = memo(({ 
  selectedMonth, 
  selectedYear, 
  onPreviousMonth, 
  onNextMonth 
}) => {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Bảng công tháng {selectedMonth + 1}/{selectedYear}
        </h1>
      </div>

      {/* Month Filter */}
      <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
        <button
          onClick={onPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="px-4 font-semibold text-gray-700 min-w-[140px] text-center">
          Tháng {selectedMonth + 1}, {selectedYear}
        </span>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
});

TimesheetHeader.displayName = "TimesheetHeader";

export default TimesheetHeader;