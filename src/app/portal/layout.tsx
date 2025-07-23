"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { Button } from "@/components/ui/button";
import {
  authLoadingAtom,
  isAuthenticatedAtom,
  authErrorAtom,
  isLoggingOutAtom,
} from "@/jotai/auth/auth";

interface PortalLayoutProps {
  children: ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const router = useRouter();
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [loading] = useAtom(authLoadingAtom);
  const [authError] = useAtom(authErrorAtom);
  const [isLoggingOut] = useAtom(isLoggingOutAtom);

  // useEffect(() => {
  //   // Handle logout immediately
  //   if (isLoggingOut) {
  //     router.push("/portal/signin");
  //     return;
  //   }
  // }, [isAuthenticated, loading, router, isLoggingOut]);

  // Handle logout state immediately
  if (isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Signing out...</p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an auth error and we're not authenticated
  if (!isAuthenticated && authError !== null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-lg font-semibold">
            Access Denied
          </div>
          <p className="text-muted-foreground">{authError}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => router.push("/portal/signin")}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Sign In
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If authenticated, render the children
  return <>{children}</>;
}
