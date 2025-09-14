/* eslint-disable @typescript-eslint/no-explicit-any */
import { Class } from "../class/class-type";

export interface Attendance {
  id: number;
  date: string;
  records: any;
  classId: number;
  class: Class;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceResponse {
  limit: number;
  page: number;
  total: number;
  attendance: Array<Attendance>;
}
