import { BaseRepository } from "../base";
import { Student, StudentQueryParams, CreateStudentDTO, UpdateStudentDTO } from "@/types/entities/student";
import { EntityResponse, EntityListResponse } from "@/types/base";
import { apiClient } from "@/lib/api-client";

export class StudentRepository extends BaseRepository<
  Student,
  CreateStudentDTO,
  UpdateStudentDTO,
  StudentQueryParams
> {
  constructor() {
    super({
      endpoint: "/students",
      resourceName: "student",
    });
  }

  /**
   * Get student by user ID
   */
  async findByUserId(userId: number): Promise<EntityResponse<Student>> {
    try {
      const response = await apiClient.get<EntityResponse<Student>>(
        `${this.config.endpoint}/user/${userId}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch by user ID', error);
    }
  }

  /**
   * Get students by class
   */
  async findByClass(classId: number): Promise<EntityListResponse<Student>> {
    try {
      const response = await apiClient.get<EntityListResponse<Student>>(
        `${this.config.endpoint}/class/${classId}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch by class', error);
    }
  }

  /**
   * Get students by parent
   */
  async findByParent(parentId: number): Promise<EntityListResponse<Student>> {
    try {
      const response = await apiClient.get<EntityListResponse<Student>>(
        `${this.config.endpoint}/parent/${parentId}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch by parent', error);
    }
  }

  /**
   * Get students with full details
   */
  async findAllWithDetails(params?: StudentQueryParams): Promise<EntityListResponse<Student>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = `${this.config.endpoint}/details${queryString}`;
      
      const response = await apiClient.get<EntityListResponse<Student>>(url);
      return response;
    } catch (error) {
      // Fallback to regular findAll if details endpoint doesn't exist
      return this.findAll(params);
    }
  }

  /**
   * Get student by ID with full details
   */
  async findByIdWithDetails(id: number): Promise<EntityResponse<Student>> {
    try {
      const response = await apiClient.get<EntityResponse<Student>>(
        `${this.config.endpoint}/${id}/details`
      );
      return response;
    } catch (error) {
      // Fallback to regular findById if details endpoint doesn't exist
      return this.findById(id);
    }
  }

  /**
   * Search students by name or student ID
   */
  async search(query: string, params?: Omit<StudentQueryParams, 'search'>): Promise<EntityListResponse<Student>> {
    try {
      const searchParams = { ...params, search: query };
      return this.findAll(searchParams);
    } catch (error) {
      throw this.handleError('search', error);
    }
  }

  /**
   * Get student statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    byClass: Array<{ className: string; count: number }>;
    byGradeLevel: Array<{ gradeLevel: string; count: number }>;
  }> {
    try {
      const response = await apiClient.get<{
        total: number;
        active: number;
        byClass: Array<{ className: string; count: number }>;
        byGradeLevel: Array<{ gradeLevel: string; count: number }>;
      }>(`${this.config.endpoint}/stats`);
      return response;
    } catch (error) {
      // Fallback to basic count if stats endpoint doesn't exist
      const total = await this.count();
      return {
        total,
        active: total,
        byClass: [],
        byGradeLevel: [],
      };
    }
  }

  /**
   * Enroll student in class
   */
  async enrollInClass(studentId: number, classId: number): Promise<EntityResponse<Student>> {
    try {
      const response = await apiClient.post<EntityResponse<Student>>(
        `${this.config.endpoint}/${studentId}/enroll`,
        { classId }
      );
      return response;
    } catch (error) {
      throw this.handleError('enroll in class', error);
    }
  }

  /**
   * Transfer student to another class
   */
  async transferToClass(studentId: number, newClassId: number): Promise<EntityResponse<Student>> {
    try {
      const response = await apiClient.patch<EntityResponse<Student>>(
        `${this.config.endpoint}/${studentId}/transfer`,
        { classId: newClassId }
      );
      return response;
    } catch (error) {
      throw this.handleError('transfer to class', error);
    }
  }

  /**
   * Get student performance summary
   */
  async getPerformanceSummary(studentId: number, period?: string): Promise<any> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await apiClient.get(
        `${this.config.endpoint}/${studentId}/performance${params}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch performance summary', error);
    }
  }

  /**
   * Get student attendance summary
   */
  async getAttendanceSummary(studentId: number, period?: string): Promise<any> {
    try {
      const params = period ? `?period=${period}` : '';
      const response = await apiClient.get(
        `${this.config.endpoint}/${studentId}/attendance${params}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch attendance summary', error);
    }
  }
} 