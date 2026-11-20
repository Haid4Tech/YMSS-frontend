export type AcademicPeriod = {
  academicYear: string;
  term: "FIRST" | "SECOND" | "THIRD";
};

export const DEFAULT_PERIOD: AcademicPeriod = {
  academicYear: "2026/2027",
  term: "FIRST",
};

export function isAcademicPeriod(value: unknown): value is AcademicPeriod {
  if (!value || typeof value !== "object") return false;
  const period = value as AcademicPeriod;
  const match = /^(\d{4})\/(\d{4})$/.exec(period.academicYear);
  return !!match && Number(match[2]) === Number(match[1]) + 1 &&
    ["FIRST", "SECOND", "THIRD"].includes(period.term);
}

export function samePeriod(a: AcademicPeriod, b: AcademicPeriod) {
  return a.academicYear === b.academicYear && a.term === b.term;
}

export function readPeriod(value: string | null): AcademicPeriod {
  try {
    const parsed: unknown = JSON.parse(value ?? "null");
    return isAcademicPeriod(parsed) ? parsed : DEFAULT_PERIOD;
  } catch {
    return DEFAULT_PERIOD;
  }
}

export function readOverrides(value: string | null, globalPeriod: AcademicPeriod): Record<string, AcademicPeriod> {
  try {
    const parsed = JSON.parse(value ?? "null");
    if (!parsed || !isAcademicPeriod(parsed.globalPeriod) ||
        !samePeriod(parsed.globalPeriod, globalPeriod) ||
        !parsed.pages || typeof parsed.pages !== "object") return {};
    return Object.fromEntries(Object.entries(parsed.pages).filter(
      ([path, period]) => path.startsWith("/portal/") && isAcademicPeriod(period)
    )) as Record<string, AcademicPeriod>;
  } catch {
    return {};
  }
}

export interface PeriodState {
  globalPeriod: AcademicPeriod;
  pages: Record<string, AcademicPeriod>;
}

export function withGlobalPeriod(period: AcademicPeriod): PeriodState {
  return { globalPeriod: period, pages: {} };
}

export function withPagePeriod(state: PeriodState, path: string, period: AcademicPeriod | null): PeriodState {
  const pages = { ...state.pages };
  if (period === null || samePeriod(period, state.globalPeriod)) delete pages[path];
  else pages[path] = period;
  return { ...state, pages };
}
