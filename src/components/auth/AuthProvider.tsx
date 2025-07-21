"use client";

import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import {
  autoLoginAtom,
  authLoadingAtom,
  isAuthenticatedAtom,
} from "@/jotai/auth/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [, triggerAutoLogin] = useAtom(autoLoginAtom);
  const [loading] = useAtom(authLoadingAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await triggerAutoLogin();
      } catch (error) {
        console.log("❌ Authentication initialization failed:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    // Only initialize once
    if (!isInitialized) {
      initializeAuth();
    }
  }, [triggerAutoLogin, isInitialized]);

  // Show loading state during initial auth check
  if (!isInitialized || (loading && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground text-sm">Initializing app...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
