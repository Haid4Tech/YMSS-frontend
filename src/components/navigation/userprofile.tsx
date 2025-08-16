"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import { authAPI } from "@/jotai/auth/auth";
import { toast } from "sonner";
import { extractErrorMessage } from "@/utils/helpers";

const UserProfile = () => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [, triggerLogout] = useAtom(authAPI.logout);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await triggerLogout("User logout from UserProfile");
      toast.success("Logged out successfully!");

      // Immediate redirect after logout
      router.push("/portal/signin");
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Logout error:", errorMessage);
      toast.error("Logout failed, but redirecting anyway");
      // Force redirect even if logout fails
      router.push("/portal/signin");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex flex-row gap-1 h-3">
          <div className="flex flex-col h-full">
            <span className="text-xs leading-3 font-medium">John Doe</span>
            <span className="text-[10px] text-gray-500 text-right">Admin</span>
          </div>
          <Image
            src="/avatar.png"
            alt=""
            width={36}
            height={36}
            className="rounded-full h-full"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-5">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleLogout}
          disabled={logoutLoading}
        >
          <p className="text-xs font-semibold">
            {logoutLoading ? "Logging out..." : "Log Out"}
          </p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
