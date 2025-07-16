"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserType } from "@/jotai/auth/auth-types";
import { cn } from "@/lib/utils";

interface PortalSidebarProps {
  user: UserType;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: string;
  roles: string[];
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/portal/dashboard",
    icon: "/home.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Students",
    href: "/portal/students",
    icon: "/student.png",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    name: "Teachers",
    href: "/portal/teachers",
    icon: "/teacher.png",
    roles: ["ADMIN"],
  },
  {
    name: "Parents",
    href: "/portal/parents",
    icon: "/parent.png",
    roles: ["ADMIN"],
  },
  {
    name: "Classes",
    href: "/portal/classes",
    icon: "/class.png",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    name: "Subjects",
    href: "/portal/subjects",
    icon: "/subject.png",
    roles: ["ADMIN", "TEACHER"],
  },
  {
    name: "Exams",
    href: "/portal/exams",
    icon: "/exam.png",
    roles: ["ADMIN", "TEACHER", "STUDENT"],
  },
  {
    name: "Results",
    href: "/portal/results",
    icon: "/result.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Attendance",
    href: "/portal/attendance",
    icon: "/attendance.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Announcements",
    href: "/portal/announcements",
    icon: "/announcement.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Events",
    href: "/portal/events",
    icon: "/calendar.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Messages",
    href: "/portal/messages",
    icon: "/message.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Academic Records",
    href: "/portal/records",
    icon: "/file.svg",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Profile",
    href: "/portal/profile",
    icon: "/profile.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
  {
    name: "Settings",
    href: "/portal/settings",
    icon: "/setting.png",
    roles: ["ADMIN", "TEACHER", "STUDENT", "PARENT"],
  },
];

export default function PortalSidebar({ user, onClose }: PortalSidebarProps) {
  const pathname = usePathname();

  const filteredNavItems = navigationItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-border h-18">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/YMSS_logo-nobg.png"
            alt="YMSS Logo"
            width={32}
            height={32}
          />
          <span className="font-bold text-lg">YMSS Portal</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-width">
        <div className="p-4 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={18}
                height={18}
                className={cn(
                  "opacity-70",
                  pathname === item.href &&
                    "brightness-0 invert group-hover:brightness-100 group-hover:opacity-100"
                )}
              />
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border">
        <div className="space-y-2">
          <Link
            href="/portal/help"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
