"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import {
  userAtom,
  authLoadingAtom,
  autoLoginAtom,
  isAuthenticatedAtom,
  authErrorAtom,
} from "@/jotai/auth/auth";

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [loading] = useAtom(authLoadingAtom);
  const [authError] = useAtom(authErrorAtom);
  const [, triggerAutoLogin] = useAtom(autoLoginAtom);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await triggerAutoLogin();
      } catch (error) {
        console.error("Auto-login failed:", error);
        router.push("/portal/signin");
      }
    };

    // Only try auto-login if we don't have a user yet
    if (!user && !loading) {
      initializeAuth();
    }
  }, [user, loading, triggerAutoLogin, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error
  if (authError && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-lg font-semibold">
            Authentication Error
          </div>
          <p className="text-muted-foreground">{authError}</p>
          <button
            onClick={() => router.push("/portal/signin")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}
