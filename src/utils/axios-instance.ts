import axios from "axios";
import { getDefaultStore } from "jotai";
import { authAPI } from "@/jotai/auth/auth";
import { getCookie, deleteCookie } from "cookies-next";

const store = getDefaultStore();
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const token = getCookie("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  async (response) => {
    const { success, message } = response.data;
    if (success && message) {
      console.log("response messsage ", message);
    }
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.message || error.message;

    if (error?.response?.status === 401) {
      store.set(authAPI.logout, "Unauthorized");
      if (typeof window !== "undefined") {
        deleteCookie("token");
        window.location.href = "/portal/signin";
      }
    } else if (error.response?.status === 403) {
      console.error(`Forbidden: ${errorMessage}`);
    } else {
      console.error("Server Error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
