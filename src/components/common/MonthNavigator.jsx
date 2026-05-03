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
      className={`flex h-14 items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={onPrevious}
        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="Tháng trước"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="whitespace-nowrap px-4 text-center text-xl font-semibold text-gray-800">
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
