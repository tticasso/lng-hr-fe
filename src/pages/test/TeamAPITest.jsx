import React, { useState, useEffect } from "react";
import { teamAPI } from "../../apis/teamAPI";

const TeamAPITest = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rawData, setRawData] = useState(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await teamAPI.get();
            console.log("TEAM_API res:", res);
            
            // Store raw response for debugging
            setRawData(res);
            
            // Extract teams data
            const teamsData = res?.data?.data || [];
            setTeams(teamsData);
        } catch (error) {
            console.error("Error fetching teams:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Team API Test</h1>
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Team API Test</h1>
                <p className="text-gray-600">Hiển thị dữ liệu từ API /teams</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800">Tổng số team</h3>
                    <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-green-800">Team có leader</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {teams.filter(team => team.leader).length}
                    </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-yellow-800">Team chưa có leader</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {teams.filter(team => !team.leader).length}
                    </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-purple-800">Phòng ban</h3>
                    <p className="text-2xl font-bold text-purple-600">
                        {new Set(teams.map(team => team.departmentId?._id).filter(Boolean)).size}
                    </p>
                </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {teams.map((team) => (
                    <div key={team._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        {/* Team Name & Code */}
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{team.name}</h3>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                    {team.teamCode}
                                </span>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                    team.isActive 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"
                                }`}>
                                    {team.isActive ? "Hoạt động" : "Không hoạt động"}
                                </span>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-600 mb-1">Phòng ban</h4>
                            <p className="text-gray-800 font-medium">
                                {team.departmentId?.name || "Chưa có phòng ban"}
                            </p>
                            {team.departmentId?.deptCode && (
                                <p className="text-sm text-gray-500">Mã: {team.departmentId.deptCode}</p>
                            )}
                        </div>

                        {/* Team Leader */}
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <h4 className="text-sm font-medium text-yellow-700 mb-1">Team Leader</h4>
                            {team.leader ? (
                                <div>
                                    <p className="text-gray-800 font-medium">{team.leader.fullName}</p>
                                    <p className="text-sm text-gray-500">Mã NV: {team.leader.employeeCode}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">Chưa có team leader</p>
                            )}
                        </div>

                        {/* Description */}
                        {team.description && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-700 mb-1">Mô tả</h4>
                                <p className="text-gray-700">{team.description}</p>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Tạo: {new Date(team.createdAt).toLocaleString("vi-VN")}</p>
                            <p>Cập nhật: {new Date(team.updatedAt).toLocaleString("vi-VN")}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Raw Data Debug */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Raw API Response (Debug)</h2>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 overflow-auto">
                    <pre className="text-sm text-gray-700">
                        {JSON.stringify(rawData, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default TeamAPITest;