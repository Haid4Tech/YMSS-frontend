import type { PromotionClass, PromotionOutcome } from "@/jotai/promotions/promotions";

const LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];

type ClassSection = Pick<PromotionClass, "id" | "name" | "gradeLevel">;

export function promotionDestinations<T extends ClassSection>(
  source: Pick<ClassSection, "gradeLevel">,
  candidates: T[],
  outcome: PromotionOutcome
): T[] {
  if (outcome === "GRADUATE" || outcome === "WITHDRAW") return [];
  const sourceIndex = LEVELS.indexOf(source.gradeLevel ?? "");
  if (sourceIndex < 0) return [];
  return candidates.filter(candidate => {
    const destinationIndex = LEVELS.indexOf(candidate.gradeLevel ?? "");
    return outcome === "REPEAT" ? destinationIndex === sourceIndex : destinationIndex > sourceIndex;
  }).sort((a, b) => a.id - b.id);
}

function sectionLetter(classData: ClassSection): string | null {
  const name = classData.name.replace(/\s+/g, "").toUpperCase();
  const match = /^(JSS[1-3]|SS[1-3])([A-Z]?)$/.exec(name);
  return match && match[1] === classData.gradeLevel ? match[2] : null;
}

export function defaultPromotionDestination<T extends ClassSection>(
  source: ClassSection,
  candidates: T[],
  outcome: PromotionOutcome
): T | null {
  if (outcome === "GRADUATE" || outcome === "WITHDRAW") return null;
  const index = LEVELS.indexOf(source.gradeLevel ?? "");
  const postfix = sectionLetter(source);
  if (index < 0 || postfix === null) return null;
  const nextLevel = outcome === "REPEAT" ? source.gradeLevel : LEVELS[index + 1];
  if (!nextLevel) return null;

  const matching = promotionDestinations(source, candidates, outcome).filter(candidate =>
    candidate.gradeLevel === nextLevel && sectionLetter(candidate) === postfix
  );
  // Repeaters keep their existing class when that class is available.
  if (outcome === "REPEAT") {
    const current = matching.find(candidate => candidate.id === source.id);
    if (current) return current;
  }
  // Duplicate section names need an explicit choice rather than array ordering.
  return matching.length === 1 ? matching[0] : null;
}
