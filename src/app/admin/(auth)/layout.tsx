import { ReactNode } from "react";
import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <MenuBar view={"admin"} />
      <div className={"grid grid-cols-1 md:grid-cols-2"}>
        <div className="p-4">
          <Image
            className="hidden md:block w-full h-full object-cover object-center rounded-xl"
            src={"/kids_toys.jpg"}
            alt={"contemp art"}
            width={400}
            height={400}
          />
        </div>
        <div className="h-full">{children}</div>
      </div>
      <Footer />
    </main>
  );
}
