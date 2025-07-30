import { Student } from "../students/student-types";
import { Subject } from "../subject/subject-types";
import { Teacher } from "../teachers/teachers-types";

export interface Class {
  id: number;
  name: string;
  students: Array<Student>;
  subjects: Array<Subject>;

  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  teacher: Teacher;

  // Additional fields used in the application
  grade?: string; // Grade level like "10th", "11th"
  section?: string; // Section like "A", "B"
  academicYear?: string;
  classTeacherId?: number;
  roomNumber?: string;
  capacity?: number;
  isActive?: boolean;
  description?: string;
}

export interface ClassResponse {
  limit: number;
  page: number;
  total: number;
  class: Array<Class>;
}
