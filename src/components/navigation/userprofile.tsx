"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAtom } from "jotai";
import { logoutTriggerAtom } from "@/jotai/auth/auth";

const UserProfile = () => {
  const [_, logOutTrigger] = useAtom(logoutTriggerAtom);

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
          onClick={() => logOutTrigger()}
        >
          <p className={"text-xs font-semibold"}>Log Out</p>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
