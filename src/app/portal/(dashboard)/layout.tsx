"use client";

import { ReactNode, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  userAtom,
  isAuthenticatedAtom,
  authLoadingAtom,
} from "@/jotai/auth/auth";
import PortalSidebar from "@/components/portal/portal-sidebar";
import PortalNavbar from "@/components/portal/portal-navbar";
import { deleteCookie } from "cookies-next";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const router = useRouter();
  const [user] = useAtom(userAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [loading] = useAtom(authLoadingAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or no user
  if (!isAuthenticated || !user) {
    deleteCookie("token");

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-lg font-semibold">
            Authentication Error
          </div>

          <Button
            onClick={() => router.push("/portal/signin")}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 dark:bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-background border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <PortalSidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-fit">
        <PortalNavbar
          user={user}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-width">
          {children}
        </main>
      </div>
    </div>
  );
}
