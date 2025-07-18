import { Student } from "../students/student-types";

export interface AcademicRecord {
  id: number;
  studentId: number;
  year: number;
  term: "FIRST" | "SECOND" | "THIRD";
  summary: string;
  student: Student;
}
