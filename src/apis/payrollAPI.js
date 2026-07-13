import apiClient from "./apiClient";

const PAYROLL_EMAIL_TIMEOUT_MS = Number(import.meta.env.VITE_PAYROLL_EMAIL_TIMEOUT_MS || 120000);
const PAYROLL_EMAIL_JOB_POLL_MS = Number(import.meta.env.VITE_PAYROLL_EMAIL_JOB_POLL_MS || 2000);
const PAYROLL_EMAIL_JOB_DONE = new Set(["COMPLETED", "PARTIAL_SUCCESS", "FAILED"]);

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

export const payrollAPI = {
  getall: (month, year, params = {}) => {
    return apiClient.get("/payrolls", {
      params: { month, year, limit: 1000, ...params },
    });
  },

  getbyme: (params) => {
    return apiClient.get("/payrolls/my-income", { params });
  },

  syncdata: (payload) => {
    return apiClient.post("/payrolls/sync", payload);
  },

  calcalculate: (payload) => {
    return apiClient.post("/payrolls/calculate-batch", payload);
  },

  calculateBatch: (payload) => {
    return apiClient.post("/payrolls/calculate-batch", payload);
  },

  finalize: (payload) => {
    return apiClient.patch("/payrolls/finalize", payload);
  },

  markpaid: (payload) => {
    return apiClient.patch("/payrolls/mark-paid", payload);
  },

  reopen: (id, payload = {}) => {
    return apiClient.patch(`/payrolls/${id}/reopen`, payload);
  },

  sendEmail: (id) => {
    return apiClient.post(`/payrolls/${id}/send-email`, null, {
      timeout: PAYROLL_EMAIL_TIMEOUT_MS,
    });
  },

  sendEmailsBulk: (payload) => {
    return apiClient.post("/payrolls/send-emails", payload, {
      timeout: PAYROLL_EMAIL_TIMEOUT_MS,
    });
  },

  getPayrollEmailJob: (jobId) => {
    return apiClient.get(`/payrolls/email-jobs/${jobId}`);
  },

  pollPayrollEmailJob: async (jobId, options = {}) => {
    const intervalMs = Number(options.intervalMs || PAYROLL_EMAIL_JOB_POLL_MS);

    while (true) {
      const res = await payrollAPI.getPayrollEmailJob(jobId);
      const job = res.data?.data;

      if (typeof options.onProgress === "function") {
        options.onProgress(job);
      }

      if (PAYROLL_EMAIL_JOB_DONE.has(job?.status)) {
        return job;
      }

      await wait(intervalMs);
    }
  },

  deletePeriod: (payload) => {
    return apiClient.delete("/payrolls/period", { data: payload });
  },
};
