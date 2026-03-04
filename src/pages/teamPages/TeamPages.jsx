import React, { useState, useEffect, useMemo } from "react";
import { Users, Building2, Crown, RefreshCw, Loader2, Search, Filter, Eye, Plus, Edit, Trash2 } from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { teamAPI } from "../../apis/teamAPI";
import TeamDetailModal from "../../components/modals/TeamDetailModal";
import CreateTeamModal from "../../components/modals/CreateTeamModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import { departmentApi } from "../../apis/departmentApi";
import { employeeApi } from "../../apis/employeeApi";
import { toast } from "react-toastify";

const TeamPages = () => {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");

    // Team Detail Modal
    const [teamDetailModal, setTeamDetailModal] = useState({
        isOpen: false,
        teamId: null,
    });

    // Create Team Modal
    const [createTeamModal, setCreateTeamModal] = useState({
        isOpen: false,
        teamData: null, // null for create, team object for edit
    });

    // Delete Confirm Modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        teamData: null,
        loading: false,
    });

    useEffect(() => {
        CallAPITeam();
        CallAPIDepartmen();
        CallAPIEmployee();
    }, []);


    const CallAPIEmployee = async () => {
        setLoading(true);

        try {
            const res = await employeeApi.getAll();
            console.log("EMPLOYEE_API res:", res);

        } catch (error) {
            console.log("EMPLOYEE_API error:", error);

        }
    }

    const CallAPIDepartmen = async () => {
        setLoading(true);

        try {
            const res = await departmentApi.getAll();
            console.log("DEPARTMENT_API res:", res);

        } catch (error) {
            console.log("DEPARTMENT_API error:", error);

        }
    }

    const CallAPITeam = async () => {
        setLoading(true);
        try {
            const res = await teamAPI.get();
            console.log("TEAM_API res:", res);

            const teamsData = res?.data?.data || [];
            setTeams(teamsData);
        } catch (error) {
            console.log("TEAM_API error:", error);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredTeams = useMemo(() => {
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

        return filtered;
    }, [teams, searchTerm, departmentFilter]);

    const departments = useMemo(() => {
        const depts = teams.map(team => team.departmentId).filter(Boolean);
        const uniqueDepts = depts.filter((dept, index, self) =>
            index === self.findIndex(d => d._id === dept._id)
        );
        return uniqueDepts;
    }, [teams]);

    const stats = useMemo(() => {
        const totalTeams = teams.length;
        const teamsWithLeader = teams.filter(team => team.leader).length;
        const teamsWithoutLeader = totalTeams - teamsWithLeader;
        const activeDepartments = departments.length;

        return {
            totalTeams,
            teamsWithLeader,
            teamsWithoutLeader,
            activeDepartments
        };
    }, [teams, departments]);

    const openTeamDetailModal = (teamId) => {
        setTeamDetailModal({
            isOpen: true,
            teamId: teamId,
        });
    };

    const closeTeamDetailModal = () => {
        setTeamDetailModal({ isOpen: false, teamId: null });
    };

    const openCreateTeamModal = () => {
        setCreateTeamModal({
            isOpen: true,
            teamData: null, // Create mode
        });
    };

    const openEditTeamModal = (team) => {
        setCreateTeamModal({
            isOpen: true,
            teamData: team, // Edit mode
        });
    };

    const closeCreateTeamModal = () => {
        setCreateTeamModal({
            isOpen: false,
            teamData: null,
        });
    };

    const handleCreateSuccess = () => {
        CallAPITeam(); // Refresh team list
    };

    const openDeleteModal = (team) => {
        setDeleteModal({
            isOpen: true,
            teamData: team,
            loading: false,
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            teamData: null,
            loading: false,
        });
    };

    const handleDeleteTeam = async () => {
        if (!deleteModal.teamData) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));

        try {
            await teamAPI.delete(deleteModal.teamData._id);
            toast.success("Xóa team thành công!");
            closeDeleteModal();
            CallAPITeam(); // Refresh team list
        } catch (error) {
            console.error("Error deleting team:", error);
            const errorMessage = error?.response?.data?.message || "Xóa team thất bại";
            toast.error(errorMessage);
            setDeleteModal(prev => ({ ...prev, loading: false }));
        }
    };

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
                <div className="flex gap-3">
                    <Button
                        variant="primary"
                        className="flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={openCreateTeamModal}
                    >
                        <Plus size={16} />
                        Tạo Team
                    </Button>
                    <Button
                        variant="secondary"
                        className="flex gap-2 items-center"
                        onClick={CallAPITeam}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        Làm mới
                    </Button>
                </div>
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
                            {departments.map((dept) => (
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
                                                <span className={`px-2 py-1 text-xs font-semibold rounded ${team.isActive
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

                                    {/* Action Buttons */}
                                    <div className="pt-3 flex gap-2">
                                        <button
                                            onClick={() => openTeamDetailModal(team._id)}
                                            className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={14} />
                                            Chi tiết
                                        </button>
                                        <button
                                            onClick={() => openEditTeamModal(team)}
                                            className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit size={14} />
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(team)}
                                            className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                            title="Xóa team"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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

            {/* Team Detail Modal */}
            <TeamDetailModal
                isOpen={teamDetailModal.isOpen}
                onClose={closeTeamDetailModal}
                teamId={teamDetailModal.teamId}
            />

            {/* Create/Edit Team Modal */}
            <CreateTeamModal
                isOpen={createTeamModal.isOpen}
                onClose={closeCreateTeamModal}
                onSuccess={handleCreateSuccess}
                teamData={createTeamModal.teamData}
            />

            {/* Delete Confirm Modal */}
            <DeleteConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteTeam}
                loading={deleteModal.loading}
                title="Xác nhận xóa team"
                message="Bạn có chắc chắn muốn xóa team này?"
                itemName={deleteModal.teamData ? `${deleteModal.teamData.name} (${deleteModal.teamData.teamCode})` : ""}
                warningText="Team sẽ bị xóa vĩnh viễn và không thể khôi phục!"
            />
        </div>
    );
};

export default TeamPages;
