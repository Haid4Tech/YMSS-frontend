import { Student } from "../students/student-types";
import { Subject } from "../subject/subject-types";
import { Teacher } from "../teachers/teachers-types";

// Junior Secondary levels have no stream; Senior Secondary levels (SS1-SS3)
// are split into a Science and an Arts stream, e.g. SS1A = SS1 + Science.
export const GRADE_LEVELS = [
  { value: "JSS1", label: "JSS1" },
  { value: "JSS2", label: "JSS2" },
  { value: "JSS3", label: "JSS3" },
  { value: "SS1", label: "SS1" },
  { value: "SS2", label: "SS2" },
  { value: "SS3", label: "SS3" },
] as const;

export const SENIOR_SECONDARY_LEVELS: string[] = ["SS1", "SS2", "SS3"];

export interface Class {
  id: number;
  name: string;
  roomNumber?: string;
  students: Array<Student>;
  subjects: Array<Subject>;

  academicYear?: string;
  // No capacity means the class has no enrollment limit.
  capacity?: number | null;
  description?: string;

  days?: string[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  teacher?: Teacher;

  // Additional fields used in the application
  gradeLevel?: string; // e.g. "JSS1", "SS2"
  // Academic stream ("SCIENCE" | "ARTS" | "GENERAL"), only meaningful for
  // Senior Secondary classes.
  stream?: string | null;
}

export interface ClassResponse {
  limit: number;
  page: number;
  total: number;
  class: Array<Class>;
}
