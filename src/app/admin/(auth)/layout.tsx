import { ReactNode } from "react";
import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <MenuBar view={"admin"} />
      <div>{children}</div>
      <Footer />
    </main>
  );
}
