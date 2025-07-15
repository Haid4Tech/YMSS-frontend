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

interface IMenuBar {
  view?: "admin" | "main";
}

export default function MenuBar({ view }: IMenuBar) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] =
    useState<MenuStatesProp>(menuBarStates);
  const [result] = useAtom(authPersistedAtom);
  const pathName = usePathname();

  const pathResult = isPathMatch(pathName, ["/admin/signin", "/admin/signup"]);

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

    router.push("/admin/signin");

    setTimeout(() => {
      setLoadingStates((prev) => ({
        ...prev,
        isAuthLoading: true,
      }));
    }, 5000);
  };

  return (
    <div className="border-b border-neutral-200 flex flex-row items-center justify-between py-4 px-4 md:px-8 lg:px-12">
      <Image
        src={"/YMSS_logo-nobg.png"}
        alt={"school logo"}
        width={40}
        height={40}
      />

      <div className={"flex flex-row gap-10 items-center"}>
        <div
          className={cn(view === "admin" ? "hidden" : "flex", "flex-row gap-6")}
        >
          {navItem.map((items, index) => (
            <Link
              className="text-base hover:text-purple-800"
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
      </div>
    </div>
  );
}
