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
    <Card className="col-span-12 md:col-span-6 lg:col-span-3 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Tháng này của bạn</h3>
        <TrendingUp size={16} className="text-gray-400" />
      </div>
      <div className="space-y-4">
        {stats.map((item, index) => {
          const IconComponent = iconMap[item.iconType];
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${item.bg}`}>
                  {IconComponent && (
                    <IconComponent size={18} className={item.iconColor} />
                  )}
                </div>
                <span className="text-sm text-gray-600">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-gray-800">{item.value}</span>
                <span className="text-xs text-gray-400 ml-1">{item.unit}</span>
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
