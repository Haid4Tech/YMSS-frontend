import axios from "axios";
import { getDefaultStore } from "jotai";
import { logoutTriggerAtom } from "@/jotai/auth/auth";
import { getCookie } from "cookies-next";

const store = getDefaultStore();

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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
  function (error) {
    const errorMessage = error.response?.data?.message || error.message;

    if (error?.response?.status === 401) {
      store.set(logoutTriggerAtom, "Unauthorized");
    } else if (error.response?.status === 403) {
      console.error(`Forbidden: ${errorMessage}`);
    } else {
      console.error("Server Error:", error.response?.data);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
