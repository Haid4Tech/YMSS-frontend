// Error message constants
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your internet connection',
  UNAUTHORIZED: 'Authentication required. Please sign in again.',
  FORBIDDEN: 'Access denied. You do not have permission for this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Our team has been notified.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

// Error codes mapping
export const ERROR_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMIT',
  500: 'INTERNAL_SERVER_ERROR',
  502: 'BAD_GATEWAY',
  503: 'SERVICE_UNAVAILABLE',
  504: 'GATEWAY_TIMEOUT',
} as const;

// Toast duration constants
export const TOAST_DURATIONS = {
  SUCCESS: 3000,
  INFO: 4000,
  WARNING: 4000,
  ERROR: 5000,
  VALIDATION: 7000,
} as const;

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Error categories for analytics/monitoring
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  BUSINESS_LOGIC: 'business_logic',
  SYSTEM: 'system',
  USER_INPUT: 'user_input',
} as const;

// Default error configuration
export const DEFAULT_ERROR_CONFIG = {
  showToast: true,
  logToConsole: process.env.NODE_ENV === 'development',
  logToService: process.env.NODE_ENV === 'production',
  throwError: false,
  duration: TOAST_DURATIONS.ERROR,
} as const; 