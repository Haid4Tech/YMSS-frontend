import { User } from "../auth/auth-types";
import { Subject } from "../subject/subject-types";

export interface Teacher {
  id: number;
  subjects: Array<Subject>;
  subject?: Subject; // Main subject assignment
  user: User;
  userId: number;

  // Contact Information
  phone?: string;

  // Professional Details

  experience?: string; // in years
  hireDate?: string; // Alternative naming used in components
  salary?: number;

  // Class Assignment
  isClassTeacher?: boolean;
  classId?: number; // If they are a class teacher

  // Additional fields for comprehensive teacher management
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  employmentType?: string;
  education?: {
    degree: string;
    university: string;
    graduationYear: number | null;
  };
}

export interface TeachersResponse {
  limit: number;
  page: number;
  total: number;
  teachers: Array<Teacher>;
}
