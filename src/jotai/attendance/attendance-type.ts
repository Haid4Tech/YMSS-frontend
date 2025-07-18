import { Student } from "../students/student-types";

export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  present: boolean;
  student: Student;
  
  // Additional fields used in the application
  lesson?: string;
  notes?: string;
  classId?: number;
  lessonTitle?: string;
  timeIn?: string;
  timeOut?: string;
  excused?: boolean;
  reason?: string;
}
