import { Filter, Search } from "lucide-react";

import FilterBar from "../../../components/shared/FilterBar";
import { statusOptions } from "./payrollOverviewUtils";

const PayrollOverviewFilters = ({
  filters,
  departments,
  onFilterChange,
  selectedCount,
  totalCount,
}) => {
  const controls = (
    <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative min-w-0 xl:flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder="Tìm kiếm theo tên, mã nhân viên, phòng ban..."
          className="h-12 w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative min-w-0 xl:w-60 xl:flex-none">
        <Filter
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <select
          name="department"
          value={filters.department}
          onChange={onFilterChange}
          className="h-12 w-full cursor-pointer rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Phòng ban (Tất cả)</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-0 xl:w-60 xl:flex-none">
        <select
          name="status"
          value={filters.status}
          onChange={onFilterChange}
          className="h-12 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="">Trạng thái (Tất cả)</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const summary =
    selectedCount > 0 ? (
      <div className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700">
        Đã chọn: {selectedCount}/{totalCount}
      </div>
    ) : null;

  return <FilterBar controls={controls} summary={summary} />;
};

export default PayrollOverviewFilters;
