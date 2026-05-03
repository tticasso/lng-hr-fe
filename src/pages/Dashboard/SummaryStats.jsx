import React, { memo } from "react";
import Card from "../../components/common/Card";
import { TrendingUp, Briefcase, Clock, Coffee } from "lucide-react";

const iconMap = {
  briefcase: Briefcase,
  clock: Clock,
  coffee: Coffee,
};

const SummaryStats = memo(({ stats }) => {
  return (
    <Card className="col-span-12 flex min-h-[220px] flex-col justify-between md:col-span-6 lg:col-span-3">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-700 sm:text-lg">Tháng này của bạn</h3>
        <TrendingUp size={16} className="text-gray-400" />
      </div>
      <div className="space-y-4">
        {stats.map((item, index) => {
          const IconComponent = iconMap[item.iconType];
          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`rounded-lg p-2 ${item.bg}`}>
                  {IconComponent && <IconComponent size={18} className={item.iconColor} />}
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-800">{item.value}</span>
                <span className="ml-1 text-xs text-gray-400">{item.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});

SummaryStats.displayName = "SummaryStats";

export default SummaryStats;
