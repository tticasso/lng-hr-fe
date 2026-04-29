import React, { memo } from "react";
import Card from "../../components/common/Card";
import { Calendar, AlertCircle } from "lucide-react";

const UpcomingEvents = memo(() => {
  return (
   <Card className="col-span-12 md:col-span-6 lg:col-span-3 bg-blue-50/50 border-blue-100">
  <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
    <Calendar size={18} className="text-blue-500" />
    Sự kiện sắp tới
  </h3>

  <div className="space-y-3">
    {/* Sự kiện 1: 30/04 */}
    <div className="flex gap-3 items-start p-3 bg-white rounded-lg border border-blue-100 shadow-sm">
      <div className="flex flex-col items-center justify-center bg-blue-100 text-blue-600 rounded p-1 w-12 min-w-[3.5rem]">
        <span className="text-xs font-bold uppercase">Thg 4</span>
        <span className="text-lg font-bold">30</span>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">
          Ngày Giải phóng miền Nam
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Kỷ niệm ngày thống nhất đất nước 30/04.
        </p>
      </div>
    </div>

    {/* Sự kiện 2: 01/05 */}
    <div className="flex gap-3 items-start">
      <div className="w-12 text-center pt-1">
        <span className="text-sm font-medium text-gray-500">01/05</span>
      </div>
      <div className="pt-1 border-l-2 border-gray-200 pl-3">
        <p className="text-sm font-medium text-gray-700">
          Quốc tế Lao động
        </p>
        <p className="text-xs text-gray-600">
          Chúc mọi người có kỳ nghỉ lễ vui vẻ, nhiều năng lượng và thật ý nghĩa. ✨
        </p>
      </div>
    </div>
  </div>
</Card>
  );
});

UpcomingEvents.displayName = "UpcomingEvents";

export default UpcomingEvents;
