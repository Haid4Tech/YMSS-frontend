// Base entity interface that all entities extend
export interface BaseEntity {
  id: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Base query parameters for pagination and filtering
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Base query interface that all entity queries extend
export interface BaseQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response interfaces for API consistency
export interface EntityResponse<T> {
  data: T;
  message?: string;
}

export interface EntityListResponse<T> {
  data: T[];
  pagination?: PaginationMetadata;
  message?: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Status types used across entities
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

// Common field types
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

// Base DTO interfaces
export interface BaseCreateDTO {
  // Common fields for creation
}

export interface BaseUpdateDTO {
  // Common fields for updates
}

// Base service interfaces
export interface BaseServiceOperations<T, CreateDTO, UpdateDTO> {
  getAll(params?: BaseQueryParams): Promise<T[]>;
  getById(id: number): Promise<T>;
  create(data: CreateDTO): Promise<T>;
  update(id: number, data: UpdateDTO): Promise<T>;
  delete(id: number): Promise<void>;
}

// Common validation rules
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
} 