// Core error handling
export * from './ErrorHandler';
export * from './constants';
export * from './hooks';

// Convenience exports for common operations
export { ErrorHandler as default } from './ErrorHandler';

// Re-export commonly used functions for easier imports
import { ErrorHandler } from './ErrorHandler';

export const handleError = ErrorHandler.handle;
export const handleSuccess = ErrorHandler.handleSuccess;
export const handleInfo = ErrorHandler.handleInfo;
export const handleWarning = ErrorHandler.handleWarning;
export const handleValidationErrors = ErrorHandler.handleValidationErrors;
export const withErrorHandling = ErrorHandler.withErrorHandling;
export const withRetry = ErrorHandler.withRetry;

// Type guards and utilities
export function isAPIError(obj: any): obj is import('./ErrorHandler').AppError {
  return obj && typeof obj === 'object' && 'message' in obj && 'statusCode' in obj;
}

export function getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return fallback;
} 