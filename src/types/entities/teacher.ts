import { BaseEntity, BaseQueryParams, BaseCreateDTO, BaseUpdateDTO } from '../base';
import { User } from '../auth';

// Teacher entity
export interface Teacher extends BaseEntity {
  userId: number;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  qualifications?: string[];
  experience?: number; // years
  salary?: number;
  joinDate?: Date | string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  
  // Relations
  user?: User;
  subjects?: Subject[];
  classes?: Class[];
}

// Forward declarations (will be properly imported when other files are created)
interface Subject {
  id: number;
  name: string;
  code: string;
  credits: number;
}

interface Class {
  id: number;
  name: string;
  gradeLevel: string;
}

// Teacher-specific query parameters
export interface TeacherQueryParams extends BaseQueryParams {
  subjectId?: number;
  department?: string;
  status?: Teacher['status'];
  experience?: {
    min?: number;
    max?: number;
  };
  qualifications?: string[];
}

// Teacher DTOs
export interface CreateTeacherDTO extends BaseCreateDTO {
  userId: number;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  qualifications?: string[];
  experience?: number;
  salary?: number;
  joinDate?: Date | string;
}

export interface UpdateTeacherDTO extends BaseUpdateDTO {
  userId?: number;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  qualifications?: string[];
  experience?: number;
  salary?: number;
  status?: Teacher['status'];
}

// Teacher statistics
export interface TeacherStats {
  total: number;
  active: number;
  inactive: number;
  onLeave: number;
  byDepartment: Array<{
    department: string;
    count: number;
  }>;
  bySubject: Array<{
    subjectName: string;
    subjectId: number;
    count: number;
  }>;
  averageExperience: number;
  averageSubjectsPerTeacher: number;
}

// Teacher filters for advanced search
export interface TeacherFilters extends TeacherQueryParams {
  salaryRange?: {
    min?: number;
    max?: number;
  };
  joinDateRange?: {
    from?: Date | string;
    to?: Date | string;
  };
}

// Teacher assignment operations
export interface SubjectAssignment {
  teacherId: number;
  subjectId: number;
  assignedAt?: Date | string;
  isActive?: boolean;
}

export interface ClassAssignment {
  teacherId: number;
  classId: number;
  role?: 'TEACHER' | 'SUPERVISOR' | 'ASSISTANT';
  assignedAt?: Date | string;
  isActive?: boolean;
}

// Teacher performance metrics
export interface TeacherPerformance {
  teacherId: number;
  period: string; // e.g., "2024-Q1"
  studentsCount: number;
  subjectsCount: number;
  averageGrade: number;
  attendanceRate: number;
  feedback: {
    rating: number;
    comments: string[];
  };
} 