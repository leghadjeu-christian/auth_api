import axios from "axios";

const api = axios.create({
  baseURL: "authapi-production-bed6.up.railway.app", // Adjust as needed
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
