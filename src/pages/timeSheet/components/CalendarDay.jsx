import { memo } from "react";
import { getDayStyle, isPastDay } from "../utils/calendarHelpers";

const CalendarDay = memo(({ 
  day, 
  selectedDate, 
  selectedMonth, 
  selectedYear, 
  todayInfo, 
  onClick 
}) => {
  const dayStyle = getDayStyle(day, selectedDate, selectedMonth, selectedYear, todayInfo);

  return (
    <div onClick={onClick} className={dayStyle}>
      {/* Date Number & Badges */}
      <div className="flex justify-between items-start">
        <span
          className={`text-lg font-semibold w-7 h-7 flex items-center justify-center rounded-full
            ${
              day.isToday
                ? "bg-blue-600 text-white"
                : day.type === "holiday"
                ? "text-red-600"
                : day.type === "substitute_work"
                ? "text-yellow-600"
                : day.type === "weekend"
                ? "text-red-400"
                : "text-gray-700"
            }
          `}
        >
          {day.inMonth ? day.day : ""}
        </span>

        {/* Status Badges */}
        <div className="flex gap-1">
          {day.status?.includes("late") && (
            <span
              className="w-2 h-2 rounded-full bg-red-500"
              title="Đi muộn"
            ></span>
          )}
          {day.status?.includes("early") && (
            <span
              className="w-2 h-2 rounded-full bg-blue-500"
              title="Về sớm"
            ></span>
          )}
          {day.status?.includes("ot") && (
            <span
              className="w-2 h-2 rounded-full bg-orange-500"
              title="OT"
            ></span>
          )}
          {day.type === "leave" && (
            <span
              className="w-2 h-2 rounded-full bg-purple-500"
              title="Nghỉ phép"
            ></span>
          )}
        </div>
      </div>

      {/* Day Content */}
      {day.inMonth && day.type !== "weekend" && (
        <div className="mt-1 flex flex-col gap-0.5">
          {/* Holiday */}
          {day.type === "holiday" && (
            <div className="flex flex-col items-center justify-center h-full mt-2">
              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded text-center leading-tight">
                🎄 {day.holidayName}
              </span>
            </div>
          )}

          {/* Substitute Work Day */}
          {day.type === "substitute_work" && (
            <div className="flex flex-col items-center justify-center h-full mt-2">
              <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded text-center leading-tight">
                🔄 {day.holidayName}
              </span>
              {renderCheckInOut(day)}
              {renderOTInfo(day)}
            </div>
          )}

          {/* Rotation Off */}
          {day.type === "rotation_off" && (
            <div className="mt-1">
              <div className="text-center mb-1">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded text-teal-700 bg-teal-100">
                  Nghỉ luân phiên
                </span>
              </div>
              {day.apiData?.note && (
                <div className="text-[9px] text-center text-teal-600 mt-1">
                  {day.apiData.note}
                </div>
              )}
            </div>
          )}

          {/* Leave */}
          {day.type === "leave" && (
            <div className="mt-1">
              <div className="text-center mb-1">
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    day.apiData?.status === "PAID_LEAVE"
                      ? "text-purple-700 bg-purple-100"
                      : "text-orange-700 bg-orange-100"
                  }`}
                >
                  {day.apiData?.status === "PAID_LEAVE"
                    ? "Nghỉ có lương"
                    : "Nghỉ không lương"}
                </span>
              </div>
              {renderCheckInOut(day)}
              {renderOTInfo(day)}
            </div>
          )}

          {/* Work Day */}
          {day.type === "work" && (() => {
            const isFutureDay = !isPastDay(day.day, selectedMonth, selectedYear, todayInfo) && 
                               !day.isToday;

            if (isFutureDay && !day.checkIn && !day.checkOut) {
              return null;
            }

            return (
              <>
                {renderCheckInOut(day)}
                {renderOTInfo(day)}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
});

// Helper functions
const renderCheckInOut = (day) => {
  if (day.checkIn || day.checkOut) {
    return (
      <div className="flex justify-center items-center text-[11px] text-gray-500 px-1.5 py-0.5 rounded">
        <span
          className={`font-mono font-bold ${
            day.status.includes("late") ? "text-red-600" : "text-gray-700"
          }`}
        >
          {day.checkIn || "--:--"}
        </span>
        <span className="px-2"> - </span>
        <span
          className={`font-mono font-bold ${
            day.status.includes("early") ? "text-blue-600" : "text-gray-700"
          }`}
        >
          {day.checkOut || "--:--"}
        </span>
      </div>
    );
  } else if (day.type === "work") {
    return (
      <div className="text-[10px] text-center text-gray-400 mt-2">
        Chưa chấm công
      </div>
    );
  }
  return null;
};

const renderOTInfo = (day) => {
  if (day.status.includes("ot") && day.otTimeRanges && day.otTimeRanges.length > 0) {
    return (
      <div className="text-[10px] text-center font-bold text-orange-600 bg-orange-50 px-1 rounded mt-0.5">
        OT: {day.otTimeRanges.map(ot => `${ot.startTime}-${ot.endTime}`).join(", ")}
      </div>
    );
  }
  return null;
};

CalendarDay.displayName = "CalendarDay";

export default CalendarDay;