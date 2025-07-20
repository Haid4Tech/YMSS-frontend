import { useCallback } from 'react';
import { ErrorHandler, AppError, ErrorDisplayOptions } from './ErrorHandler';

/**
 * Hook for error handling with consistent patterns
 */
export function useErrorHandler() {
  const handleError = useCallback((
    error: any, 
    context: string = 'Component',
    options?: ErrorDisplayOptions
  ): AppError => {
    return ErrorHandler.handle(error, context, options);
  }, []);

  const handleAsyncError = useCallback(async <T>(
    promise: Promise<T>,
    context: string,
    options?: ErrorDisplayOptions
  ): Promise<T | null> => {
    return ErrorHandler.withErrorHandling(promise, context, options);
  }, []);

  const handleSuccess = useCallback((message: string, duration?: number) => {
    ErrorHandler.handleSuccess(message, duration);
  }, []);

  const handleInfo = useCallback((message: string, duration?: number) => {
    ErrorHandler.handleInfo(message, duration);
  }, []);

  const handleWarning = useCallback((message: string, duration?: number) => {
    ErrorHandler.handleWarning(message, duration);
  }, []);

  const handleValidationErrors = useCallback((
    errors: Record<string, string[]>,
    context?: string
  ) => {
    ErrorHandler.handleValidationErrors(errors, context);
  }, []);

  return {
    handleError,
    handleAsyncError,
    handleSuccess,
    handleInfo,
    handleWarning,
    handleValidationErrors,
  };
}

/**
 * Hook for retrying operations with error handling
 */
export function useRetryOperation() {
  const retryWithBackoff = useCallback(async <T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context: string = 'Operation'
  ): Promise<T> => {
    return ErrorHandler.withRetry(operation, maxRetries, baseDelay, context);
  }, []);

  return {
    retryWithBackoff,
  };
} 