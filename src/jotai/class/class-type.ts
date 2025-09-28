import { Student } from "../students/student-types";
import { Subject } from "../subject/subject-types";
import { Teacher } from "../teachers/teachers-types";

export interface Class {
  id: number;
  name: string;
  roomNumber?: string;
  students: Array<Student>;
  subjects: Array<Subject>;

  academicYear?: string;
  capacity?: number;
  description?: string;

  days?: string[];
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  teacher?: Teacher;

  // Additional fields used in the application
  gradeLevel?: string; // Grade level like "1", "2", "3", etc.
}

export interface ClassResponse {
  limit: number;
  page: number;
  total: number;
  class: Array<Class>;
}
