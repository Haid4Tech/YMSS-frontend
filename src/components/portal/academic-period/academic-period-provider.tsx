"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AcademicPeriod, DEFAULT_PERIOD, isAcademicPeriod, readOverrides, readPeriod, PeriodState, withGlobalPeriod, withPagePeriod,
} from "@/lib/academic-period/state";

const PeriodContext = createContext<{
  state: PeriodState;
  setGlobalPeriod: (period: AcademicPeriod) => void;
  setPagePeriod: (path: string, period: AcademicPeriod | null) => void;
} | null>(null);

export function AcademicPeriodProvider({ userId, children }: { userId: number; children: ReactNode }) {
  const globalKey = `ymss:academic-period:${userId}`;
  const pageKey = `${globalKey}:pages`;
  const [state, setState] = useState<PeriodState>({ globalPeriod: DEFAULT_PERIOD, pages: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let globalPeriod = DEFAULT_PERIOD;
    let pages = {};
    try {
      globalPeriod = readPeriod(localStorage.getItem(globalKey));
      pages = readOverrides(sessionStorage.getItem(pageKey), globalPeriod);
    } catch { /* Storage may be unavailable; keep in-memory preferences. */ }
    setState({ globalPeriod, pages });
    setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.storageArea !== localStorage || (event.key !== globalKey && event.key !== null)) return;
      setState(withGlobalPeriod(readPeriod(event.newValue)));
      try { sessionStorage.removeItem(pageKey); } catch { /* Optional persistence. */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [globalKey, pageKey]);

  const setGlobalPeriod = useCallback((period: AcademicPeriod) => {
    if (!isAcademicPeriod(period)) return;
    setState(withGlobalPeriod(period));
    try {
      localStorage.setItem(globalKey, JSON.stringify(period));
      sessionStorage.removeItem(pageKey);
    } catch { /* Keep the selected period usable without storage. */ }
  }, [globalKey, pageKey]);

  const setPagePeriod = useCallback((path: string, period: AcademicPeriod | null) => {
    if (period !== null && !isAcademicPeriod(period)) return;
    setState((previous) => withPagePeriod(previous, path, period));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(pageKey, JSON.stringify({ globalPeriod: state.globalPeriod, pages: state.pages }));
    } catch { /* Optional persistence. */ }
  }, [ready, pageKey, state]);

  if (!ready) return <p className="p-6 text-muted-foreground">Loading academic period...</p>;

  return <PeriodContext.Provider value={{ state, setGlobalPeriod, setPagePeriod }}>{children}</PeriodContext.Provider>;
}

export function useAcademicPeriod() {
  const context = useContext(PeriodContext);
  const pathname = usePathname();
  if (!context) throw new Error("useAcademicPeriod requires AcademicPeriodProvider");
  const { state, setPagePeriod, setGlobalPeriod } = context;
  const period = state.pages[pathname] ?? state.globalPeriod;
  const setPeriod = useCallback((next: AcademicPeriod) => setPagePeriod(pathname, next), [pathname, setPagePeriod]);
  const resetPeriod = useCallback(() => setPagePeriod(pathname, null), [pathname, setPagePeriod]);
  return {
    ...period,
    globalPeriod: state.globalPeriod,
    isOverridden: !!state.pages[pathname],
    setGlobalPeriod,
    setPeriod,
    resetPeriod,
  };
}
