import { useState, useCallback } from "react";
import useSocket from "../pages/notification/useSocket";

/**
 * 📡 Component ví dụ: Cách lấy và hiển thị data từ WebSocket
 * 
 * Sử dụng:
 * import SocketDataExample from "./components/SocketDataExample";
 * <SocketDataExample />
 */
function SocketDataExample() {
    const [socketData, setSocketData] = useState(null);
    const [dataHistory, setDataHistory] = useState([]);

    // ✅ Callback để xử lý data từ socket
    const handleSocketData = useCallback((data) => {

        // Lưu data mới nhất
        setSocketData(data);

        // Thêm vào lịch sử (giới hạn 10 items)
        setDataHistory(prev => [
            {
                ...data,
                receivedAt: new Date().toISOString()
            },
            ...prev
        ].slice(0, 10));
    }, []);

    // Kết nối socket
    useSocket(handleSocketData);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                📡 WebSocket Data Example
            </h2>

            {/* Data mới nhất */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                    Data mới nhất:
                </h3>
                {socketData ? (
                    <pre className="bg-white p-3 rounded border overflow-auto text-sm">
                        {JSON.stringify(socketData, null, 2)}
                    </pre>
                ) : (
                    <p className="text-gray-500 italic">
                        Chưa nhận được data nào. Đợi backend gửi...
                    </p>
                )}
            </div>

            {/* Lịch sử data */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">
                    Lịch sử ({dataHistory.length}/10):
                </h3>
                
                {dataHistory.length > 0 ? (
                    <div className="space-y-3">
                        {dataHistory.map((item, index) => (
                            <div 
                                key={index}
                                className="p-3 bg-white border rounded-lg"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-sm">
                                        #{index + 1}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(item.receivedAt).toLocaleString("vi-VN")}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span className="text-gray-600">ID:</span>{" "}
                                        <span className="font-mono">{item.id || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Type:</span>{" "}
                                        <span className="font-mono">{item.type || "N/A"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Title:</span>{" "}
                                        <span>{item.title || "N/A"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-600">Message:</span>{" "}
                                        <span>{item.message || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-center py-4">
                        Chưa có lịch sử
                    </p>
                )}
            </div>

            {/* Hướng dẫn */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold mb-2">💡 Hướng dẫn:</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Component này tự động lắng nghe WebSocket</li>
                    <li>Khi backend emit event "notification", data sẽ hiển thị ở đây</li>
                    <li>Mở Console (F12) để xem log chi tiết</li>
                    <li>Data structure phụ thuộc vào backend của bạn</li>
                </ul>
            </div>
        </div>
    );
}

export default SocketDataExample;
