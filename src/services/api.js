import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("jwt_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
};

export const expenseAPI = {
  getAll:  (params) => api.get("/expenses", { params }),
  create:  (data)   => api.post("/expenses", data),
  update:  (id, data) => api.put(`/expenses/${id}`, data),
  delete:  (id)     => api.delete(`/expenses/${id}`),
};

export const incomeAPI = {
  getAll:  ()         => api.get("/income"),
  create:  (data)     => api.post("/income", data),
  update:  (id, data) => api.put(`/income/${id}`, data),
  delete:  (id)       => api.delete(`/income/${id}`),
};

export const budgetAPI = {
  get:  ()     => api.get("/budget"),
  save: (data) => api.post("/budget", data),
};

export const reportAPI = {
  monthly: (year, month) =>
    api.get("/reports/monthly", { params: { year, month } }),
  summary: () => api.get("/reports/summary"),
};

export default api;