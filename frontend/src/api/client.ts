import axios from "axios";
import { getToken } from "../auth";

const api = axios.create({
  baseURL: "https://authapi-production-bed6.up.railway.app/", // Adjust as needed
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
