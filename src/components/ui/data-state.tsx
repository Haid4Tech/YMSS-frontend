/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Link from "next/link";
import { Button } from "./button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface DataStateProps {
  loading?: boolean;
  error?: string | null;
  data?: any;
  dataName?: string;
  backUrl?: string;
  backLabel?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function DataState({
  loading = false,
  error = null,
  data = null,
  dataName = "data",
  backUrl = "/portal",
  backLabel = "Go back",
  onRetry,
  children,
}: DataStateProps) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading {dataName}...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Something went wrong</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {error || `Failed to load ${dataName}. Please try again.`}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backLabel}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Not found state
  if (!data) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{dataName} not found</h3>
          <p className="text-muted-foreground">
            The {dataName.toLowerCase()} you&apos;re looking for doesn&apos;t
            exist or has been removed.
          </p>
        </div>
        <Button asChild>
          <Link href={backUrl}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backLabel}
          </Link>
        </Button>
      </div>
    );
  }

  // Success state - render children
  return <>{children}</>;
}

// Utility function for safe property access
export function safeProp<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== null && current !== undefined ? current : defaultValue;
}

// Hook for handling async data fetching with error states
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    retry: fetchData,
  };
}
