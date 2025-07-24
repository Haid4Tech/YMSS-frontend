"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authPersistedAtom } from "@/jotai/auth/auth";
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { Spinner } from "@radix-ui/themes";
import { navItem } from "@/common/data";
import { menuBarStates } from "@/common/states";
import { MenuStatesProp } from "@/common/types";
import { roleRedirectMap } from "@/common/helper";
import { Button } from "../ui/button";
import { Role } from "@/common/enum";
import { isPathMatch } from "@/common/helper";

import { authAPI } from "@/jotai/auth/auth";

interface IMenuBar {
  view?: "admin" | "main";
}

export default function MenuBar({ view }: IMenuBar) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] =
    useState<MenuStatesProp>(menuBarStates);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [result] = useAtom(authPersistedAtom);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathName = usePathname();

  const [, triggerLogout] = useAtom(authAPI.logout);

  const pathResult = isPathMatch(pathName, [
    "/portal/signin",
    "/portal/signup",
  ]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      console.log("🚪 MenuBar: Starting logout...");

      await triggerLogout("User logout from MenuBar");

      console.log("🚪 MenuBar: Logout completed, redirecting...");

      // Immediate redirect after logout
      router.push("/portal/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      router.push("/portal/signin");
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleDashboardRedirect = () => {
    setLoadingStates((prev) => ({
      ...prev,
      portalState: true,
    }));

    const role = result?.user?.role;
    const path = roleRedirectMap[role as Role];

    if (role) {
      router.push(path);
    }

    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        portalState: true,
      }));
    }, 5000);
  };

  const handleAuthRedirect = () => {
    setLoadingStates((prev) => ({
      ...prev,
      isAuthLoading: true,
    }));

    router.push("/portal/signin");

    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        isAuthLoading: true,
      }));
    }, 5000);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="border-b border-neutral-200 flex flex-row items-center justify-between py-4 px-4 md:px-8 lg:px-12">
        <div className="bg-gradient-to-r from-purple-200 to-orange-100 p-1 rounded-lg">
          <Image
            src="/YMSS_logo-nobg.png"
            alt="YMSS Logo"
            width={32}
            height={32}
          />
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-row gap-10 items-center">
          <div
            className={cn(
              view === "admin" ? "hidden" : "flex",
              "flex-row gap-6"
            )}
          >
            {navItem.map((items, index) => (
              <Link
                className="text-sm hover:text-primary transition-colors duration-200"
                href={items.url}
                key={index}
              >
                {items.label}
              </Link>
            ))}
          </div>

          <div>
            {result !== null ? (
              <Button onClick={handleDashboardRedirect}>
                {loadingStates.portalState ? (
                  <div className="flex flex-row gap-2 items-center">
                    Redirecting
                    <Spinner />
                  </div>
                ) : (
                  "Go to Dashboard"
                )}
              </Button>
            ) : (
              <div>
                <Button
                  className={cn(pathResult ? "hidden" : "block")}
                  onClick={handleAuthRedirect}
                >
                  {loadingStates.isAuthLoading ? (
                    <div className="flex flex-row gap-2 items-center">
                      Redirecting
                      <Spinner />
                    </div>
                  ) : (
                    "Portal"
                  )}
                </Button>
              </div>
            )}
          </div>

          {result && (
            <Button
              onClick={handleLogout}
              disabled={logoutLoading}
              variant="outline"
            >
              {logoutLoading ? (
                <div className="flex flex-row gap-2 items-center">
                  Signing out...
                  <Spinner />
                </div>
              ) : (
                "Logout"
              )}
            </Button>
          )}
        </div>

        {/* Mobile Navigation Button */}
        <div className="lg:hidden flex items-center gap-4">
          {/* Mobile Portal Button */}
          <div>
            {result !== null ? (
              <Button onClick={handleDashboardRedirect} size="sm">
                {loadingStates.portalState ? (
                  <div className="flex flex-row gap-2 items-center">
                    <Spinner size="1" />
                  </div>
                ) : (
                  "Dashboard"
                )}
              </Button>
            ) : (
              <div>
                <Button
                  className={cn(pathResult ? "hidden" : "block")}
                  onClick={handleAuthRedirect}
                  size="sm"
                >
                  {loadingStates.isAuthLoading ? (
                    <div className="flex flex-row gap-2 items-center">
                      <Spinner size="1" />
                    </div>
                  ) : (
                    "Portal"
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="flex flex-col justify-center items-center w-6 h-6 focus:outline-none"
            aria-label="Toggle mobile menu"
          >
            <span
              className={cn(
                "block w-5 h-0.5 bg-gray-700 transition-all duration-300",
                isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
              )}
            ></span>
            <span
              className={cn(
                "block w-5 h-0.5 bg-gray-700 transition-all duration-300 mt-1",
                isMobileMenuOpen ? "opacity-0" : ""
              )}
            ></span>
            <span
              className={cn(
                "block w-5 h-0.5 bg-gray-700 transition-all duration-300 mt-1",
                isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              )}
            ></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed top-0 right-0 h-full w-80 max-w-[80vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <Image
                src={"/YMSS_logo-nobg.png"}
                alt={"school logo"}
                width={32}
                height={32}
              />
              <span className="font-semibold text-gray-800">YMSS</span>
            </div>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
              aria-label="Close mobile menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 py-6">
            <div className={cn(view === "admin" ? "hidden" : "block")}>
              {navItem.map((items, index) => (
                <Link
                  className="block px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-800 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                  href={items.url}
                  key={index}
                  onClick={closeMobileMenu}
                >
                  {items.label}
                </Link>
              ))}
            </div>

            {/* Mobile Logout Button */}
            {result && (
              <div className="px-6 py-4 border-t border-gray-200 mt-4">
                <Button
                  onClick={handleLogout}
                  disabled={logoutLoading}
                  variant="outline"
                  className="w-full"
                >
                  {logoutLoading ? (
                    <div className="flex flex-row gap-2 items-center">
                      Signing out...
                      <Spinner size="1" />
                    </div>
                  ) : (
                    "Logout"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
