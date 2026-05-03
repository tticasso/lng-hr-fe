import { Download, DollarSign, RefreshCw } from "lucide-react";

import Button from "../../../components/common/Button";
import MonthYearPicker from "../../../components/common/MonthYearPicker";
import PageToolbar from "../../../components/shared/PageToolbar";

const PayrollOverviewHeader = ({
  selectedMonth,
  onChangeMonth,
  onRefresh,
  onPayment,
  onExport,
  loading,
  selectedCount,
  exportDisabled,
}) => {
  const actions = (
    <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
      <MonthYearPicker
        value={selectedMonth}
        onChange={onChangeMonth}
        className="w-full xl:w-auto xl:flex-none"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:flex xl:min-w-0 xl:flex-nowrap xl:items-center xl:justify-end">
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={loading}
          className="h-12 gap-2 rounded-xl px-4 text-sm xl:min-w-[140px]"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Tải lại
        </Button>

        <Button
          onClick={onPayment}
          disabled={selectedCount === 0}
          className="h-12 gap-2 rounded-xl bg-green-600 px-4 text-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 xl:min-w-[170px]"
        >
          <DollarSign size={16} />
          Thanh toán ({selectedCount})
        </Button>

        <Button
          onClick={onExport}
          disabled={exportDisabled}
          className="h-12 gap-2 rounded-xl px-4 text-sm xl:min-w-[150px]"
        >
          <Download size={16} />
          Xuất Excel
        </Button>
      </div>
    </div>
  );

  return (
    <PageToolbar
      title="Bảng lương theo tháng"
      description="Quản lý và theo dõi bảng lương nhân viên"
      actions={actions}
    />
  );
};

export default PayrollOverviewHeader;
