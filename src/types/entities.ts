// Base entity interface
export interface BaseEntity {
  id: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// User roles enum
export type UserRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

// User entity
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  // password is excluded for security
}

// Teacher entity
export interface Teacher extends BaseEntity {
  userId: number;
  user?: User;
  subjects?: Subject[];
}

// Student entity
export interface Student extends BaseEntity {
  userId: number;
  classId: number;
  parentId?: number;
  user?: User;
  class?: Class;
  parent?: Parent;
  records?: AcademicRecord[];
  attendance?: Attendance[];
  grades?: Grade[];
}

// Parent entity
export interface Parent extends BaseEntity {
  userId: number;
  user?: User;
  students?: Student[];
}

// Class entity
export interface Class extends BaseEntity {
  name: string;
  capacity: number;
  supervisorId?: number;
  gradeLevel: string;
  students?: Student[];
  supervisor?: Teacher;
  subjects?: Subject[];
}

// Subject entity
export interface Subject extends BaseEntity {
  name: string;
  code: string;
  description?: string;
  credits: number;
  teacherId: number;
  teacher?: Teacher;
  classes?: Class[];
  exams?: Exam[];
  grades?: Grade[];
}

// Exam entity
export interface Exam extends BaseEntity {
  title: string;
  description?: string;
  date: Date | string;
  duration: number;
  totalMarks: number;
  subjectId: number;
  subject?: Subject;
  grades?: Grade[];
}

// Grade entity
export interface Grade extends BaseEntity {
  score: number;
  studentId: number;
  examId: number;
  student?: Student;
  exam?: Exam;
}

// Attendance entity
export interface Attendance extends BaseEntity {
  date: Date | string;
  status: "PRESENT" | "ABSENT" | "LATE";
  studentId: number;
  student?: Student;
}

// Academic Record entity
export interface AcademicRecord extends BaseEntity {
  gpa: number;
  semester: string;
  year: number;
  studentId: number;
  student?: Student;
}

// Event entity
export interface Event extends BaseEntity {
  title: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  userId: number;
  user?: User;
}

// Announcement entity
export interface Announcement extends BaseEntity {
  title: string;
  content: string;
  publishDate: Date | string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  userId: number;
  user?: User;
}

// Authentication types
export interface AuthSession {
  user: User;
  teacher?: Teacher;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// DTOs for API operations
export namespace DTOs {
  // Teacher DTOs
  export interface CreateTeacher {
    userId: number;
  }

  export interface UpdateTeacher {
    userId?: number;
  }

  // Student DTOs
  export interface CreateStudent {
    userId: number;
    classId: number;
    parentId?: number;
  }

  export interface UpdateStudent {
    classId?: number;
    parentId?: number;
  }

  // Class DTOs
  export interface CreateClass {
    name: string;
    capacity: number;
    gradeLevel: string;
    supervisorId?: number;
  }

  export interface UpdateClass {
    name?: string;
    capacity?: number;
    gradeLevel?: string;
    supervisorId?: number;
  }

  // Subject DTOs
  export interface CreateSubject {
    name: string;
    code: string;
    description?: string;
    credits: number;
    teacherId: number;
  }

  export interface UpdateSubject {
    name?: string;
    code?: string;
    description?: string;
    credits?: number;
    teacherId?: number;
  }

  // Exam DTOs
  export interface CreateExam {
    title: string;
    description?: string;
    date: Date | string;
    duration: number;
    totalMarks: number;
    subjectId: number;
  }

  export interface UpdateExam {
    title?: string;
    description?: string;
    date?: Date | string;
    duration?: number;
    totalMarks?: number;
    subjectId?: number;
  }

  // Grade DTOs
  export interface CreateGrade {
    score: number;
    studentId: number;
    examId: number;
  }

  export interface UpdateGrade {
    score?: number;
    studentId?: number;
    examId?: number;
  }
}

// Query parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TeacherQueryParams extends PaginationParams {
  search?: string;
  subjectId?: number;
}

export interface StudentQueryParams extends PaginationParams {
  search?: string;
  classId?: number;
  parentId?: number;
}

export interface ClassQueryParams extends PaginationParams {
  search?: string;
  gradeLevel?: string;
  supervisorId?: number;
}

// API Response wrappers
export interface EntityListResponse<T> {
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EntityResponse<T> {
  data: T;
  message?: string;
} 