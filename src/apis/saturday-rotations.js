import apiClient from "./apiClient";

export const saturdayRotations = {


    //tạo mới 1 lịch nghỉ 
    // auto 
    // body (payload)
    // {
    //   "teamId": "65f...123", 
    //   "month": 4,
    //   "year": 2026,
    //   "minPresent": 3 
    // }
    // Manual body(payload)

    // {
    //   "teamId": "ID_CUA_TEAM",
    //   "month": 4,
    //   "year": 2026,
    //   "minMembersPresent": 2, // Số người tối thiểu phải có mặt (không bắt buộc)
    //   "customRotations": [
    //     {
    //       "date": "2026-04-11", 
    //       "employeesOff": ["ID_NV_A", "ID_NV_B"] // Những người này sẽ nghỉ ngày 11
    //     }
    //   ]
    // }

    post: (data) => {
        return apiClient.post("/saturday-rotations", data);
    },


    //lấy data lịch nghỉ của team
    get: (teamid, month, year) => {
        return apiClient.get(`saturday-rotations?teamId=${teamid}&month=${month}&year=${year}`);
    },
    //sửa lịch nghỉ cho team    
    //     payload
    //     {
    //   "employeesOff": ["employeeId", employeeId", "employeeId"]
    // }
    patch: (rotationId, data) => {
        return apiClient.patch(`saturday-rotations/${rotationId}`, data);
    },
    //reset lịch nghỉ của cả team
    deleteAll: (teamid) => {
        return apiClient.delete(`/team/saturday-rotations/${teamid}`);
    },
    //reset lịch nghỉ trong tháng
    deleteByMonth: (teamid, month, year) => {
        return apiClient.delete(`/saturday-rotations/team/${teamid}?month=${month}&year=${year}`);
    },

}