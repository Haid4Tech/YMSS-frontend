import { Exam } from "../exams/exams-type";
import { Student } from "../students/student-types";
import { Class } from "../class/class-type";
import { Subject } from "../subject/subject-types";

export interface Grade {
  id: number;
  studentId: number;
  examId?: number; // Made optional for comprehensive results
  subjectId: number;
  classId: number;
  academicYear: string;
  term: "FIRST" | "SECOND" | "THIRD";

  // Comprehensive grading fields
  ca1?: number; // First Continuous Assessment
  ca2?: number; // Second Continuous Assessment
  caTotal?: number; // Total of CA1 + CA2
  examScore?: number; // Exam score
  totalScore?: number; // Total of CA + Exam
  ltc?: number; // Long Term Continuous Assessment
  overallScore?: number; // Overall score (total + ltc) / 2
  classAverage?: number; // Class average for this subject
  grade?: string; // Letter grade (A, B, C, D, F)
  subjectPosition?: number; // Position in class for this subject
  remark?: string; // Teacher's remark

  // Legacy fields for backward compatibility
  value?: number; // Legacy field for simple grades
  date: string;
  createdAt: string;
  updatedAt: string;

  // Relationships
  student: Student;
  exam?: Exam; // Optional for comprehensive results
  subject: Subject;
  class: Class;
}

export interface GradeSummary {
  numberOfSubjects: number;
  marksObtainable: number;
  totalMarksObtained: number;
  average: number;
}

export interface ReportCard {
  student: Student;
  class: Class;
  academicYear: string;
  term: string;
  results: Grade[];
  summary: GradeSummary;
}

export interface BulkGradeData {
  studentId: number;
  ca1?: number;
  ca2?: number;
  examScore?: number;
  ltc?: number;
  remark?: string;
}

export interface BulkGradeRequest {
  classId: number;
  subjectId: number;
  academicYear: string;
  term: "FIRST" | "SECOND" | "THIRD";
  results: BulkGradeData[];
}
