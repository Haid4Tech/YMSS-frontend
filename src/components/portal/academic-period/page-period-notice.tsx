"use client";

import { ReactNode } from "react";
import { useAcademicPeriod } from "./academic-period-provider";
import { Button } from "@/components/ui/button";

export function PagePeriodNotice() {
  const { academicYear, term, isOverridden, resetPeriod } = useAcademicPeriod();
  if (!isOverridden) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm print:hidden">
      <span>This page: {academicYear} · {term.toLowerCase()} term (this tab session)</span>
      <Button variant="link" size="sm" onClick={resetPeriod}>Use global period</Button>
    </div>
  );
}

export function AcademicPeriodPage({ children }: { children: ReactNode }) {
  return <><PagePeriodNotice />{children}</>;
}
