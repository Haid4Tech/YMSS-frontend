import { BaseService, ServiceError } from "../base";
import { teacherRepository, TeacherRepository } from "@/repositories/teacher";
import { Teacher, TeacherQueryParams, CreateTeacherDTO, UpdateTeacherDTO, TeacherFilters, TeacherStats } from "@/types/entities/teacher";
import { PaginationMetadata } from "@/types/base";

export interface TeacherListResult {
  teachers: Teacher[];
  pagination?: PaginationMetadata;
}

export class TeacherService extends BaseService<
  Teacher,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherQueryParams
> {
  private teacherRepository: TeacherRepository;

  constructor(repository: TeacherRepository = teacherRepository) {
    super(repository);
    this.teacherRepository = repository;
  }

  /**
   * Get all teachers with optional filtering and pagination
   */
  async getTeachers(filters?: TeacherFilters): Promise<TeacherListResult> {
    try {
      // Business logic: Determine if we need pagination
      const shouldPaginate = filters?.page && filters?.limit;
      
      if (shouldPaginate) {
        const response = await this.teacherRepository.findPaginated({
          page: filters.page!,
          limit: filters.limit!,
          ...filters,
        });
        
        return {
          teachers: this.processEntityList(response.data),
          pagination: response.pagination,
        };
      } else {
        const response = await this.teacherRepository.findAllWithDetails(filters);
        return {
          teachers: this.processEntityList(response.data),
          pagination: response.pagination,
        };
      }
    } catch (error) {
      throw this.handleServiceError('fetch teachers', error);
    }
  }

  /**
   * Get teacher by user ID
   */
  async getTeacherByUserId(userId: number): Promise<Teacher> {
    try {
      if (!userId || userId <= 0) {
        throw this.createServiceError('Invalid user ID provided', 400);
      }

      const response = await this.teacherRepository.findByUserId(userId);
      return this.processEntity(response.data);
    } catch (error) {
      throw this.handleServiceError('fetch teacher by user', error);
    }
  }

  /**
   * Search teachers with intelligent filtering
   */
  async searchTeachers(query: string, filters?: Omit<TeacherFilters, 'search'>): Promise<TeacherListResult> {
    try {
      // Business logic: Validate search query
      if (!query || query.trim().length < 2) {
        throw this.createServiceError('Search query must be at least 2 characters long', 400);
      }

      const trimmedQuery = query.trim();
      const response = await this.teacherRepository.search(trimmedQuery, filters);
      
      return {
        teachers: this.processEntityList(response.data),
        pagination: response.pagination,
      };
    } catch (error) {
      throw this.handleServiceError('search teachers', error);
    }
  }

  /**
   * Get teacher statistics with business calculations
   */
  async getTeacherStats(): Promise<TeacherStats> {
    try {
      const stats = await this.teacherRepository.getStats();
      
      // Business logic: Calculate additional metrics
      const averageSubjectsPerTeacher = stats.total > 0 
        ? stats.bySubject.reduce((sum, item) => sum + item.count, 0) / stats.total 
        : 0;

      return {
        total: stats.total,
        active: stats.active,
        inactive: stats.total - stats.active,
        onLeave: 0, // This would come from the API if available
        byDepartment: [], // This would come from the API if available
        bySubject: stats.bySubject.map(item => ({
          subjectName: item.subjectName,
          subjectId: 0, // This would need to come from API
          count: item.count,
        })),
        averageExperience: 0, // This would come from the API if available
        averageSubjectsPerTeacher: Math.round(averageSubjectsPerTeacher * 100) / 100,
      };
    } catch (error) {
      throw this.handleServiceError('fetch teacher statistics', error);
    }
  }

  /**
   * Assign teacher to subject with validation
   */
  async assignTeacherToSubject(teacherId: number, subjectId: number): Promise<Teacher> {
    try {
      if (!teacherId || teacherId <= 0) {
        throw this.createServiceError('Invalid teacher ID provided', 400);
      }
      if (!subjectId || subjectId <= 0) {
        throw this.createServiceError('Invalid subject ID provided', 400);
      }

      // Business logic: Ensure teacher exists
      await this.getById(teacherId);

      const response = await this.teacherRepository.assignToSubject(teacherId, subjectId);
      return this.processEntity(response.data);
    } catch (error) {
      throw this.handleServiceError('assign teacher to subject', error);
    }
  }

  /**
   * Remove teacher from subject
   */
  async removeTeacherFromSubject(teacherId: number, subjectId: number): Promise<void> {
    try {
      if (!teacherId || teacherId <= 0) {
        throw this.createServiceError('Invalid teacher ID provided', 400);
      }
      if (!subjectId || subjectId <= 0) {
        throw this.createServiceError('Invalid subject ID provided', 400);
      }

      await this.teacherRepository.removeFromSubject(teacherId, subjectId);
    } catch (error) {
      throw this.handleServiceError('remove teacher from subject', error);
    }
  }

  // Override base validations for teacher-specific business rules

  /**
   * Validate teacher creation with business rules
   */
  protected async validateCreate(data: CreateTeacherDTO): Promise<void> {
    await super.validateCreate(data);

    // Business rule: Check if teacher already exists for this user
    try {
      await this.getTeacherByUserId(data.userId);
      throw this.createServiceError('A teacher record already exists for this user', 409);
    } catch (error: any) {
      // If teacher doesn't exist (404), that's what we want
      if (error.statusCode !== 404) {
        throw error;
      }
    }
  }

  /**
   * Validate teacher update with business rules
   */
  protected async validateUpdate(id: number, data: UpdateTeacherDTO): Promise<void> {
    await super.validateUpdate(id, data);

    // Business rule: If updating userId, check if another teacher already uses it
    if (data.userId) {
      try {
        const existingTeacher = await this.getTeacherByUserId(data.userId);
        if (existingTeacher.id !== id) {
          throw this.createServiceError('Another teacher already exists for this user', 409);
        }
      } catch (error: any) {
        // If teacher doesn't exist (404), that's fine for the update
        if (error.statusCode !== 404) {
          throw error;
        }
      }
    }
  }

  /**
   * Process teacher entity with business logic
   */
  protected processEntity(teacher: Teacher): Teacher {
    // Business logic: Add computed fields, format data, etc.
    
    // Ensure employee ID is formatted correctly
    if (!teacher.employeeId) {
      teacher.employeeId = `TCH-${teacher.id.toString().padStart(4, '0')}`;
    }

    // Add any other business logic processing here
    
    return teacher;
  }
} 