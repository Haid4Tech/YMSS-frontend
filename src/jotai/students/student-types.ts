import { User } from "../auth/auth-types";
import { Class } from "../class/class-type";
import { Parent } from "../parent/parent-types";

export interface Student {
  id: number;
  userId: number;
  classId: number;
  parentId?: number;
  user: User;
  class: Class;
  parent?: Parent;
  
  // Additional fields used in the application
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  parentPhone?: string;
  guardianName?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  medicalConditions?: string;
  admissionDate?: string;
  studentId?: string; // Student ID number
}

export interface StudentResponse {
  students: Array<Student>;
  page: number;
  limit: number;
  total: number;
}
