import { CircleDollarSign, Download, DollarSign, Loader2, RefreshCw, Send } from "lucide-react";

import Button from "../../../components/common/Button";
import MonthYearPicker from "../../../components/common/MonthYearPicker";
import PageToolbar from "../../../components/shared/PageToolbar";

const PayrollOverviewHeader = ({
  selectedMonth,
  onChangeMonth,
  onRefresh,
  onPayment,
  onBulkAdjustments,
  onSendEmailsBulk,
  onExport,
  loading,
  sendingBulkEmails,
  selectedCount,
  exportDisabled,
  emailDisabled,
}) => {
  const actions = (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[180px_repeat(5,minmax(0,1fr))]">
      <MonthYearPicker
        value={selectedMonth}
        onChange={onChangeMonth}
        className="w-full"
      />

      <Button
        variant="secondary"
        onClick={onRefresh}
        disabled={loading}
        className="h-12 min-w-0 gap-2 rounded-xl px-3 text-sm"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        Tải lại
      </Button>

      <Button
        onClick={onPayment}
        disabled={selectedCount === 0}
        className="h-12 min-w-0 gap-2 rounded-xl bg-green-600 px-3 text-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <DollarSign size={16} />
        Thanh toán ({selectedCount})
      </Button>

      <Button
        variant="secondary"
        onClick={onBulkAdjustments}
        disabled={selectedCount === 0}
        className="h-12 min-w-0 gap-2 rounded-xl border-purple-200 bg-purple-50 px-3 text-sm text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CircleDollarSign size={16} />
        Điều chỉnh ({selectedCount})
      </Button>

      <Button
        variant="secondary"
        onClick={onSendEmailsBulk}
        disabled={emailDisabled || sendingBulkEmails}
        className="h-12 min-w-0 gap-2 rounded-xl border-blue-200 bg-blue-50 px-3 text-sm text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sendingBulkEmails ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        Gửi email tất cả
      </Button>

      <Button
        onClick={onExport}
        disabled={exportDisabled}
        className="h-12 min-w-0 gap-2 rounded-xl px-3 text-sm"
      >
        <Download size={16} />
        Xuất Excel
      </Button>
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
