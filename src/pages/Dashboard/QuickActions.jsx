import React, { memo } from "react";
import Card from "../../components/common/Card";
import { Coffee, Clock, DollarSign, PlusCircle, AlertCircle } from "lucide-react";

const QuickActions = memo(({ onLeaveClick, onOTClick, onPayrollClick, onSupportClick }) => {
  return (
    <Card className="h-full">
      <h3 className="mb-5 text-base font-bold text-gray-800 sm:text-lg">Truy cập nhanh</h3>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <button
          className="group flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
          onClick={onLeaveClick}
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm group-hover:text-blue-600">
            <Coffee size={20} />
          </div>
          <span className="text-center text-sm font-semibold text-gray-700 group-hover:text-blue-700">
            Xin nghỉ phép
          </span>
        </button>

        <button
          className="group flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50 hover:shadow-sm"
          onClick={onOTClick}
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm group-hover:text-orange-600">
            <Clock size={20} />
          </div>
          <span className="text-center text-sm font-semibold text-gray-700 group-hover:text-orange-700">
            Đăng ký OT
          </span>
        </button>

        <button
          className="group flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-green-200 hover:bg-green-50 hover:shadow-sm"
          onClick={onPayrollClick}
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-green-500 shadow-sm group-hover:text-green-600">
            <DollarSign size={20} />
          </div>
          <span className="text-center text-sm font-semibold text-gray-700 group-hover:text-green-700">
            Phiếu lương
          </span>
        </button>

        <button
          className="group flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-purple-200 hover:bg-purple-50 hover:shadow-sm"
          onClick={onSupportClick}
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-purple-500 shadow-sm group-hover:text-purple-600">
            <PlusCircle size={20} />
          </div>
          <span className="text-center text-sm font-semibold text-gray-700 group-hover:text-purple-700">
            Hỗ trợ
          </span>
        </button>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-6">
        <h4 className="mb-3 text-xs font-semibold uppercase text-gray-400">Liên hệ khẩn cấp</h4>
        <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
          <AlertCircle size={20} className="shrink-0 text-red-500" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800">IT Support</p>
            <p className="font-bold text-red-500">Không phải lỗi, đấy là tính năng.</p>
            <p className="text-xs text-gray-500">huuluan0511@gmail.com</p>
          </div>
        </div>
      </div>
    </Card>
  );
});

QuickActions.displayName = "QuickActions";

export default QuickActions;
