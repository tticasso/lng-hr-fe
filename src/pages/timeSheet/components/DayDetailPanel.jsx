import { memo } from "react";
import { Info, Clock, Zap, Coffee } from "lucide-react";
import Card from "../../../components/common/Card";
import StatusBadge from "../../../components/common/StatusBadge";
import Button from "../../../components/common/Button";
import { statusMap } from "../utils/constants";

const DayDetailPanel = memo(({ 
  selectedDate, 
  todayInfo,
  selectedMonth,
  selectedYear,
  onLeaveRequest,
  onOTRequest 
}) => {
  if (!selectedDate) {
    return (
      <Card className="h-fit sticky top-6">
        <div className="text-center py-8 text-gray-400">
          <Info size={40} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">
            Chọn một ngày trên lịch để xem chi tiết chấm công.
          </p>
        </div>
      </Card>
    );
  }

  // Kiểm tra xem ngày được chọn có phải là ngày trong quá khứ không
  const isCurrentMonth = selectedYear === todayInfo.year && selectedMonth === todayInfo.month;
  const isPastDay = isCurrentMonth
    ? selectedDate?.day < todayInfo.day
    : (selectedYear < todayInfo.year || (selectedYear === todayInfo.year && selectedMonth < todayInfo.month));

  // Chỉ kiểm tra ngày lễ PUBLIC_HOLIDAY (bỏ chủ nhật và ngày làm việc bù)
  const isHoliday = selectedDate?.type === "holiday";

  return (
    <div className="space-y-6">
      {/* Detail Panel */}
      <Card className="h-fit sticky top-6">
        <div className="animate-in fade-in duration-200">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <p className="text-xs text-gray-500 uppercase font-bold">
              Chi tiết ngày
            </p>
            <h2 className="text-2xl font-bold text-blue-600">
              {selectedDate.fullDate}
            </h2>
            <div className="flex gap-2 mt-2">
              {selectedDate.isToday && <StatusBadge status="Hôm nay" />}
              {selectedDate.type === "holiday" && (
                <StatusBadge status="Ngày lễ" />
              )}
              {selectedDate.type === "substitute_work" && (
                <StatusBadge status="Ngày làm việc bù" />
              )}
              {selectedDate.status?.includes("late") && (
                <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-1 rounded">
                  Đi muộn
                </span>
              )}
              {selectedDate.status?.includes("early") && (
                <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-1 rounded">
                  Về sớm
                </span>
              )}
              {selectedDate.status?.includes("ot") && (
                <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-1 rounded">
                  Có OT
                </span>
              )}
            </div>
          </div>

          {/* Content based on day type */}
          {selectedDate.type === "work" || selectedDate.type === "substitute_work" ? (
            <WorkDayContent selectedDate={selectedDate} />
          ) : selectedDate.type === "leave" ? (
            <LeaveDayContent selectedDate={selectedDate} statusMap={statusMap} />
          ) : (
            <OtherDayContent selectedDate={selectedDate} />
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {isPastDay ? (
          <Button
            onClick={() => onOTRequest(selectedDate.isoDate)}
            variant="OT"
            className="col-span-2 flex flex-col items-center gap-1 py-3 bg-orange-400 text-white shadow-md hover:bg-orange-600"
          >
            <Zap size={20} /> <span className="text-xs">Đăng ký OT</span>
          </Button>
        ) : isHoliday ? (
          <Button
            onClick={() => onOTRequest(selectedDate.isoDate)}
            variant="OT"
            className="col-span-2 flex flex-col items-center gap-1 py-3 bg-orange-400 text-white shadow-md hover:bg-orange-600"
          >
            <Zap size={20} /> <span className="text-xs">Đăng ký OT</span>
          </Button>
        ) : (
          <>
            <Button
              onClick={() => onLeaveRequest(selectedDate.isoDate)}
              className="flex flex-col items-center gap-1 py-3 bg-blue-600 text-white shadow-md hover:bg-blue-700"
            >
              <Coffee size={20} /> <span className="text-xs">Xin nghỉ</span>
            </Button>
            <Button
              onClick={() => onOTRequest(selectedDate.isoDate)}
              variant="OT"
              className="flex flex-col items-center gap-1 py-3 bg-orange-400 text-white shadow-md hover:bg-orange-600"
            >
              <Zap size={20} /> <span className="text-xs">Đăng ký OT</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

// Work Day Content Component
const WorkDayContent = memo(({ selectedDate }) => (
  <div className="space-y-4">
    {selectedDate.checkIn && (
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-green-100 text-green-600 rounded">
            <Clock size={16} />
          </div>
          <span className="text-sm font-medium text-gray-600">Check In</span>
        </div>
        <span
          className={`font-mono text-lg font-bold ${
            selectedDate.status.includes("late") ? "text-red-600" : "text-gray-800"
          }`}
        >
          {selectedDate.checkIn}
          {selectedDate.lateMinutes > 0 && (
            <span className="text-xs text-red-500 ml-2">
              (+{selectedDate.lateMinutes}p)
            </span>
          )}
        </span>
      </div>
    )}

    {selectedDate.checkOut && (
      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 text-blue-600 rounded">
            <Clock size={16} />
          </div>
          <span className="text-sm font-medium text-gray-600">Check Out</span>
        </div>
        <span
          className={`font-mono text-lg font-bold ${
            selectedDate.status.includes("early") ? "text-blue-600" : "text-gray-800"
          }`}
        >
          {selectedDate.checkOut}
          {selectedDate.earlyMinutes > 0 && (
            <span className="text-xs text-blue-500 ml-2">
              (-{selectedDate.earlyMinutes}p)
            </span>
          )}
        </span>
      </div>
    )}

    {!selectedDate.checkIn && !selectedDate.checkOut && (
      <div className="text-center py-4 text-gray-400 text-sm">
        Chưa có dữ liệu chấm công
      </div>
    )}

    {selectedDate.status.includes("ot") && selectedDate.otTimeRanges && selectedDate.otTimeRanges.length > 0 && (
      <OTInfo selectedDate={selectedDate} />
    )}
  </div>
));

// Leave Day Content Component
const LeaveDayContent = memo(({ selectedDate, statusMap }) => (
  <div className="space-y-4">
    <div
      className={`p-3 border rounded-lg ${
        selectedDate.apiData?.status === "PAID_LEAVE"
          ? "bg-purple-50 border-purple-100"
          : "bg-orange-50 border-orange-100"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-sm font-bold flex items-center gap-1 ${
            selectedDate.apiData?.status === "PAID_LEAVE"
              ? "text-purple-700"
              : "text-orange-700"
          }`}
        >
          <Coffee size={14} />
          {selectedDate.apiData?.status === "PAID_LEAVE"
            ? "Nghỉ có lương"
            : "Nghỉ không lương"}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded font-bold ${
            selectedDate.leaveInfo?.status === "APPROVED"
              ? "bg-green-100 text-green-600"
              : selectedDate.leaveInfo?.status === "PENDING"
              ? "bg-yellow-100 text-yellow-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {statusMap[selectedDate.leaveInfo?.status] || "Không xác định"}
        </span>
      </div>

      {selectedDate.leaveInfo?.reason && (
        <div className="text-xs text-gray-600 mb-2">
          <span className="font-medium">Lý do: </span>
          <span className="italic">{selectedDate.leaveInfo.reason}</span>
        </div>
      )}
    </div>

    {(selectedDate.checkIn || selectedDate.checkOut) && (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Thông tin chấm công:</h4>
        {selectedDate.checkIn && (
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-xs text-gray-600">Check In:</span>
            <span
              className={`font-mono text-sm font-bold ${
                selectedDate.status.includes("late") ? "text-red-600" : "text-gray-800"
              }`}
            >
              {selectedDate.checkIn}
              {selectedDate.lateMinutes > 0 && (
                <span className="text-xs text-red-500 ml-2">
                  (+{selectedDate.lateMinutes}p)
                </span>
              )}
            </span>
          </div>
        )}
        {selectedDate.checkOut && (
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="text-xs text-gray-600">Check Out:</span>
            <span
              className={`font-mono text-sm font-bold ${
                selectedDate.status.includes("early") ? "text-blue-600" : "text-gray-800"
              }`}
            >
              {selectedDate.checkOut}
              {selectedDate.earlyMinutes > 0 && (
                <span className="text-xs text-blue-500 ml-2">
                  (-{selectedDate.earlyMinutes}p)
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    )}

    {selectedDate.status.includes("ot") && selectedDate.otTimeRanges && selectedDate.otTimeRanges.length > 0 && (
      <OTInfo selectedDate={selectedDate} />
    )}
  </div>
));

// Other Day Content Component
const OtherDayContent = memo(({ selectedDate }) => (
  <div className="py-4 text-center text-gray-500 italic bg-gray-50 rounded-lg">
    {selectedDate.type === "weekend"
      ? "Cuối tuần - Không có lịch làm việc"
      : selectedDate.type === "holiday"
      ? `Nghỉ lễ: ${selectedDate.holidayName}`
      : selectedDate.type === "substitute_work"
      ? `Ngày làm việc bù: ${selectedDate.holidayName}`
      : "Không có thông tin"}
  </div>
));

// OT Info Component
const OTInfo = memo(({ selectedDate }) => (
  <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-bold text-orange-700 flex items-center gap-1">
        <Zap size={14} /> Overtime
      </span>
      <span className="text-sm font-bold text-orange-700">
        {selectedDate.otHours} giờ
      </span>
    </div>
    <div className="space-y-1">
      {selectedDate.otTimeRanges.map((ot, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between text-xs bg-white px-2 py-1.5 rounded"
        >
          <div className="flex flex-col">
            <span className="text-gray-600">{ot.otType}</span>
            {ot.status && (
              <span
                className={`text-[10px] font-bold ${
                  ot.status === "APPROVED"
                    ? "text-green-600"
                    : ot.status === "PENDING"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {ot.status}
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="font-mono font-bold text-orange-600">
              {ot.startTime} - {ot.endTime}
            </div>
            {ot.approvedHours && (
              <div className="text-[10px] text-gray-500">
                {ot.approvedHours}h duyệt
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
    {selectedDate.apiData?.note && (
      <p className="text-xs text-orange-600/80 mt-2">
        {selectedDate.apiData.note}
      </p>
    )}
  </div>
));

// Set display names
WorkDayContent.displayName = "WorkDayContent";
LeaveDayContent.displayName = "LeaveDayContent";
OtherDayContent.displayName = "OtherDayContent";
OTInfo.displayName = "OTInfo";
DayDetailPanel.displayName = "DayDetailPanel";

export default DayDetailPanel;