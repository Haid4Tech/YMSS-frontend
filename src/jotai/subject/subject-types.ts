import { Class } from "../class/class-type";
import { Teacher } from "../teachers/teachers-types";

export interface Subject {
  id: number;
  name: string;
  classId?: number;
  teacherId?: number;
  class?: Class;
  teacher?: Teacher;

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
