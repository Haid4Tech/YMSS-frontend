import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getCookie, deleteCookie } from "cookies-next";

// API Response interfaces
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface APIError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

// Request configuration interface
export interface APIRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  timeout?: number;
}

class APIClient {
  private instance: AxiosInstance;
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Add auth token if not skipped
        if (!config.skipAuth) {
          const token = getCookie("token");
          if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
          }
        }

        // Add request timestamp for debugging
        if (process.env.NODE_ENV === "development") {
          config.metadata = { startTime: new Date() };
        }

        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log response time in development
        if (process.env.NODE_ENV === "development" && response.config.metadata) {
          const endTime = new Date();
          const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
          console.log(`API Call: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
        }

        return response;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): APIError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle specific status codes
      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 422:
          console.error("Validation error", data.errors);
          break;
        case 500:
          console.error("Server error");
          break;
      }

      return {
        message: data?.message || data?.error || "An error occurred",
        statusCode: status,
        errors: data?.errors,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: "Network error - please check your connection",
        statusCode: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || "An unexpected error occurred",
        statusCode: 500,
      };
    }
  }

  private handleUnauthorized(): void {
    if (typeof window !== "undefined") {
      deleteCookie("token");
      window.location.href = "/portal/signin";
    }
  }

  // Generic HTTP methods with type safety
  async get<T>(url: string, config?: APIRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T, D = any>(url: string, data?: D, config?: APIRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T, D = any>(url: string, data?: D, config?: APIRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T, D = any>(url: string, data?: D, config?: APIRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: APIRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.instance.defaults.headers.common["Authorization"];
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types for use in other files
export type { APIResponse, PaginatedResponse, APIError, APIRequestConfig }; 