import React, { memo } from "react";
import Card from "../../components/common/Card";
import { Calendar } from "lucide-react";

const UpcomingEvents = memo(() => {
  return (
    <Card className="col-span-12 border-blue-100 bg-blue-50/50 md:col-span-6 lg:col-span-3">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-700 sm:text-lg">
        <Calendar size={18} className="text-blue-500" />
        Sự kiện sắp tới
      </h3>

      <div className="space-y-3">
        <div className="flex gap-3 rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
          <div className="flex min-w-[3.25rem] flex-col items-center justify-center rounded bg-blue-100 p-1 text-blue-600">
            <span className="text-xs font-bold uppercase">Thg 4</span>
            <span className="text-lg font-bold">30</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">Ngày Giải phóng miền Nam</p>
            <p className="mt-1 text-xs text-gray-500">
              Kỷ niệm ngày thống nhất đất nước 30/04.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-12 pt-1 text-center">
            <span className="text-sm font-medium text-gray-500">01/05</span>
          </div>
          <div className="border-l-2 border-gray-200 pl-3 pt-1">
            <p className="text-sm font-medium text-gray-700">Quốc tế Lao động</p>
            <p className="text-xs text-gray-600">
              Chúc mọi người có kỳ nghỉ lễ vui vẻ, nhiều năng lượng và thật ý nghĩa.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
});

UpcomingEvents.displayName = "UpcomingEvents";

export default UpcomingEvents;
