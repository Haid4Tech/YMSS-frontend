import { apiClient, PaginatedResponse } from "@/lib/api-client";
import { BaseEntity, PaginationParams, EntityListResponse, EntityResponse } from "@/types/base";

export interface RepositoryConfig {
  endpoint: string;
  resourceName: string;
}

export abstract class BaseRepository<
  T extends BaseEntity,
  CreateDTO = Partial<Omit<T, keyof BaseEntity>>,
  UpdateDTO = Partial<Omit<T, keyof BaseEntity>>,
  QueryParams extends PaginationParams = PaginationParams
> {
  protected config: RepositoryConfig;

  constructor(config: RepositoryConfig) {
    this.config = config;
  }

  /**
   * Get all entities with optional pagination and filtering
   */
  async findAll(params?: QueryParams): Promise<EntityListResponse<T>> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = `${this.config.endpoint}${queryString}`;
      
      const response = await apiClient.get<EntityListResponse<T>>(url);
      return response;
    } catch (error) {
      throw this.handleError('fetch all', error);
    }
  }

  /**
   * Get paginated entities
   */
  async findPaginated(params: Required<PaginationParams> & Partial<QueryParams>): Promise<PaginatedResponse<T>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = `${this.config.endpoint}${queryString}`;
      
      const response = await apiClient.get<PaginatedResponse<T>>(url);
      return response;
    } catch (error) {
      throw this.handleError('fetch paginated', error);
    }
  }

  /**
   * Get entity by ID
   */
  async findById(id: number): Promise<EntityResponse<T>> {
    try {
      const response = await apiClient.get<EntityResponse<T>>(`${this.config.endpoint}/${id}`);
      return response;
    } catch (error) {
      throw this.handleError('fetch by ID', error);
    }
  }

  /**
   * Create new entity
   */
  async create(data: CreateDTO): Promise<EntityResponse<T>> {
    try {
      const response = await apiClient.post<EntityResponse<T>, CreateDTO>(this.config.endpoint, data);
      return response;
    } catch (error) {
      throw this.handleError('create', error);
    }
  }

  /**
   * Update existing entity
   */
  async update(id: number, data: UpdateDTO): Promise<EntityResponse<T>> {
    try {
      const response = await apiClient.patch<EntityResponse<T>, UpdateDTO>(
        `${this.config.endpoint}/${id}`,
        data
      );
      return response;
    } catch (error) {
      throw this.handleError('update', error);
    }
  }

  /**
   * Delete entity
   */
  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.config.endpoint}/${id}`);
    } catch (error) {
      throw this.handleError('delete', error);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      await this.findById(id);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get entity count
   */
  async count(params?: Partial<QueryParams>): Promise<number> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = `${this.config.endpoint}/count${queryString}`;
      
      const response = await apiClient.get<{ count: number }>(url);
      return response.count;
    } catch (error) {
      // Fallback: get total from paginated query
      try {
        const paginatedResponse = await this.findPaginated({ 
          page: 1, 
          limit: 1, 
          ...(params as Partial<QueryParams>)
        } as Required<PaginationParams> & Partial<QueryParams>);
        return paginatedResponse.pagination.total;
      } catch (fallbackError) {
        throw this.handleError('count', error);
      }
    }
  }

  /**
   * Build query string from parameters
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Handle and format errors consistently
   */
  protected handleError(operation: string, error: any): Error {
    const errorMessage = error?.message || `Failed to ${operation} ${this.config.resourceName}`;
    const enhancedError = new Error(errorMessage);
    
    // Preserve original error properties
    if (error?.statusCode) {
      (enhancedError as any).statusCode = error.statusCode;
    }
    if (error?.errors) {
      (enhancedError as any).errors = error.errors;
    }
    
    console.error(`Repository Error [${operation} ${this.config.resourceName}]:`, error);
    return enhancedError;
  }

  /**
   * Get the endpoint URL
   */
  getEndpoint(): string {
    return this.config.endpoint;
  }

  /**
   * Get the resource name
   */
  getResourceName(): string {
    return this.config.resourceName;
  }
} 