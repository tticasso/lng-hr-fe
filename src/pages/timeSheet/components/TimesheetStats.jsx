import { memo } from "react";
import { Clock, Briefcase, Zap, Coffee, AlertCircle } from "lucide-react";
import Card from "../../../components/common/Card";
import { statCardColors } from "../utils/constants";

const StatCard = memo(({ icon, label, value, sub, color, isWarning }) => {
  return (
    <Card
      className={`flex items-start gap-3 p-4 border ${
        isWarning
          ? "border-red-300 ring-1 ring-red-50"
          : statCardColors[color].split(" ")[2]
      }`}
    >
      <div className={`p-2.5 rounded-lg shrink-0 ${statCardColors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wide">
          {label}
        </p>
        <h4 className="text-xl font-bold text-gray-800 mt-0.5">{value}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </Card>
  );
});

StatCard.displayName = "StatCard";

const TimesheetStats = memo(({ timesheetData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Shift Info Card */}
      <Card className="font-bold text-gray-800 border-green-100 flex flex-col justify-between">
        <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-wide">
          <Clock size={16} color="green" /> Ca làm việc chuẩn
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between items-center text-sm">
            <span className="opacity-80">Sáng:</span>
            <span className="font-mono font-bold text-lg">
              {timesheetData?.shift?.morning || "08:00 - 11:30"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-white/10 pt-1">
            <span className="opacity-80">Chiều:</span>
            <span className="font-mono font-bold text-lg">
              {timesheetData?.shift?.afternoon || "13:00 - 17:30"}
            </span>
          </div>
        </div>
      </Card>

      {/* Work Hours */}
      <StatCard
        icon={<Briefcase size={20} />}
        label="Tổng giờ làm"
        value={`${timesheetData?.work?.totalHours || 0}h`}
        sub={`${timesheetData?.work?.totalDays}/ ${timesheetData?.work?.standardWorkDays} công`}
        color="blue"
      />

      {/* OT Hours */}
      <StatCard
        icon={<Zap size={20} />}
        label="Tổng giờ OT"
        value={`${timesheetData?.overtime?.totalHours || 0}h`}
        sub={timesheetData?.overtime?.status || "Chưa có"}
        color="orange"
      />

      {/* Leave Days */}
      <StatCard
        icon={<Coffee size={20} />}
        label="Phép năm"
        value={`${timesheetData?.leave?.remaining || 0}/${
          timesheetData?.leave?.totalLimit || 12
        }`}
        sub={`Còn lại: ${timesheetData?.leave?.remaining || 0}`}
        color="purple"
      />

      {/* Late Count */}
      <StatCard
        icon={<AlertCircle size={20} />}
        label="Đi muộn"
        value={`${timesheetData?.late?.count || 0}`}
        sub="Lần vi phạm"
        color="red"
        isWarning={timesheetData?.late?.count > 0}
      />
    </div>
  );
});

TimesheetStats.displayName = "TimesheetStats";

export default TimesheetStats;