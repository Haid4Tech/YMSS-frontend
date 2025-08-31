import { User } from "../auth/auth-types";
import { Subject } from "../subject/subject-types";

export interface Teacher {
  id: number;
  subjects: Array<Subject>;
  user: User;
  userId: number;

  experience?: string; // in years
  hireDate?: string; // Alternative naming used in components
  salary?: number;
  employmentType?: string;
  previousInstitution?: string;
  degree: string;
  university: string;
  graduationYear: number | null;

  // subject?: Subject; // Main subject assignment
  // Class Assignment
  // isClassTeacher?: boolean;
  // classId?: number; // If they are a class teache

  // emergencyContactName?: string;
  // emergencyContactPhone?: string;
}

export interface TeachersResponse {
  limit: number;
  page: number;
  total: number;
  teachers: Array<Teacher>;
}
