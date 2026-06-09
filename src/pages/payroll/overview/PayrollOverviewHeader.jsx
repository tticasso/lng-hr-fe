import { useEffect, useRef, useState } from "react";
import {
  CircleDollarSign,
  Download,
  DollarSign,
  Loader2,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";

import Button from "../../../components/common/Button";
import MonthYearPicker from "../../../components/common/MonthYearPicker";
import PageToolbar from "../../../components/shared/PageToolbar";

const PayrollActionMenu = ({
  canRunPayroll,
  deleteDisabled,
  deletingPayrollPeriod,
  exportDisabled,
  onBulkAdjustments,
  onDeletePeriod,
  onExport,
  onPayment,
  selectedCount,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const runAction = (action) => {
    setOpen(false);
    action();
  };

  const menuItems = [
    canRunPayroll && {
      key: "payment",
      label: `Thanh toán (${selectedCount})`,
      icon: <DollarSign size={16} />,
      disabled: selectedCount === 0,
      onClick: onPayment,
    },
    canRunPayroll && {
      key: "adjustments",
      label: `Điều chỉnh (${selectedCount})`,
      icon: <CircleDollarSign size={16} />,
      disabled: selectedCount === 0,
      onClick: onBulkAdjustments,
    },
    {
      key: "export",
      label: "Xuất Excel",
      icon: <Download size={16} />,
      disabled: exportDisabled,
      onClick: onExport,
    },
    canRunPayroll && {
      key: "delete-period",
      label: "Xoá dữ liệu kỳ này",
      icon: deletingPayrollPeriod ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />,
      disabled: deleteDisabled || deletingPayrollPeriod,
      danger: true,
      onClick: onDeletePeriod,
    },
  ].filter(Boolean);

  return (
    <div ref={menuRef} className="relative shrink-0">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen((value) => !value)}
        className="h-11 w-11 rounded-lg px-0"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Thao tác bảng lương"
      >
        <MoreHorizontal size={18} />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => runAction(item.onClick)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white ${
                item.danger ? "text-red-600" : "text-gray-700"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PayrollOverviewHeader = ({
  selectedMonth,
  onChangeMonth,
  onRefresh,
  onPayment,
  onBulkAdjustments,
  onDeletePeriod,
  onFinalizeAndSend,
  onSendEmailsBulk,
  onExport,
  loading,
  sendingBulkEmails,
  finalizingAndSending,
  deletingPayrollPeriod,
  selectedCount,
  exportDisabled,
  deleteDisabled,
  emailDisabled,
  finalizeAndSendDisabled,
  canRunPayroll = false,
}) => {
  const hasDraftPayrolls = !finalizeAndSendDisabled;
  const canSendFinalizedPayrolls = !emailDisabled;
  const showPrimaryAction = canRunPayroll && (hasDraftPayrolls || canSendFinalizedPayrolls);
  const primaryAction = hasDraftPayrolls
    ? {
        label: "Chốt & gửi mail",
        icon: <Lock size={16} />,
        loading: finalizingAndSending,
        disabled: finalizingAndSending || sendingBulkEmails,
        onClick: onFinalizeAndSend,
      }
    : {
        label: "Gửi phiếu đã chốt",
        icon: <Send size={16} />,
        loading: sendingBulkEmails,
        disabled: sendingBulkEmails,
        onClick: onSendEmailsBulk,
      };

  const actions = (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
      <div className="min-w-0 sm:w-56 xl:w-60">
        <MonthYearPicker value={selectedMonth} onChange={onChangeMonth} className="w-full" />
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onRefresh}
          disabled={loading}
          className="h-11 w-11 shrink-0 rounded-lg px-0"
          title="Tải lại bảng lương"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </Button>

        {showPrimaryAction && (
          <Button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
            className="h-11 min-w-0 flex-1 gap-2 rounded-lg bg-blue-600 px-4 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {primaryAction.loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              primaryAction.icon
            )}
            <span className="truncate">{primaryAction.label}</span>
          </Button>
        )}

        <PayrollActionMenu
          canRunPayroll={canRunPayroll}
          deleteDisabled={deleteDisabled}
          deletingPayrollPeriod={deletingPayrollPeriod}
          exportDisabled={exportDisabled}
          onBulkAdjustments={onBulkAdjustments}
          onDeletePeriod={onDeletePeriod}
          onExport={onExport}
          onPayment={onPayment}
          selectedCount={selectedCount}
        />
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
