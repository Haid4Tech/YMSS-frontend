"use client";

import { useAtom } from "jotai";
import { Role } from "@/common/enum";
import { AuthSession } from "@/jotai/auth/auth-types";
import { authPersistedAtom } from "@/jotai/auth/auth";

import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: [Role.ADMIN, Role.TEACHER],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: [Role.ADMIN, Role.TEACHER],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: [Role.ADMIN, Role.TEACHER],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: [Role.ADMIN],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: [Role.ADMIN, Role.TEACHER],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: [Role.ADMIN, Role.TEACHER],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: [...Object.values(Role)],
      },
      // {
      //   icon: "/assignment.png",
      //   label: "Assignments",
      //   href: "/list/assignments",
      //   visible: [...Object.values(Role)],
      // },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: [...Object.values(Role)],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: [...Object.values(Role)],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: [...Object.values(Role)],
      },
    ],
  },
];

const Menu = () => {
  const [auth] = useAtom(authPersistedAtom) as AuthSession[];
  const role = auth?.user?.role;
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-gray-400 font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;
