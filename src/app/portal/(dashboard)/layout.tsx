"use client";

import { ReactNode, useState } from "react";
import { useAtomValue, useAtom } from "jotai";
import { useRouter } from "next/navigation";

import { userAtom, authErrorAtom, authLoadingAtom } from "@/jotai/auth/auth";
import PortalSidebar from "@/components/portal/portal-sidebar";
import PortalNavbar from "@/components/portal/portal-navbar";
import { Button } from "@/components/ui/button";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const loading = useAtomValue(authLoadingAtom);
  const [authError] = useAtom(authErrorAtom);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <FullScreenCenter>
        <Spinner />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </FullScreenCenter>
    );
  }

  if (authError !== null) {
    return (
      <FullScreenCenter>
        <div className="text-red-500 text-lg font-semibold">
          Authentication Error
        </div>
        <Button onClick={() => router.push("/portal/signin")}>
          Go to Sign In
        </Button>
      </FullScreenCenter>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 dark:bg-black/70 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-background border-r border-border shadow-lg transform transition-transform duration-300 ease-in-out
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        {user && (
          <PortalSidebar user={user} onClose={() => setSidebarOpen(false)} />
        )}
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden w-fit">
        {user && (
          <PortalNavbar
            user={user}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-6 scrollbar-width">
          {children}
        </main>
      </div>
    </div>
  );
}
// --- Supporting Components for cleaner composition ---

const FullScreenCenter = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4 max-w-md mx-auto text-center">
    {children}
  </div>
);

const Spinner = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
);
