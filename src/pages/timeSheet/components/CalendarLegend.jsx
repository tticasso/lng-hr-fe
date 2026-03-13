import { memo } from "react";
import Card from "../../../components/common/Card";
import { legendItems } from "../utils/constants";

const CalendarLegend = memo(() => {
  return (
    <Card className="h-fit">
      <div className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Chú thích</h3>

        {/* Màu nền các loại ngày */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">Loại ngày:</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {legendItems.dayTypes.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-4 h-4 ${item.color} rounded`}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ký hiệu trạng thái */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Trạng thái:</p>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {legendItems.statusTypes.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
});

CalendarLegend.displayName = "CalendarLegend";

export default CalendarLegend;