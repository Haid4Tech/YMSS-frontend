import React from "react";

interface SafeRenderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  condition?: boolean;
}

// Simple wrapper for conditional safe rendering
export function SafeRender({ children, fallback = null, condition = true }: SafeRenderProps) {
  if (!condition) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Safe property access with default values
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current !== null && current !== undefined ? current : defaultValue;
}

// Safe text rendering - handles undefined/null values
export function SafeText({ 
  children, 
  fallback = "N/A" 
}: { 
  children: React.ReactNode; 
  fallback?: string 
}) {
  if (children === null || children === undefined || children === "") {
    return <span className="text-muted-foreground italic">{fallback}</span>;
  }
  
  return <>{children}</>;
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-8">
          <p className="text-destructive">Something went wrong. Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
} 