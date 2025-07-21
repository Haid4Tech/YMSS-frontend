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

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/health',
  '/public'
];

// Check if a route is public
const isPublicRoute = (url: string): boolean => {
  return PUBLIC_ROUTES.some(route => url.includes(route));
};

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only add auth header for protected routes
    if (!isPublicRoute(config.url || '')) {
      const token = getCookie("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  async (response) => {
    const { success, message } = response.data;
    if (success && message) {
      console.log("API response message:", message);
    }
    return response;
  },
  async (error) => {
    const errorMessage = error.response?.data?.message || error.message;
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized - clear auth state and redirect to login
      console.log("401 Unauthorized - clearing auth state");
      
      // Clear auth state
      store.set(authAPI.logout, "Session expired");
      deleteCookie("token");
      
      // Only redirect if we're not already on a public route
      if (typeof window !== "undefined" && !window.location.pathname.includes('/portal/signin')) {
        window.location.href = '/portal/signin';
      }
    } else if (status === 403) {
      console.error(`403 Forbidden: ${errorMessage}`);
      // Don't auto-logout on 403, might be permission issue
    } else if (status >= 500) {
      console.error("Server Error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
