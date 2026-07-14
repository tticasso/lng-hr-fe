import React from "react";
import {
  RefreshCcw,
  Lock,
  Unlock,
  Trash2,
  Loader2,
  Copy,
  Check,
  KeyRound,
} from "lucide-react";
import Button from "../common/Button";
import { toast } from "react-toastify";

const ActionModal = ({
  type,
  user,
  users = [],
  onClose,
  onConfirm,
  processing,
  newPassword,
}) => {
  const targetUsers = users.length > 0 ? users : (user ? [user] : []);

  if (newPassword) {
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in zoom-in-95">
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            Reset Password Thành công
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Hãy copy mật khẩu này và gửi cho nhân viên.
          </p>
          <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg border border-gray-200 mb-6">
            <code className="text-lg font-mono font-bold text-blue-600 flex-1 text-center select-all">
              {newPassword}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newPassword);
                toast.success("Đã copy!");
              }}
              className="p-2 bg-white rounded border hover:bg-gray-50 text-gray-600"
              title="Copy"
            >
              <Copy size={16} />
            </button>
          </div>
          <Button className="w-full bg-blue-600 text-white" onClick={onClose}>
            Hoàn tất
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in zoom-in-95">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 
            ${type === "delete" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}
        `}
        >
          {type === "reset" && <RefreshCcw size={24} />}
          {type === "toggle_status" &&
            (user.isActive ? <Lock size={24} /> : <Unlock size={24} />)}
          {type === "delete" && <Trash2 size={24} />}
          {type === "revoke_tokens" && <KeyRound size={24} />}
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {type === "reset" && "Reset Mật khẩu?"}
          {type === "toggle_status" &&
            (user.isActive ? "Khóa tài khoản?" : "Mở khóa tài khoản?")}
          {type === "delete" && "Xóa tài khoản?"}
          {type === "revoke_tokens" &&
            (targetUsers.length > 1 ? `Thu hồi token ${targetUsers.length} tài khoản?` : "Thu hồi token?")}
        </h3>

        <p className="text-sm text-gray-500 mb-6 px-2">
          {type === "reset" &&
            `Bạn có chắc muốn đặt lại mật khẩu cho user ${user.username}?`}
          {type === "toggle_status" &&
            `Tài khoản ${user.username} sẽ ${user.isActive ? "không thể đăng nhập" : "hoạt động trở lại"}.`}
          {type === "delete" &&
            "Hành động này không thể hoàn tác. Dữ liệu tài khoản sẽ bị xóa vĩnh viễn."}
          {type === "revoke_tokens" &&
            "Access token và refresh token hiện tại sẽ hết hiệu lực. Người dùng cần đăng nhập lại."}
        </p>

        {type === "revoke_tokens" && targetUsers.length > 0 && (
          <div className="mb-6 max-h-32 overflow-auto rounded-lg border bg-gray-50 p-3 text-left">
            {targetUsers.slice(0, 8).map((targetUser) => (
              <div key={targetUser._id} className="text-xs text-gray-700">
                {targetUser.username}
              </div>
            ))}
            {targetUsers.length > 8 && (
              <div className="text-xs text-gray-500">
                +{targetUsers.length - 8} tài khoản khác
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={processing}
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={processing}
            className={`flex-1 text-white flex items-center justify-center gap-2
               ${type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {processing && <Loader2 size={16} className="animate-spin" />} Xác nhận
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
