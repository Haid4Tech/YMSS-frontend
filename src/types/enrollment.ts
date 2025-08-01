import { Student } from "@/jotai/students/student-types";
import { Subject } from "@/jotai/subject/subject-types";

export interface Enrollment {
  id: number;
  studentId: number;
  subjectId: number;
  enrolledAt: string;
  student: Student;
  subject: Subject;
  attendance: SubjectAttendance[];
}

export interface EnrollmentResponse {
  enrollments: Enrollment[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateEnrollmentData {
  studentId: number;
  subjectId: number;
}

export interface DeleteEnrollmentData {
  id: number;
} 