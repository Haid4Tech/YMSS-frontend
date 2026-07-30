/*
  Suggested teacher / principal remarks for the report card, grouped by
  performance band. Bands mirror the report sheet's grading scale:
    OUTSTANDING  80 - 100   (A)
    VERY_GOOD    65 - 79.99 (B)
    GOOD         50 - 64.99 (C)
    FAIR         40 - 49.99 (D)
    POOR          0 - 39.99 (F)
*/

export type PerformanceBand =
  | "OUTSTANDING"
  | "VERY_GOOD"
  | "GOOD"
  | "FAIR"
  | "POOR";

export const bandFromAverage = (average?: number | null): PerformanceBand => {
  const value = average ?? 0;
  if (value >= 80) return "OUTSTANDING";
  if (value >= 65) return "VERY_GOOD";
  if (value >= 50) return "GOOD";
  if (value >= 40) return "FAIR";
  return "POOR";
};

export const TEACHER_REMARKS: Record<PerformanceBand, string[]> = {
  OUTSTANDING: [
    "Excellent performance. Keep it up.",
    "An exceptional term. Maintain this standard.",
    "Outstanding effort and excellent academic achievement.",
    "You have worked very hard. Keep shining.",
    "A brilliant performance. Continue aiming higher.",
    "Excellent progress in all areas. Well done.",
    "You are a model student. Keep it up.",
    "Keep up the excellent work and remain focused.",
  ],
  VERY_GOOD: [
    "Very good performance. Keep working hard.",
    "A commendable effort this term.",
    "You have done very well. Keep improving.",
    "Good understanding of your subjects. Keep it up.",
    "A pleasing performance. Aim even higher next term.",
    "Your commitment to learning is commendable.",
    "Continue to put in your best effort.",
    "Well done. Maintain this momentum.",
  ],
  GOOD: [
    "Good performance. There is room for improvement.",
    "A satisfactory performance this term.",
    "Keep working hard and stay focused.",
    "You can do even better with more effort.",
    "A good result. Strive for excellence next term.",
    "Be more consistent in your studies.",
    "Attend to your weaker subjects and improve.",
    "Keep practicing and asking questions.",
  ],
  FAIR: [
    "Fair performance. More dedication is needed.",
    "You have potential. Work harder next term.",
    "Put more effort into your studies.",
    "Avoid distractions and remain focused.",
    "Be more serious with assignments and classwork.",
    "Regular study habits will improve your results.",
    "Participate more actively in class.",
    "Success comes with consistent hard work.",
  ],
  POOR: [
    "Your performance needs significant improvement.",
    "You must work harder next term.",
    "Greater commitment to your studies is required.",
    "Improve your attendance and study habits.",
    "Seek help where necessary and remain focused.",
    "You have the ability to do better.",
    "Be more disciplined and committed.",
    "Hard work and determination will lead to success.",
  ],
};

export const PRINCIPAL_REMARKS: Record<PerformanceBand, string[]> = {
  OUTSTANDING: [
    "Excellent performance. Keep making the school proud.",
    "Outstanding achievement. Congratulations.",
    "Keep up the excellent work.",
    "Your hard work has paid off. Well done.",
    "Continue striving for excellence.",
    "An impressive performance. Keep aiming higher.",
    "You are an excellent ambassador of the school.",
    "Maintain this high standard.",
  ],
  VERY_GOOD: [
    "Very good performance. Keep it up.",
    "Well done. Continue working hard.",
    "A commendable performance this term.",
    "Keep improving and remain focused.",
    "Your efforts are appreciated. Keep it up.",
    "Aim for even greater success next term.",
    "Continue to make us proud.",
    "Keep your determination strong.",
  ],
  GOOD: [
    "Good performance. There is room for improvement.",
    "Keep working harder to achieve better results.",
    "Stay focused and remain disciplined.",
    "You can perform even better next term.",
    "Keep up the good work.",
    "Continue to build on your strengths.",
    "Greater consistency will lead to better results.",
    "Keep striving for excellence.",
  ],
  FAIR: [
    "Fair performance. More effort is required.",
    "You must be more committed to your studies.",
    "Focus on improving your academic performance.",
    "Make better use of your study time.",
    "Be more disciplined and determined.",
    "Work harder to achieve your potential.",
    "Improvement is expected next term.",
    "Stay focused and avoid distractions.",
  ],
  POOR: [
    "Your performance is below expectation.",
    "Much improvement is expected next term.",
    "You need to be more serious with your studies.",
    "Hard work and discipline are essential.",
    "Parents should encourage closer supervision.",
    "Make better use of your time.",
    "Greater effort is required to succeed.",
    "I expect significant improvement next term.",
  ],
};

export const BAND_LABEL: Record<PerformanceBand, string> = {
  OUTSTANDING: "Outstanding Performance",
  VERY_GOOD: "Very Good Performance",
  GOOD: "Good Performance",
  FAIR: "Fair/Average Performance",
  POOR: "Poor Performance",
};

// Score range for each band, matching the report sheet's grading scale.
export const BAND_RANGE: Record<PerformanceBand, string> = {
  OUTSTANDING: "80% - 100%",
  VERY_GOOD: "65% - 79.99%",
  GOOD: "50% - 64.99%",
  FAIR: "40% - 49.99%",
  POOR: "0% - 39.99%",
};

export interface RemarkGroup {
  band: PerformanceBand;
  label: string;
  range: string;
  options: string[];
}

// Remarks split into labelled groups by performance band, with the band that
// matches the student's average listed first so the most relevant suggestions
// surface at the top while search still spans every group.
const groupByBand = (
  source: Record<PerformanceBand, string[]>,
  band: PerformanceBand
): RemarkGroup[] => {
  const order: PerformanceBand[] = [
    band,
    ...(Object.keys(source) as PerformanceBand[]).filter((b) => b !== band),
  ];
  return order.map((b) => ({
    band: b,
    label: BAND_LABEL[b],
    range: BAND_RANGE[b],
    options: source[b],
  }));
};

export const teacherRemarkGroups = (average?: number | null) =>
  groupByBand(TEACHER_REMARKS, bandFromAverage(average));

export const principalRemarkGroups = (average?: number | null) =>
  groupByBand(PRINCIPAL_REMARKS, bandFromAverage(average));

// Pick a natural teacher + principal remark combination for the student's
// average, used to pre-fill the comment fields.
export const suggestRemarks = (average?: number | null) => {
  const band = bandFromAverage(average);
  const pick = (arr: string[]) =>
    arr.length ? arr[Math.floor(Math.random() * arr.length)] : "";
  return {
    band,
    teacher: pick(TEACHER_REMARKS[band]),
    principal: pick(PRINCIPAL_REMARKS[band]),
  };
};
