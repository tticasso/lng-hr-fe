import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Crown,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { teamAPI } from "../../apis/teamAPI";
import TeamDetailModal from "../../components/modals/TeamDetailModal";
import CreateTeamModal from "../../components/modals/CreateTeamModal";
import DeleteConfirmModal from "../../components/modals/DeleteConfirmModal";
import { departmentApi } from "../../apis/departmentApi";
import { toast } from "react-toastify";

const TeamPages = () => {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const role = useMemo(() => {
    const raw = localStorage.getItem("role");
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }, []);

  const canManage = useMemo(
    () => role === "ADMIN" || role === "HR" || role === "MANAGER",
    [role],
  );

  const [teamDetailModal, setTeamDetailModal] = useState({
    isOpen: false,
    teamId: null,
  });

  const [createTeamModal, setCreateTeamModal] = useState({
    isOpen: false,
    teamData: null,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    teamData: null,
    loading: false,
  });

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamAPI.get();
      setTeams(res?.data?.data || []);
    } catch (error) {
      console.error("TEAM_API error:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    departmentApi.getAll().catch((error) => console.error("DEPARTMENT_API error:", error));
  }, []);

  const filteredTeams = useMemo(() => {
    let filtered = teams;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (team) =>
          team.name?.toLowerCase().includes(search) ||
          team.teamCode?.toLowerCase().includes(search) ||
          team.leader?.fullName?.toLowerCase().includes(search),
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter((team) => team.departmentId?._id === departmentFilter);
    }

    return filtered;
  }, [teams, searchTerm, departmentFilter]);

  const departments = useMemo(() => {
    const depts = teams.map((team) => team.departmentId).filter(Boolean);
    return depts.filter((dept, index, self) => index === self.findIndex((d) => d._id === dept._id));
  }, [teams]);

  const stats = useMemo(() => {
    const totalTeams = teams.length;
    const teamsWithLeader = teams.filter((team) => team.leader).length;
    return {
      totalTeams,
      teamsWithLeader,
      teamsWithoutLeader: totalTeams - teamsWithLeader,
      activeDepartments: departments.length,
    };
  }, [teams, departments]);

  const openTeamDetailModal = (teamId) => {
    setTeamDetailModal({ isOpen: true, teamId });
  };

  const closeTeamDetailModal = () => {
    setTeamDetailModal({ isOpen: false, teamId: null });
  };

  const openCreateTeamModal = () => {
    setCreateTeamModal({ isOpen: true, teamData: null });
  };

  const openEditTeamModal = (team) => {
    setCreateTeamModal({ isOpen: true, teamData: team });
  };

  const closeCreateTeamModal = () => {
    setCreateTeamModal({ isOpen: false, teamData: null });
  };

  const handleCreateSuccess = () => {
    fetchTeams();
  };

  const openDeleteModal = (team) => {
    setDeleteModal({ isOpen: true, teamData: team, loading: false });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, teamData: null, loading: false });
  };

  const handleDeleteTeam = async () => {
    if (!deleteModal.teamData) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      await teamAPI.delete(deleteModal.teamData._id);
      toast.success("Xóa team thành công!");
      closeDeleteModal();
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error(error?.response?.data?.message || "Xóa team thất bại");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col gap-6">
      <div className="flex shrink-0 items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý team</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng cộng {stats.totalTeams} team từ {stats.activeDepartments} phòng ban
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              variant="primary"
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={openCreateTeamModal}
              title="Tạo team"
            >
              <Plus size={16} />
            </Button>
          )}
          <Button variant="secondary" onClick={fetchTeams} title="Làm mới">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </Button>
        </div>
      </div>

      <Card className="shrink-0 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px] flex-1 max-w-xl">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tìm theo tên team, mã team hoặc team leader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
              title="Xóa bộ lọc"
            >
              <RefreshCw size={16} />
            </Button>
          )}
        </div>
      </Card>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="mx-auto mb-4 animate-spin text-blue-600" />
              <p className="text-gray-500">Đang tải dữ liệu team...</p>
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card className="p-8">
            <div className="text-center text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="mb-2 text-lg font-medium">Không tìm thấy team nào</p>
              <p className="text-sm">
                {searchTerm || departmentFilter
                  ? "Thử thay đổi bộ lọc để xem thêm kết quả"
                  : "Chưa có team nào được tạo"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <Card key={team._id} className="p-5 transition-shadow hover:shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <Users size={22} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{team.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                          {team.teamCode}
                        </span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-semibold ${
                            team.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {team.isActive ? "Hoạt động" : "Không hoạt động"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-gray-400" />
                      <span>
                        {team.departmentId?.name || "Chưa có phòng ban"}
                        {team.departmentId?.deptCode ? ` (${team.departmentId.deptCode})` : ""}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Crown size={15} className="text-yellow-500" />
                      {team.leader ? (
                        <span>
                          <span className="font-medium text-gray-800">{team.leader.fullName}</span>
                          <span className="ml-2 text-gray-400">({team.leader.employeeCode})</span>
                        </span>
                      ) : (
                        <span className="italic text-gray-500">Chưa có team leader</span>
                      )}
                    </div>
                  </div>

                  {team.description && (
                    <p className="line-clamp-2 text-sm text-gray-600">{team.description}</p>
                  )}

                  <div className="border-t border-gray-100 pt-3 text-xs text-gray-400">
                    <div className="flex justify-between gap-2">
                      <span>Tạo: {new Date(team.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span>Cập nhật: {new Date(team.updatedAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => openTeamDetailModal(team._id)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEditTeamModal(team)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(team)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
                          title="Xóa team"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TeamDetailModal
        isOpen={teamDetailModal.isOpen}
        onClose={closeTeamDetailModal}
        teamId={teamDetailModal.teamId}
      />

      <CreateTeamModal
        isOpen={createTeamModal.isOpen}
        onClose={closeCreateTeamModal}
        onSuccess={handleCreateSuccess}
        teamData={createTeamModal.teamData}
      />

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
