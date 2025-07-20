import { BaseEntity, BaseQueryParams, BaseCreateDTO, BaseUpdateDTO, AttendanceStatus } from '../base';
import { User } from '../auth';

// Student entity
export interface Student extends BaseEntity {
  userId: number;
  studentId?: string;
  classId: number;
  parentId?: number;
  dateOfBirth?: Date | string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalInfo?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
  enrollmentDate?: Date | string;
  status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED';
  
  // Relations
  user?: User;
  class?: Class;
  parent?: Parent;
  records?: AcademicRecord[];
  attendance?: Attendance[];
  grades?: Grade[];
}

// Forward declarations
interface Class {
  id: number;
  name: string;
  gradeLevel: string;
}

interface Parent {
  id: number;
  userId: number;
  user?: User;
}

interface AcademicRecord {
  id: number;
  gpa: number;
  semester: string;
  year: number;
}

interface Attendance {
  id: number;
  date: Date | string;
  status: AttendanceStatus;
}

interface Grade {
  id: number;
  score: number;
  examId: number;
}

// Student-specific query parameters
export interface StudentQueryParams extends BaseQueryParams {
  classId?: number;
  parentId?: number;
  gradeLevel?: string;
  status?: Student['status'];
  gender?: Student['gender'];
  enrollmentYear?: number;
  bloodGroup?: string;
  hasParent?: boolean;
}

// Student DTOs
export interface CreateStudentDTO extends BaseCreateDTO {
  userId: number;
  studentId?: string;
  classId: number;
  parentId?: number;
  dateOfBirth?: Date | string;
  gender?: Student['gender'];
  bloodGroup?: string;
  address?: string;
  phone?: string;
  emergencyContact?: Student['emergencyContact'];
  medicalInfo?: Student['medicalInfo'];
  enrollmentDate?: Date | string;
}

export interface UpdateStudentDTO extends BaseUpdateDTO {
  classId?: number;
  parentId?: number;
  dateOfBirth?: Date | string;
  gender?: Student['gender'];
  bloodGroup?: string;
  address?: string;
  phone?: string;
  emergencyContact?: Student['emergencyContact'];
  medicalInfo?: Student['medicalInfo'];
  status?: Student['status'];
}

// Student statistics
export interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  graduated: number;
  transferred: number;
  suspended: number;
  byClass: Array<{
    className: string;
    classId: number;
    count: number;
    capacity: number;
  }>;
  byGradeLevel: Array<{
    gradeLevel: string;
    count: number;
  }>;
  byGender: {
    male: number;
    female: number;
    other: number;
  };
  averageAge: number;
  enrollmentTrends: Array<{
    month: string;
    count: number;
  }>;
}

// Student filters for advanced search
export interface StudentFilters extends StudentQueryParams {
  ageRange?: {
    min?: number;
    max?: number;
  };
  enrollmentDateRange?: {
    from?: Date | string;
    to?: Date | string;
  };
  hasEmergencyContact?: boolean;
  hasMedicalInfo?: boolean;
}

// Student academic performance
export interface StudentPerformance {
  studentId: number;
  period: string;
  gpa: number;
  totalCredits: number;
  completedCredits: number;
  attendanceRate: number;
  subjectGrades: Array<{
    subjectId: number;
    subjectName: string;
    averageScore: number;
    grade: string;
  }>;
  rank: {
    classRank: number;
    totalInClass: number;
    gradeRank: number;
    totalInGrade: number;
  };
}

// Student attendance summary
export interface StudentAttendanceSummary {
  studentId: number;
  period: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
  monthlyBreakdown: Array<{
    month: string;
    present: number;
    absent: number;
    late: number;
    excused: number;
  }>;
} 