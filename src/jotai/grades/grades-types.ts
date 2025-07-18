import { Exam } from "../exams/exams-type";
import { Student } from "../students/student-types";

export interface Grade {
  id: number;
  studentId: number;
  examId: number;
  value: number;
  date: string;
  student: Student;
  exam: Exam;

  // Additional fields used in the application
  grade?: string;
  marks?: number; // Same as value, but some code uses marks
  totalMarks?: number;
  percentage?: number;
  letterGrade?: string; // A, B, C, D, F
  comments?: string;
  teacherComments?: string;
  isPublished?: boolean;
  gradedBy?: number; // Teacher ID
  gradedAt?: string;
  subjectId?: number;
  classId?: number;
}
