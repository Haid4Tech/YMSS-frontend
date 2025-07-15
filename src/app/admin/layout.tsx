import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <div>{children}</div>
    </main>
  );
}
