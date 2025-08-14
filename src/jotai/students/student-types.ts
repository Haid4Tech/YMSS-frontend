import { User } from "../auth/auth-types";
import { Class } from "../class/class-type";
import { Enrollment } from "../enrollment/enrollment-types";
import { Parent } from "../parent/parent-types";

interface Parents {
  id: number;
  parentId: number;
  studentId: number;
  parent: Parent;
}

export interface Student {
  id: number;
  userId: number;
  classId: number;
  parentId?: number;
  user: User;
  class: Class;
  parents?: Array<Parents>;
  enrollments: Array<Enrollment>;

  previousSchool?: string;
  relationship?: string;

  // Additional fields used in the application
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  parentPhone?: string;
  admissionDate?: string;

  // emergencyContact?: string;
  // bloodGroup?: string;
  // medicalConditions?: string;
  // studentId?: string;
}

export interface StudentResponse {
  students: Array<Student>;
  page: number;
  limit: number;
  total: number;
}
