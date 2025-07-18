"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { UserType } from "@/jotai/auth/auth-types";
import { authAPI } from "@/jotai/auth/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  MessageCircleMore,
  Menu,
  LogOut,
  User,
  Settings,
} from "lucide-react";

interface PortalNavbarProps {
  user: UserType;
  onMenuClick: () => void;
}

export default function PortalNavbar({ user, onMenuClick }: PortalNavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const [, triggerLogout] = useAtom(authAPI.logout);

  const dropDownItems = [
    {
      title: "Profile",
      Icon: User,
      action: () => router.push("/portal/profile"),
    },
    {
      title: "Settings",
      Icon: Settings,
      action: () => router.push("/portal/settings"),
    },
  ];

  const handleLogout = async () => {
    try {
      await triggerLogout("User logout");
      router.push("/portal/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      router.push("/portal/signin");
    }
  };

  return (
    <header className="bg-white border-b border-border px-6 py-4 h-18">
      <div className="flex flex-row items-center justify-between">
        {/* Left side - Menu button for mobile */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu />
          </Button>

          {/* Breadcrumb or page title can go here */}
          <div className="hidden md:block">
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome, {user.name}
            </h1>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex flex-row items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost">
            <Bell />
            {/* <BellRing /> */}
          </Button>

          {/* Messages */}
          <Button variant="ghost">
            <MessageCircleMore />
          </Button>

          {/* User Menu */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger className="bg-primary/20 rounded-lg" asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 bg-primary/10 rounded-full"
              >
                <div className="flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dropDownItems.map(({ title, action, Icon }, index) => (
                <DropdownMenuItem
                  className={"cursor-pointer"}
                  key={index}
                  onClick={action}
                >
                  <Icon />
                  {title}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={"cursor-pointer"}
                onClick={handleLogout}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
