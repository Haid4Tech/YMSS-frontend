import Menu from "@/components/menu";
import Navbar from "@/components/navbar";
import Image from "next/image";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen">
      {/* LEFT */}
      <div className="scrollbar-width overflow-y-auto w-[14%] md:w-[8%] lg:w-[16%] xl:w-[18%] p-4">
        <Link
          href="/"
          className="flex items-center justify-center lg:justify-start gap-2"
        >
          <Image src="/YMSS_logo-nobg.png" alt="logo" width={32} height={32} />
          <span className="hidden lg:block font-bold">YMSS</span>
        </Link>

        <Menu />
      </div>
      {/* RIGHT */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[88%] flex flex-col">
        <div className="sticky top-0 z-40 bg-white">
          <Navbar />
        </div>
        <div className={"scrollbar-width overflow-scroll"}>{children}</div>
      </div>
    </div>
  );
}
