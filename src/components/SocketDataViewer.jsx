import { useState, useCallback } from "react";
import useSocket from "../pages/notification/useSocket";
import { Bell, Eye } from "lucide-react";

/**
 * 📊 Component nhỏ gọn để xem data socket
 * 
 * Có thể nhúng vào bất kỳ trang nào
 * 
 * Sử dụng:
 * import SocketDataViewer from "./components/SocketDataViewer";
 * <SocketDataViewer />
 */
function SocketDataViewer() {
    const [data, setData] = useState(null);
    const [count, setCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNotification = useCallback((newData) => {
        console.log("📩 Socket data:", newData);
        setData(newData);
        setCount(prev => prev + 1);
    }, []);

    useSocket(handleNotification);

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
            >
                <Eye size={20} />
                <span className="font-semibold">Xem Socket Data</span>
                {count > 0 && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                        {count}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-96 bg-white rounded-lg shadow-2xl border-2 border-blue-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Bell size={20} />
                    <h3 className="font-semibold">Socket Data</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-blue-700 rounded text-xs font-bold">
                        {count} messages
                    </span>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="hover:bg-blue-700 rounded p-1"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
                {data ? (
                    <div className="space-y-3">
                        {/* Preview */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <h4 className="font-bold text-gray-900 mb-1">
                                {data.title || "No title"}
                            </h4>
                            <p className="text-sm text-gray-700">
                                {data.message || "No message"}
                            </p>
                            {data.type && (
                                <span className="inline-block mt-2 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                                    {data.type}
                                </span>
                            )}
                        </div>

                        {/* JSON */}
                        <div>
                            <h5 className="text-xs font-semibold text-gray-600 mb-2">
                                JSON Data:
                            </h5>
                            <pre className="p-3 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-48">
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </div>

                        {/* Fields */}
                        <div>
                            <h5 className="text-xs font-semibold text-gray-600 mb-2">
                                Fields:
                            </h5>
                            <div className="space-y-1">
                                {Object.entries(data).map(([key, value]) => (
                                    <div key={key} className="flex gap-2 text-xs">
                                        <span className="font-semibold text-gray-600 min-w-[80px]">
                                            {key}:
                                        </span>
                                        <span className="text-gray-800 break-all">
                                            {typeof value === "object" 
                                                ? JSON.stringify(value) 
                                                : String(value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm">
                            Chưa nhận được data
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                            Đợi backend gửi...
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t rounded-b-lg">
                <a
                    href="/notifications/viewer"
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                    Xem trang đầy đủ →
                </a>
            </div>
        </div>
    );
}

export default SocketDataViewer;
