import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // verifyEmail: async (email, otp) => {
  //   const response = await api.post("/auth/verify-email", { email, otp });
  //   return response.data;
  // },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
  updateMe: async (payload) => {
    const response = await api.put("/auth/me", payload);
    return response.data;
  },

  // Notification methods
  savePushToken: async (pushToken) => {
    const response = await api.post("/notifications/push-token", { pushToken });
    return response.data;
  },

  removePushToken: async () => {
    const response = await api.delete("/notifications/push-token");
    return response.data;
  },

  getNotificationStatus: async () => {
    const response = await api.get("/notifications/status");
    return response.data;
  },

  sendTestNotification: async () => {
    const response = await api.post("/notifications/test");
    return response.data;
  },
};

// Transaction API calls
export const transactionAPI = {
  getTransactions: async (params = {}) => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  createTransaction: async (transaction) => {
    const response = await api.post("/transactions", transaction);
    return response.data;
  },

  updateTransaction: async (id, transaction) => {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getSummary: async (params = {}) => {
    const response = await api.get("/transactions/summary", { params });
    return response.data;
  },
};

export const familyAPI = {
  list: async () => {
    const response = await api.get("/family-members");
    return response.data;
  },
  add: async (payload) => {
    const response = await api.post("/family-members", payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`/family-members/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/family-members/${id}`);
    return response.data;
  },
};

export default api;
