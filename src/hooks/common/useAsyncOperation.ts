import React, { useState, useCallback, useEffect } from 'react';

// Common async operation state
export interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Async operation hook for mutations
export function useAsyncOperation<T, Args extends any[]>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    operation: (...args: Args) => Promise<T>,
    ...args: Args
  ): Promise<T | null> => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await operation(...args);
      setState({
        data: result,
        loading: false,
        error: null,
      });
      return result;
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'An error occurred',
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for boolean async operations (like delete, void returns)
export function useBooleanAsyncOperation<Args extends any[]>() {
  const [state, setState] = useState<AsyncOperationState<boolean>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (
    operation: (...args: Args) => Promise<void>,
    ...args: Args
  ): Promise<boolean> => {
    setState({ data: null, loading: true, error: null });
    
    try {
      await operation(...args);
      setState({
        data: true,
        loading: false,
        error: null,
      });
      return true;
    } catch (error: any) {
      setState({
        data: false,
        loading: false,
        error: error.message || 'An error occurred',
      });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Hook for data fetching with automatic execution
export function useAsyncData<T, Args extends any[]>(
  operation: (...args: Args) => Promise<T>,
  args: Args,
  options?: {
    immediate?: boolean;
    dependencies?: any[];
  }
) {
  const { immediate = true, dependencies = [] } = options || {};
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const fetch = useCallback(async (): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await operation(...args);
      setState({
        data: result,
        loading: false,
        error: null,
      });
      return result;
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'An error occurred',
      });
      return null;
    }
  }, [operation, ...args]);

  const refresh = useCallback(() => {
    return fetch();
  }, [fetch]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      fetch();
    }
  }, [fetch, immediate, ...dependencies]);

  return {
    ...state,
    fetch,
    refresh,
  };
} 