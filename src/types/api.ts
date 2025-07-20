// HTTP method types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Response interfaces
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedAPIResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  success: boolean;
}

// API Error interfaces
export interface APIError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
  code?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Request configuration
export interface APIRequestConfig {
  skipAuth?: boolean;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  headers?: Record<string, string>;
}

// Upload types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Bulk operation types
export interface BulkOperation<T> {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  data: T[];
}

export interface BulkOperationResult<T> {
  successful: T[];
  failed: Array<{
    data: T;
    error: string;
  }>;
  total: number;
  successCount: number;
  failureCount: number;
}

// Search and filter types
export interface SearchResult<T> {
  items: T[];
  query: string;
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
}

export interface FilterCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between';
  value: any;
}

export interface SortCriteria {
  field: string;
  direction: 'asc' | 'desc';
}

// Cache types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key?: string;
  tags?: string[];
}

export interface CachedResponse<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// Webhook types
export interface WebhookPayload<T = any> {
  event: string;
  data: T;
  timestamp: string;
  signature: string;
}

// Real-time types
export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  id: string;
}

// Health check types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  timestamp: string;
  services: Record<string, {
    status: 'up' | 'down';
    responseTime?: number;
  }>;
}

// Rate limiting types
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
} 