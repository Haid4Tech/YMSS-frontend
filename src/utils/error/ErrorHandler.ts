import { toast } from "sonner";
import { ERROR_MESSAGES, ERROR_CODES, TOAST_DURATIONS, DEFAULT_ERROR_CONFIG } from './constants';

export interface AppError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  stack?: string;
  category?: string;
  severity?: string;
  code?: string;
}

export interface ErrorDisplayOptions {
  showToast?: boolean;
  toastDuration?: number;
  logToConsole?: boolean;
  logToService?: boolean;
  throwError?: boolean;
  category?: string;
  severity?: string;
}

/**
 * Enhanced error handler with multiple display options and categorization
 */
export class ErrorHandler {
  /**
   * Handle errors with various display and logging options
   */
  static handle(
    error: any,
    context: string = 'Application',
    options: ErrorDisplayOptions = {}
  ): AppError {
    const config = { ...DEFAULT_ERROR_CONFIG, ...options };
    const appError = this.normalizeError(error, context, config);

    // Log to console in development or when explicitly requested
    if (config.logToConsole) {
      this.logError(appError, context);
    }

    // Log to service in production
    if (config.logToService) {
      this.logToService(appError, context);
    }

    // Show toast notification
    if (config.showToast) {
      this.showErrorToast(appError, config.toastDuration || TOAST_DURATIONS.ERROR);
    }

    // Re-throw if requested
    if (config.throwError) {
      throw appError;
    }

    return appError;
  }

  /**
   * Normalize different error types into consistent AppError format
   */
  private static normalizeError(
    error: any, 
    context: string, 
    options: ErrorDisplayOptions
  ): AppError {
    // If it's already our AppError format
    if (error && typeof error === 'object' && 'message' in error) {
      return {
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
        statusCode: error.statusCode || error.status,
        errors: error.errors || error.validationErrors,
        stack: error.stack,
        category: options.category || this.categorizeError(error),
        severity: options.severity || this.determineSeverity(error),
        code: error.code || this.getErrorCode(error.statusCode),
      };
    }

    // If it's a string
    if (typeof error === 'string') {
      return {
        message: error,
        category: options.category || 'user_input',
        severity: options.severity || 'low',
      };
    }

    // If it's a network/fetch error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        statusCode: 0,
        category: 'network',
        severity: 'medium',
        code: 'NETWORK_ERROR',
      };
    }

    // Default fallback
    return {
      message: `${context}: ${ERROR_MESSAGES.UNKNOWN_ERROR}`,
      statusCode: 500,
      category: 'system',
      severity: 'high',
      code: 'UNKNOWN_ERROR',
    };
  }

  /**
   * Categorize error based on status code and type
   */
  private static categorizeError(error: any): string {
    const statusCode = error.statusCode || error.status;
    
    switch (statusCode) {
      case 401:
        return 'authentication';
      case 403:
        return 'authorization';
      case 422:
      case 400:
        return 'validation';
      case 404:
        return 'user_input';
      case 429:
        return 'system';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'system';
      default:
        return 'business_logic';
    }
  }

  /**
   * Determine error severity based on status code
   */
  private static determineSeverity(error: any): string {
    const statusCode = error.statusCode || error.status;
    
    if (statusCode >= 500) return 'critical';
    if (statusCode >= 400) return 'medium';
    return 'low';
  }

  /**
   * Get error code from status code
   */
  private static getErrorCode(statusCode?: number): string | undefined {
    if (!statusCode) return undefined;
    return ERROR_CODES[statusCode as keyof typeof ERROR_CODES];
  }

  /**
   * Show appropriate toast based on error type
   */
  private static showErrorToast(error: AppError, duration: number): void {
    const { message, statusCode } = error;

    // Customize toast based on status code
    switch (statusCode) {
      case 400:
        toast.error(`Invalid Request: ${message}`, { duration });
        break;
      case 401:
        toast.error(ERROR_MESSAGES.UNAUTHORIZED, { duration });
        break;
      case 403:
        toast.error(ERROR_MESSAGES.FORBIDDEN, { duration });
        break;
      case 404:
        toast.error(`${ERROR_MESSAGES.NOT_FOUND}: ${message}`, { duration });
        break;
      case 422:
        toast.error(`${ERROR_MESSAGES.VALIDATION_ERROR}: ${message}`, { duration: TOAST_DURATIONS.VALIDATION });
        break;
      case 429:
        toast.error(ERROR_MESSAGES.RATE_LIMIT, { duration });
        break;
      case 500:
        toast.error(ERROR_MESSAGES.SERVER_ERROR, { duration });
        break;
      case 0:
        toast.error(ERROR_MESSAGES.NETWORK_ERROR, { duration });
        break;
      default:
        toast.error(message, { duration });
    }
  }

  /**
   * Log error to console with formatting
   */
  private static logError(error: AppError, context: string): void {
    console.group(`🚨 Error in ${context}`);
    console.error('Message:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Category:', error.category);
    console.error('Severity:', error.severity);
    if (error.errors) {
      console.error('Validation Errors:', error.errors);
    }
    if (error.stack) {
      console.error('Stack Trace:', error.stack);
    }
    console.groupEnd();
  }

  /**
   * Log error to external service (placeholder for analytics)
   */
  private static logToService(error: AppError, context: string): void {
    // In a real application, you would send this to an error tracking service
    // like Sentry, LogRocket, Bugsnag, etc.
    const errorData = {
      message: error.message,
      statusCode: error.statusCode,
      category: error.category,
      severity: error.severity,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Example: Send to analytics service
    // analytics.track('error', errorData);
    console.log('Error logged to service:', errorData);
  }

  /**
   * Handle validation errors specifically
   */
  static handleValidationErrors(
    errors: Record<string, string[]>,
    context: string = 'Validation'
  ): void {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ');

    toast.error(`${context} failed: ${errorMessages}`, { 
      duration: TOAST_DURATIONS.VALIDATION 
    });
  }

  /**
   * Handle success messages
   */
  static handleSuccess(
    message: string,
    duration: number = TOAST_DURATIONS.SUCCESS
  ): void {
    toast.success(message, { duration });
  }

  /**
   * Handle info messages
   */
  static handleInfo(
    message: string,
    duration: number = TOAST_DURATIONS.INFO
  ): void {
    toast.info(message, { duration });
  }

  /**
   * Handle warning messages
   */
  static handleWarning(
    message: string,
    duration: number = TOAST_DURATIONS.WARNING
  ): void {
    toast.warning(message, { duration });
  }

  /**
   * Create a promise wrapper that automatically handles errors
   */
  static async withErrorHandling<T>(
    promise: Promise<T>,
    context: string,
    options?: ErrorDisplayOptions
  ): Promise<T | null> {
    try {
      const result = await promise;
      return result;
    } catch (error) {
      this.handle(error, context, options);
      return null;
    }
  }

  /**
   * Retry wrapper with exponential backoff
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    context: string = 'Operation'
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`${context} failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
} 