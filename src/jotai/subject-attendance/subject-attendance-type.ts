import { Enrollment } from "../enrollment/enrollment-types";

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  EXCUSED = "EXCUSED",
}

export interface SubjectAttendance {
  id: number;
  enrollmentId: number;
  date: string;
  status: AttendanceStatus;
  enrollment: Enrollment;
}

export interface SubjectAttendanceResponse {
  attendance: SubjectAttendance[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateSubjectAttendanceData {
  enrollmentId: number;
  date: string;
  status: AttendanceStatus;
}

export interface UpdateSubjectAttendanceData {
  id: number;
  status: AttendanceStatus;
}
