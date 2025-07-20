import { BaseEntity } from './base';

// User roles enum
export type UserRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

// User entity
export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  // password is excluded for security
}

// Authentication session
export interface AuthSession {
  user: User;
  teacher?: any; // Will import from teacher types
  student?: any; // Will import from student types
  parent?: any;  // Will import from parent types
  token: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration data
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Password reset interfaces
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile update
export interface ProfileUpdateData {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Authentication state
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Token refresh
export interface TokenRefreshResponse {
  token: string;
  refreshToken?: string;
}

// Permission checking
export type Permission = 
  | 'read:users' 
  | 'write:users' 
  | 'delete:users'
  | 'read:teachers' 
  | 'write:teachers' 
  | 'delete:teachers'
  | 'read:students' 
  | 'write:students' 
  | 'delete:students'
  | 'read:classes' 
  | 'write:classes' 
  | 'delete:classes'
  | 'read:subjects' 
  | 'write:subjects' 
  | 'delete:subjects'
  | 'read:exams' 
  | 'write:exams' 
  | 'delete:exams'
  | 'read:grades' 
  | 'write:grades' 
  | 'delete:grades'
  | 'admin:all';

export type RolePermissions = {
  [K in UserRole]: Permission[];
}; 