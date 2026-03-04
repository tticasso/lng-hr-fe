import React, { useState, useEffect } from "react";
import { Users, Building2, Crown, RefreshCw, Loader2, Search, Filter } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { teamAPI } from "../../apis/teamAPI";

const TeamList = () => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        filterTeams();
    }, [teams, searchTerm, departmentFilter]);

    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await teamAPI.get();
            console.log("TEAM_API res:", res);
            
            const teamsData = res?.data?.data || [];
            setTeams(teamsData);
        } catch (error) {
            console.error("Error fetching teams:", error);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    const filterTeams = () => {
        let filtered = teams;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(team =>
                team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.teamCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.leader?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by department
        if (departmentFilter) {
            filtered = filtered.filter(team =>
                team.departmentId?._id === departmentFilter
            );
        }

        setFilteredTeams(filtered);
    };

    const getDepartments = () => {
        const departments = teams.map(team => team.departmentId).filter(Boolean);
        const uniqueDepartments = departments.filter((dept, index, self) =>
            index === self.findIndex(d => d._id === dept._id)
        );
        return uniqueDepartments;
    };

    const getTeamStats = () => {
        const totalTeams = teams.length;
        const teamsWithLeader = teams.filter(team => team.leader).length;
        const teamsWithoutLeader = totalTeams - teamsWithLeader;
        const activeDepartments = getDepartments().length;

        return {
            totalTeams,
            teamsWithLeader,
            teamsWithoutLeader,
            activeDepartments
        };
    };

    const stats = getTeamStats();

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Team</h1>
                    <p className="text-sm text-gray-500">
                        Tổng cộng {stats.totalTeams} team từ {stats.activeDepartments} phòng ban
                    </p>
                </div>
                <Button
                    variant="secondary"
                    className="flex gap-2 items-center"
                    onClick={fetchTeams}
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    Làm mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="text-blue-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Tổng team</p>
                            <p className="text-xl font-bold text-gray-800">{stats.totalTeams}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Crown className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Có team leader</p>
                            <p className="text-xl font-bold text-green-600">{stats.teamsWithLeader}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Users className="text-red-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chưa có leader</p>
                            <p className="text-xl font-bold text-red-600">{stats.teamsWithoutLeader}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Building2 className="text-purple-600" size={20} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phòng ban</p>
                            <p className="text-xl font-bold text-purple-600">{stats.activeDepartments}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 shrink-0">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[300px] max-w-md">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            className="pl-9 pr-4 py-2 w-full border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tìm theo tên team, mã team, hoặc team leader..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            <option value="">Tất cả phòng ban</option>
                            {getDepartments().map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name} ({dept.deptCode})
                                </option>
                            ))}
                        </select>
                    </div>

                    {(searchTerm || departmentFilter) && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSearchTerm("");
                                setDepartmentFilter("");
                            }}
                            className="text-sm"
                        >
                            Xóa bộ lọc
                        </Button>
                    )}
                </div>
            </Card>

            {/* Team Grid */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-500">Đang tải dữ liệu team...</p>
                        </div>
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <Card className="p-8">
                        <div className="text-center text-gray-500">
                            <Users size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">Không tìm thấy team nào</p>
                            <p className="text-sm">
                                {searchTerm || departmentFilter
                                    ? "Thử thay đổi bộ lọc để xem thêm kết quả"
                                    : "Chưa có team nào được tạo"
                                }
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <Card key={team._id} className="p-6 hover:shadow-lg transition-shadow">
                                <div className="space-y-4">
                                    {/* Team Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">
                                                {team.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                    {team.teamCode}
                                                </span>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                                    team.isActive 
                                                        ? "bg-green-100 text-green-700" 
                                                        : "bg-red-100 text-red-700"
                                                }`}>
                                                    {team.isActive ? "Hoạt động" : "Không hoạt động"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Department */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 size={16} className="text-gray-400" />
                                        <span>
                                            {team.departmentId?.name || "Chưa có phòng ban"} 
                                            {team.departmentId?.deptCode && (
                                                <span className="text-gray-400 ml-1">
                                                    ({team.departmentId.deptCode})
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {/* Team Leader */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Crown size={16} className="text-yellow-500" />
                                        {team.leader ? (
                                            <div>
                                                <span className="font-medium text-gray-800">
                                                    {team.leader.fullName}
                                                </span>
                                                <span className="text-gray-400 ml-2">
                                                    ({team.leader.employeeCode})
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-500 italic">Chưa có team leader</span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {team.description && (
                                        <div className="text-sm text-gray-600">
                                            <p className="line-clamp-2">{team.description}</p>
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div className="pt-3 border-t border-gray-100">
                                        <div className="flex justify-between text-xs text-gray-400">
                                            <span>
                                                Tạo: {new Date(team.createdAt).toLocaleDateString("vi-VN")}
                                            </span>
                                            <span>
                                                Cập nhật: {new Date(team.updatedAt).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Results Summary */}
            {!loading && filteredTeams.length > 0 && (
                <div className="shrink-0 text-center text-sm text-gray-500 py-2">
                    Hiển thị {filteredTeams.length} / {teams.length} team
                </div>
            )}
        </div>
    );
};

export default TeamList;