"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { cn } from "@/lib/utils";
import { logoutTriggerAtom, authPersistedAtom } from "@/jotai/auth/auth";
import { Spinner } from "@radix-ui/themes";
import { navItem } from "@/common/data";
import { menuBarStates } from "@/common/states";
import { MenuStatesProp } from "@/common/types";
import { Button } from "../ui/button";
import { roleRedirectMap } from "@/common/helper";
import { Role } from "@/common/enum";

interface IMenuBar {
  view?: "admin" | "main";
}

export default function MenuBar({ view }: IMenuBar) {
  const router = useRouter();
  const [loadingStates, setLoadingStates] =
    useState<MenuStatesProp>(menuBarStates);
  const [result] = useAtom(authPersistedAtom);
  const [, logOutTrigger] = useAtom(logoutTriggerAtom);

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

  const handleLogout = async () => {
    setLoadingStates((prev) => ({
      ...prev,
      logoutState: true,
    }));

    try {
      await logOutTrigger("logout triggered");
    } catch (error) {
      console.log("Error logging out user");
      throw error;
    } finally {
      setLoadingStates((prev) => ({
        ...prev,
        logoutState: false,
      }));
    }
  };

  return (
    <div className="border-b border-neutral-200 h-24 flex flex-row items-center justify-between px-4 md:px-8 lg:px-12">
      <Image
        src={"/YMSS_logo-nobg.png"}
        alt={"school logo"}
        width={50}
        height={50}
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
            <Button onClick={handleLogout}>
              {loadingStates.logoutState ? (
                <div className="flex flex-row gap-2 items-center">
                  <Spinner />
                </div>
              ) : (
                "Go to Dashboard"
              )}
            </Button>
          ) : (
            <Button onClick={handleDashboardRedirect}>
              {loadingStates.portalState ? (
                <div className="flex flex-row gap-2 items-center">
                  Redirecting
                  <Spinner />
                </div>
              ) : (
                "Portal"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
