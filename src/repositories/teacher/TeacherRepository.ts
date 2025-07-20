import { BaseRepository } from "../base";
import { Teacher, TeacherQueryParams, CreateTeacherDTO, UpdateTeacherDTO } from "@/types/entities/teacher";
import { EntityResponse, EntityListResponse } from "@/types/base";
import { apiClient } from "@/lib/api-client";

export class TeacherRepository extends BaseRepository<
  Teacher,
  CreateTeacherDTO,
  UpdateTeacherDTO,
  TeacherQueryParams
> {
  constructor() {
    super({
      endpoint: "/teachers",
      resourceName: "teacher",
    });
  }

  /**
   * Get teacher by user ID
   */
  async findByUserId(userId: number): Promise<EntityResponse<Teacher>> {
    try {
      const response = await apiClient.get<EntityResponse<Teacher>>(
        `${this.config.endpoint}/user/${userId}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch by user ID', error);
    }
  }

  /**
   * Get teachers with full details (user info, subjects)
   */
  async findAllWithDetails(params?: TeacherQueryParams): Promise<EntityListResponse<Teacher>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = `${this.config.endpoint}/details${queryString}`;
      
      const response = await apiClient.get<EntityListResponse<Teacher>>(url);
      return response;
    } catch (error) {
      // Fallback to regular findAll if details endpoint doesn't exist
      return this.findAll(params);
    }
  }

  /**
   * Get teacher by ID with full details
   */
  async findByIdWithDetails(id: number): Promise<EntityResponse<Teacher>> {
    try {
      const response = await apiClient.get<EntityResponse<Teacher>>(
        `${this.config.endpoint}/${id}/details`
      );
      return response;
    } catch (error) {
      // Fallback to regular findById if details endpoint doesn't exist
      return this.findById(id);
    }
  }

  /**
   * Get teachers by subject
   */
  async findBySubject(subjectId: number): Promise<EntityListResponse<Teacher>> {
    try {
      const response = await apiClient.get<EntityListResponse<Teacher>>(
        `${this.config.endpoint}/subject/${subjectId}`
      );
      return response;
    } catch (error) {
      throw this.handleError('fetch by subject', error);
    }
  }

  /**
   * Search teachers by name or email
   */
  async search(query: string, params?: Omit<TeacherQueryParams, 'search'>): Promise<EntityListResponse<Teacher>> {
    try {
      const searchParams = { ...params, search: query };
      return this.findAll(searchParams);
    } catch (error) {
      throw this.handleError('search', error);
    }
  }

  /**
   * Get teacher statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    bySubject: Array<{ subjectName: string; count: number }>;
  }> {
    try {
      const response = await apiClient.get<{
        total: number;
        active: number;
        bySubject: Array<{ subjectName: string; count: number }>;
      }>(`${this.config.endpoint}/stats`);
      return response;
    } catch (error) {
      // Fallback to basic count if stats endpoint doesn't exist
      const total = await this.count();
      return {
        total,
        active: total,
        bySubject: [],
      };
    }
  }

  /**
   * Assign teacher to subject
   */
  async assignToSubject(teacherId: number, subjectId: number): Promise<EntityResponse<Teacher>> {
    try {
      const response = await apiClient.post<EntityResponse<Teacher>>(
        `${this.config.endpoint}/${teacherId}/subjects`,
        { subjectId }
      );
      return response;
    } catch (error) {
      throw this.handleError('assign to subject', error);
    }
  }

  /**
   * Remove teacher from subject
   */
  async removeFromSubject(teacherId: number, subjectId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.config.endpoint}/${teacherId}/subjects/${subjectId}`);
    } catch (error) {
      throw this.handleError('remove from subject', error);
    }
  }
} 