import { useState, useEffect } from "react";
import useSocket from "../pages/notification/useSocket";
import { Wifi, WifiOff, AlertCircle, CheckCircle, Key } from "lucide-react";

/**
 * 🔧 Component debug WebSocket connection
 * 
 * Hiển thị:
 * - Trạng thái kết nối
 * - Socket ID
 * - Token status
 * - URL đang kết nối
 * - Lỗi nếu có
 * 
 * Sử dụng:
 * import SocketDebugger from "./components/SocketDebugger";
 * <SocketDebugger />
 */
function SocketDebugger() {
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [socketId, setSocketId] = useState(null);
    const [error, setError] = useState(null);
    const [lastMessage, setLastMessage] = useState(null);
    const [tokenStatus, setTokenStatus] = useState(null);

    // Check token
    useEffect(() => {
        try {
            const authData = localStorage.getItem("auth");
            if (authData) {
                const parsed = JSON.parse(authData);
                const token = parsed.token || parsed.accessToken;
                setTokenStatus(token ? "found" : "missing");
            } else {
                setTokenStatus("missing");
            }
        } catch (error) {
            setTokenStatus("error");
        }
    }, []);

    const socket = useSocket((data) => {
        setLastMessage({
            data,
            time: new Date().toLocaleTimeString("vi-VN"),
        });
    });

    useEffect(() => {
        if (!socket) return;

        // Listen to connection events
        const handleConnect = () => {
            setConnectionStatus("connected");
            setSocketId(socket.id);
            setError(null);
        };

        const handleDisconnect = (reason) => {
            setConnectionStatus("disconnected");
            setError(`Disconnected: ${reason}`);
        };

        const handleConnectError = (err) => {
            setConnectionStatus("error");
            setError(err.message || "Connection error");
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        // Check initial state
        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
        };
    }, [socket]);

    const getStatusColor = () => {
        switch (connectionStatus) {
            case "connected":
                return "bg-green-50 border-green-200";
            case "connecting":
                return "bg-yellow-50 border-yellow-200";
            case "disconnected":
            case "error":
                return "bg-red-50 border-red-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    const getStatusIcon = () => {
        switch (connectionStatus) {
            case "connected":
                return <CheckCircle className="text-green-600" size={20} />;
            case "connecting":
                return <Wifi className="text-yellow-600 animate-pulse" size={20} />;
            case "disconnected":
            case "error":
                return <WifiOff className="text-red-600" size={20} />;
            default:
                return <AlertCircle className="text-gray-600" size={20} />;
        }
    };

    const getStatusText = () => {
        switch (connectionStatus) {
            case "connected":
                return "✅ Connected";
            case "connecting":
                return "⏳ Connecting...";
            case "disconnected":
                return "❌ Disconnected";
            case "error":
                return "🔴 Connection Error";
            default:
                return "Unknown";
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`p-4 rounded-lg border-2 shadow-lg ${getStatusColor()} min-w-[300px]`}>
                {/* Status */}
                <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon()}
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{getStatusText()}</p>
                        {socketId && (
                            <p className="text-xs text-gray-600 font-mono">
                                ID: {socketId}
                            </p>
                        )}
                    </div>
                </div>

                {/* URL */}
                <div className="mb-2 p-2 bg-white rounded border text-xs">
                    <p className="text-gray-600 mb-1">WebSocket URL:</p>
                    <p className="font-mono text-gray-800 break-all">
                        {import.meta.env.VITE_SOCKET_URL || "Not configured"}
                    </p>
                </div>

                {/* Token Status */}
                <div className={`mb-2 p-2 rounded border text-xs ${
                    tokenStatus === "found" 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                }`}>
                    <div className="flex items-center gap-2">
                        <Key size={14} className={
                            tokenStatus === "found" ? "text-green-600" : "text-red-600"
                        } />
                        <div>
                            <p className="font-semibold">
                                Token: {tokenStatus === "found" ? "✅ Found" : "❌ Not found"}
                            </p>
                            {tokenStatus === "missing" && (
                                <p className="text-red-600 text-xs mt-1">
                                    Please login to get token
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-2 p-2 bg-red-100 border border-red-300 rounded text-xs">
                        <p className="text-red-700 font-semibold mb-1">Error:</p>
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Last Message */}
                {lastMessage && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <p className="text-blue-700 font-semibold mb-1">
                            Last message ({lastMessage.time}):
                        </p>
                        <p className="text-blue-600 truncate">
                            {lastMessage.data.title || lastMessage.data.message || "No content"}
                        </p>
                    </div>
                )}

                {/* Help */}
                {connectionStatus === "error" && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-600 mb-2">
                            💡 Troubleshooting:
                        </p>
                        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                            {tokenStatus !== "found" && (
                                <li className="text-red-600 font-semibold">
                                    Login to get authentication token
                                </li>
                            )}
                            <li>Check backend is running</li>
                            <li>Verify VITE_SOCKET_URL in .env</li>
                            <li>Check Console for details</li>
                            <li>See SOCKET_TOKEN_FIX.md</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SocketDebugger;
