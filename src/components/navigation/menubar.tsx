"use client";

import Image from "next/image";
import Link from "next/link";
import { useAtom } from "jotai";
import { logoutTriggerAtom, authPersistedAtom } from "@/jotai/auth/auth";

export default function MenuBar() {
  const [result] = useAtom(authPersistedAtom);
  const [, logOutTrigger] = useAtom(logoutTriggerAtom);

  return (
    <div className="bg-red-100 border-b border-neutral-200 h-20 flex flex-row items-center justify-between px-12">
      <Image
        src={"/YMSS_logo-nobg.png"}
        alt={"school logo"}
        width={50}
        height={50}
      />
      <div>
        {result === null ? (
          <Link href={"/signin"}>login</Link>
        ) : (
          <div
            className="cursor-pointer"
            onClick={() => logOutTrigger("logout triggered")}
          >
            <p>logout</p>
          </div>
        )}
      </div>
    </div>
  );
}
