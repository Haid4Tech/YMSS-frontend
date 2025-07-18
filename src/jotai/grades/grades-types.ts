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
}
