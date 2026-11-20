import axiosInstance from "@/utils/axios-instance";

export const PROMOTION_LEVELS = ["JSS1", "JSS2", "JSS3", "SS1", "SS2", "SS3"];
export type PromotionOutcome = "PROMOTE" | "REPEAT" | "GRADUATE" | "WITHDRAW";
export interface PromotionSubject { id: number; name: string; isElective: boolean; }
export interface PromotionClass { id: number; name: string; gradeLevel: string | null; stream: string | null; academicYear: string | null; capacity: number | null; subjects: PromotionSubject[]; }
export interface PromotionStudent {
  id: number; classId: number | null; admissionNumber: string | null; currentAcademicYear: string | null; schoolStatus: string;
  user: { firstname: string; lastname: string | null };
  promotionDecisions: { id: number; outcome: PromotionOutcome; destinationClass: { name: string } | null; appliedAt: string; appliedBy: { firstname: string; lastname: string | null } }[];
}
export interface PromotionRoster { sourceClass: PromotionClass; destinationClasses: PromotionClass[]; students: PromotionStudent[]; }
export interface PromotionDecision { studentId: number; outcome: PromotionOutcome; destinationClassId: number | null; subjectIds: number[]; notes: string; }
export interface PromotionBatch { sourceClassId: number; sourceAcademicYear: string; destinationAcademicYear: string; decisions: PromotionDecision[]; }
export const promotionsAPI = {
  classes: async () => (await axiosInstance.get<PromotionClass[]>("/classes")).data,
  roster: async (params: Omit<PromotionBatch, "decisions">, signal?: AbortSignal) => (await axiosInstance.get<PromotionRoster>("/promotions/roster", { params, signal })).data,
  review: async (batch: PromotionBatch) => (await axiosInstance.post<{ total: number }>("/promotions/review", batch)).data,
  apply: async (batch: PromotionBatch) => (await axiosInstance.post<{ processed: number }>("/promotions/apply", batch)).data,
};
