import React from "react";
import { X, AlertTriangle, Loader2 } from "lucide-react";

const DeleteConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    loading = false,
    title = "Xác nhận xóa",
    message = "Bạn có chắc chắn muốn xóa?",
    itemName = "",
    warningText = "Hành động này không thể hoàn tác!"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        disabled={loading}
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 mb-4">{message}</p>
                    
                    {itemName && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-800 font-medium break-words">
                                {itemName}
                            </p>
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800 font-medium">
                            ⚠️ {warningText}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Đang xóa...
                            </>
                        ) : (
                            "Xóa"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
