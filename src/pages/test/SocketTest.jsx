import { useState, useCallback } from "react";
import useSocket from "../notification/useSocket";
import { handleSocketNotification, createNotificationObject, getNotificationStyle } from "../../untils/notificationHandler";
import { Bell, Wifi, WifiOff, Trash2 } from "lucide-react";

/**
 * 🧪 Trang test WebSocket
 * 
 * Route: /test/socket
 * 
 * Chức năng:
 * - Hiển thị trạng thái kết nối
 * - Nhận và hiển thị data từ socket
 * - Lịch sử notifications
 * - Test emit data lên server
 */
function SocketTest() {
    const [isConnected, setIsConnected] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [lastData, setLastData] = useState(null);

    // ✅ Xử lý data từ socket
    const handleSocketData = useCallback((data) => {
        console.log("📩 Socket data received:", data);

        // Lưu data mới nhất
        setLastData(data);

        // Tạo notification object chuẩn
        const notification = createNotificationObject(data);

        // Thêm vào danh sách
        setNotifications(prev => [notification, ...prev].slice(0, 20)); // Giới hạn 20 items

        // Xử lý hiển thị toast theo type
        handleSocketNotification(data);
    }, []);

    // Kết nối socket
    const socket = useSocket(handleSocketData);

    // Test emit data lên server
    const testEmit = (type) => {
        const testData = {
            userId: localStorage.getItem("accountID"),
            type: type,
            message: `Test ${type} notification`,
        };

        console.log("📤 Emitting test data:", testData);
        socket.emit("new_notification", testData);
    };

    // Clear notifications
    const clearNotifications = () => {
        setNotifications([]);
        setLastData(null);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🧪 WebSocket Test Page
                </h1>
                <p className="text-gray-600">
                    Test và debug WebSocket real-time notifications
                </p>
            </div>

            {/* Connection Status */}
            <div className="mb-6 p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isConnected ? (
                            <>
                                <Wifi className="text-green-500" size={24} />
                                <div>
                                    <p className="font-semibold text-green-700">
                                        ✅ Connected
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Socket ID: {socket?.id || "N/A"}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <WifiOff className="text-red-500" size={24} />
                                <div>
                                    <p className="font-semibold text-red-700">
                                        ❌ Disconnected
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Đang thử kết nối lại...
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-600">
                            WebSocket URL:
                        </p>
                        <p className="text-xs font-mono text-gray-500">
                            {import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Latest Data */}
                <div>
                    <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Bell size={20} className="text-blue-500" />
                            Data mới nhất
                        </h2>
                        
                        {lastData ? (
                            <div className="space-y-3">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                    <pre className="text-xs overflow-auto">
                                        {JSON.stringify(lastData, null, 2)}
                                    </pre>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600">Type:</span>
                                        <p className="font-semibold">{lastData.type || "N/A"}</p>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600">ID:</span>
                                        <p className="font-mono text-xs">{lastData.id || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2 p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600">Title:</span>
                                        <p className="font-semibold">{lastData.title || "N/A"}</p>
                                    </div>
                                    <div className="col-span-2 p-2 bg-gray-50 rounded">
                                        <span className="text-gray-600">Message:</span>
                                        <p>{lastData.message || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <Bell size={48} className="mx-auto mb-3 opacity-30" />
                                <p>Chưa nhận được data nào</p>
                                <p className="text-xs mt-1">Đợi backend gửi notification...</p>
                            </div>
                        )}
                    </div>

                    {/* Test Buttons */}
                    <div className="bg-white border rounded-lg shadow-sm p-4">
                        <h2 className="text-lg font-semibold mb-3">
                            🧪 Test Emit Events
                        </h2>
                        <p className="text-xs text-gray-500 mb-3">
                            Gửi test data lên server (nếu backend hỗ trợ)
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => testEmit("LEAVE_APPROVED")}
                                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                            >
                                ✅ Leave Approved
                            </button>
                            <button
                                onClick={() => testEmit("LEAVE_REJECTED")}
                                className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                            >
                                ❌ Leave Rejected
                            </button>
                            <button
                                onClick={() => testEmit("OT_APPROVED")}
                                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                            >
                                ⏰ OT Approved
                            </button>
                            <button
                                onClick={() => testEmit("URGENT")}
                                className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                            >
                                🚨 Urgent
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: History */}
                <div className="bg-white border rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">
                            📜 Lịch sử ({notifications.length}/20)
                        </h2>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearNotifications}
                                className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
                            >
                                <Trash2 size={14} />
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => {
                                const style = getNotificationStyle(notif.type);
                                
                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-3 rounded-lg border ${style.bgColor} ${style.borderColor}`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-xl">{style.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="text-xs font-semibold text-gray-500">
                                                        #{notifications.length - index}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(notif.createdAt).toLocaleTimeString("vi-VN")}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-sm mb-1">
                                                    {notif.title}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {notif.content}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${style.color} ${style.bgColor} border ${style.borderColor}`}>
                                                        {notif.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <p>Chưa có lịch sử</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold mb-2">💡 Hướng dẫn sử dụng:</h3>
                <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Trang này tự động lắng nghe WebSocket event "notification"</li>
                    <li>Khi backend emit notification, data sẽ hiển thị ở đây</li>
                    <li>Mở Console (F12) để xem log chi tiết</li>
                    <li>Test buttons chỉ hoạt động nếu backend hỗ trợ event "testNotification"</li>
                    <li>Kiểm tra file .env để đảm bảo VITE_SOCKET_URL đúng</li>
                </ul>
            </div>
        </div>
    );
}

export default SocketTest;
