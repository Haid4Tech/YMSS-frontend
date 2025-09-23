/* eslint-disable @typescript-eslint/no-explicit-any */
import { Class } from "../class/class-type";
import { Student } from "../students/student-types";
import { Teacher } from "../teachers/teachers-types";

enum IAttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export interface Attendance {
  id: number;
  date: string;
  status: IAttendanceStatus;
  notes?: string;
  studentId: number;
  classId: number;
  class?: Class;
  student?: Student;
  markedBy: number;
  teacher: Teacher;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceResponse {
  limit: number;
  page: number;
  total: number;
  attendance: Array<Attendance>;
}
