import { useState, useCallback } from "react";
import useSocket from "./useSocket";
import { Bell, Trash2, Download } from "lucide-react";

/**
 * 📺 Màn hình xem data từ WebSocket
 * 
 * Route: /notifications/viewer
 * 
 * Hiển thị:
 * - Data mới nhất
 * - Lịch sử tất cả notifications
 * - JSON format để dễ đọc
 */
function NotificationViewer() {
    const [notifications, setNotifications] = useState([]);
    const [latestData, setLatestData] = useState(null);

    // Xử lý data từ socket
    const handleNotification = useCallback((data) => {
        console.log("📩 Nhận được data:", data);

        // Lưu data mới nhất
        setLatestData(data);

        // Thêm vào lịch sử với timestamp
        const notificationWithTime = {
            ...data,
            receivedAt: new Date().toISOString(),
            id: data.id || `notif_${Date.now()}`,
        };

        setNotifications(prev => [notificationWithTime, ...prev]);
    }, []);

    // Kết nối socket
    useSocket(handleNotification);

    // Clear tất cả
    const clearAll = () => {
        setNotifications([]);
        setLatestData(null);
    };

    // Download JSON
    const downloadJSON = () => {
        const dataStr = JSON.stringify(notifications, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `notifications_${Date.now()}.json`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Bell className="text-blue-600" size={32} />
                        WebSocket Notification Viewer
                    </h1>
                    <p className="text-gray-600">
                        Xem data real-time từ WebSocket
                    </p>
                </div>

                {/* Actions */}
                <div className="mb-6 flex gap-3">
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        <Trash2 size={18} />
                        Clear All
                    </button>
                    <button
                        onClick={downloadJSON}
                        disabled={notifications.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} />
                        Download JSON
                    </button>
                    <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="text-lg font-bold text-blue-600">
                            {notifications.length}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Latest Data */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            📩 Data mới nhất
                        </h2>

                        {latestData ? (
                            <div className="space-y-4">
                                {/* Preview Card */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="mb-3">
                                        <span className="text-xs text-blue-600 font-semibold">
                                            {new Date().toLocaleString("vi-VN")}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                                        {latestData.title || "No title"}
                                    </h3>
                                    <p className="text-gray-700 mb-3">
                                        {latestData.message || "No message"}
                                    </p>
                                    {latestData.type && (
                                        <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                            {latestData.type}
                                        </span>
                                    )}
                                </div>

                                {/* JSON View */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                        JSON Format:
                                    </h4>
                                    <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-auto text-xs font-mono max-h-96">
                                        {JSON.stringify(latestData, null, 2)}
                                    </pre>
                                </div>

                                {/* Fields */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                        Fields:
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(latestData).map(([key, value]) => (
                                            <div key={key} className="p-2 bg-gray-50 rounded border">
                                                <span className="text-xs text-gray-500 block mb-1">
                                                    {key}:
                                                </span>
                                                <span className="text-sm font-semibold text-gray-800 break-all">
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
                            <div className="text-center py-12">
                                <Bell size={64} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">
                                    Chưa nhận được data nào
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Đợi backend gửi notification...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: History */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            📜 Lịch sử ({notifications.length})
                        </h2>

                        <div className="space-y-3 max-h-[800px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                    <div
                                        key={notif.id}
                                        className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-500">
                                                #{notifications.length - index}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(notif.receivedAt).toLocaleTimeString("vi-VN")}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <h4 className="font-semibold text-gray-900 mb-1">
                                            {notif.title || "No title"}
                                        </h4>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {notif.message || "No message"}
                                        </p>

                                        {/* Type badge */}
                                        {notif.type && (
                                            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                {notif.type}
                                            </span>
                                        )}

                                        {/* Expandable JSON */}
                                        <details className="mt-3">
                                            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-700">
                                                Xem JSON
                                            </summary>
                                            <pre className="mt-2 p-2 bg-gray-900 text-green-400 rounded text-xs overflow-auto max-h-40">
                                                {JSON.stringify(notif, null, 2)}
                                            </pre>
                                        </details>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">Chưa có lịch sử</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-2">
                        💡 Hướng dẫn:
                    </h3>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                        <li>Màn hình này tự động lắng nghe WebSocket event "notification"</li>
                        <li>Khi backend emit notification, data sẽ hiển thị ngay lập tức</li>
                        <li>Data mới nhất hiển thị bên trái, lịch sử bên phải</li>
                        <li>Click "Xem JSON" để xem chi tiết từng notification</li>
                        <li>Click "Download JSON" để tải về file JSON</li>
                        <li>Mở Console (F12) để xem log chi tiết</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default NotificationViewer;
