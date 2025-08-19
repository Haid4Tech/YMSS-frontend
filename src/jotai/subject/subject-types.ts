import { Class } from "../class/class-type";
import { Teacher } from "../teachers/teachers-types";

interface IStudentTeacher {
  id: number;
  subjectId: number;
  teacher: Teacher;
  teacherId: number;
}

export interface Subject {
  id: number;
  name: string;
  classId?: number;
  teacherId?: number;
  class?: Class;
  teachers?: Array<IStudentTeacher>;

  // Additional fields used in the application
  code?: string; // Subject code like "MATH101"
  description?: string;
  credits?: number;
  syllabus?: string;
  isActive?: boolean;
  semester?: string;
  department?: string;
  prerequisites?: string[];
  objectives?: string[];
}
