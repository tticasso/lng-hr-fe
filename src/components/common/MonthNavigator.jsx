import { ChevronLeft, ChevronRight } from "lucide-react";

const formatMonthYearLabel = (month, year) => `Tháng ${month}, ${year}`;

const MonthNavigator = ({
  month,
  year,
  onPrevious,
  onNext,
  className = "",
}) => {
  return (
    <div
      className={`flex h-14 min-w-0 items-center justify-between rounded-2xl border border-gray-200 bg-white px-3 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={onPrevious}
        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Tháng trước"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="min-w-0 truncate whitespace-nowrap px-2 text-center text-base font-semibold text-gray-800 sm:text-lg">
        {formatMonthYearLabel(month, year)}
      </span>

      <button
        type="button"
        onClick={onNext}
        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Tháng sau"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default MonthNavigator;
