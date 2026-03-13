import React, { memo } from "react";
import Card from "../../components/common/Card";
import { Coffee, Clock, DollarSign, PlusCircle, AlertCircle } from "lucide-react";

const QuickActions = memo(({ onLeaveClick, onOTClick, onPayrollClick, onSupportClick }) => {
  return (
    <Card className="h-full">
      <h3 className="font-bold text-gray-800 text-lg mb-5">Truy cập nhanh</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Action 1: Xin nghỉ phép */}
        <button
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm transition-all group"
          onClick={onLeaveClick}
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500 group-hover:text-blue-600 mb-3">
            <Coffee size={20} />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
            Xin nghỉ phép
          </span>
        </button>

        {/* Action 2: Gửi OT */}
        <button
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm transition-all group"
          onClick={onOTClick}
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-orange-500 group-hover:text-orange-600 mb-3">
            <Clock size={20} />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-700">
            Đăng ký OT
          </span>
        </button>

        {/* Action 3: Xem phiếu lương */}
        <button
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-green-50 hover:border-green-200 hover:shadow-sm transition-all group"
          onClick={onPayrollClick}
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-green-500 group-hover:text-green-600 mb-3">
            <DollarSign size={20} />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700">
            Phiếu lương
          </span>
        </button>

        {/* Action 4: Gửi Ticket HR */}
        <button
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm transition-all group"
          onClick={onSupportClick}
        >
          <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-purple-500 group-hover:text-purple-600 mb-3">
            <PlusCircle size={20} />
          </div>
          <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">
            Hỗ trợ
          </span>
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
          Liên hệ khẩn cấp
        </h4>
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <AlertCircle size={20} className="text-red-500" />
          <div>
            <p className="text-sm font-bold text-gray-800">IT Support</p>
            <p className="font-bold text-red-500">
              Không phải lỗi! Đấy là tính năng.
            </p>
            <p className="text-xs text-gray-500">huuluan0511@gmail.com</p>
          </div>
        </div>
      </div>
    </Card>
  );
});

QuickActions.displayName = "QuickActions";

export default QuickActions;
