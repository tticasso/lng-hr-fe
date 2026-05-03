import { memo } from "react";
import MonthNavigator from "../../../components/common/MonthNavigator";

const TimesheetHeader = memo(({
  selectedMonth,
  selectedYear,
  onPreviousMonth,
  onNextMonth,
}) => {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {"B\u1ea3ng c\u00f4ng th\u00e1ng"} {selectedMonth + 1}/{selectedYear}
        </h1>
      </div>

      <MonthNavigator
        month={selectedMonth + 1}
        year={selectedYear}
        onPrevious={onPreviousMonth}
        onNext={onNextMonth}
      />
    </div>
  );
});

TimesheetHeader.displayName = "TimesheetHeader";

export default TimesheetHeader;
