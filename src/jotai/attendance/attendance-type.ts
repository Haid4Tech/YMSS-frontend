import { Student } from "../students/student-types";

export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  present: boolean;
  student: Student;
}
