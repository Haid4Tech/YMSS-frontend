import { ReactNode } from "react";
import MenuBar from "@/components/navigation/menubar";
import Footer from "@/components/navigation/footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <MenuBar view="main" />
      <div>{children}</div>
      <Footer />
    </main>
  );
}
