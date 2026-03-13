import { memo } from "react";
import Card from "../../../components/common/Card";
import CalendarDay from "./CalendarDay";
import { dayLabels } from "../utils/constants";

const CalendarGrid = memo(({ 
  calendarDays, 
  loading, 
  selectedDate, 
  onDayClick,
  selectedMonth,
  selectedYear,
  todayInfo 
}) => {
  return (
    <Card className="lg:col-span-8 xl:col-span-9 p-0 overflow-hidden border border-gray-200 shadow-sm">
      {/* Calendar Header Days */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {dayLabels.map((dayLabel, i) => (
          <div
            key={dayLabel}
            className={`py-3 text-center text-xs font-bold uppercase tracking-wide ${
              i === 0 || i === 6 ? "text-red-400" : "text-gray-500"
            }`}
          >
            {dayLabel}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      {loading ? (
        <div className="flex items-center justify-center h-96 bg-white">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-500">Đang tải dữ liệu chấm công...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 bg-white">
          {calendarDays.map((day, idx) => (
            <CalendarDay
              key={idx}
              day={day}
              selectedDate={selectedDate}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              todayInfo={todayInfo}
              onClick={() => day.inMonth && onDayClick(day)}
            />
          ))}
        </div>
      )}
    </Card>
  );
});

CalendarGrid.displayName = "CalendarGrid";

export default CalendarGrid;