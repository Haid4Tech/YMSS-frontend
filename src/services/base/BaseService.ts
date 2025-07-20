import { BaseRepository } from "@/repositories/base";
import { BaseEntity, PaginationParams, EntityResponse, EntityListResponse } from "@/types/base";

export interface ServiceError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  context?: string;
}

export abstract class BaseService<
  T extends BaseEntity,
  CreateDTO,
  UpdateDTO,
  QueryParams extends PaginationParams = PaginationParams
> {
  protected repository: BaseRepository<T, CreateDTO, UpdateDTO, QueryParams>;

  constructor(repository: BaseRepository<T, CreateDTO, UpdateDTO, QueryParams>) {
    this.repository = repository;
  }

  /**
   * Get all entities with business logic
   */
  async getAll(params?: QueryParams): Promise<T[]> {
    try {
      const response = await this.repository.findAll(params);
      return this.processEntityList(response.data);
    } catch (error) {
      throw this.handleServiceError('fetch all entities', error);
    }
  }

  /**
   * Get entity by ID with business validation
   */
  async getById(id: number): Promise<T> {
    try {
      this.validateId(id);
      const response = await this.repository.findById(id);
      return this.processEntity(response.data);
    } catch (error) {
      throw this.handleServiceError('fetch entity', error);
    }
  }

  /**
   * Create entity with business validation
   */
  async create(data: CreateDTO): Promise<T> {
    try {
      await this.validateCreate(data);
      const response = await this.repository.create(data);
      return this.processEntity(response.data);
    } catch (error) {
      throw this.handleServiceError('create entity', error);
    }
  }

  /**
   * Update entity with business validation
   */
  async update(id: number, data: UpdateDTO): Promise<T> {
    try {
      this.validateId(id);
      await this.validateUpdate(id, data);
      const response = await this.repository.update(id, data);
      return this.processEntity(response.data);
    } catch (error) {
      throw this.handleServiceError('update entity', error);
    }
  }

  /**
   * Delete entity with business validation
   */
  async delete(id: number): Promise<void> {
    try {
      this.validateId(id);
      await this.validateDelete(id);
      await this.repository.delete(id);
    } catch (error) {
      throw this.handleServiceError('delete entity', error);
    }
  }

  /**
   * Check if entity exists
   */
  async exists(id: number): Promise<boolean> {
    try {
      this.validateId(id);
      return await this.repository.exists(id);
    } catch (error) {
      throw this.handleServiceError('check entity existence', error);
    }
  }

  /**
   * Get entity count
   */
  async count(params?: Partial<QueryParams>): Promise<number> {
    try {
      return await this.repository.count(params);
    } catch (error) {
      throw this.handleServiceError('count entities', error);
    }
  }

  // Protected methods for customization in derived services

  /**
   * Process a single entity (override for custom business logic)
   */
  protected processEntity(entity: T): T {
    return entity;
  }

  /**
   * Process a list of entities (override for custom business logic)
   */
  protected processEntityList(entities: T[]): T[] {
    return entities.map(entity => this.processEntity(entity));
  }

  /**
   * Validate ID parameter
   */
  protected validateId(id: number): void {
    if (!id || id <= 0) {
      throw this.createServiceError('Invalid ID provided', 400);
    }
  }

  /**
   * Validate create data (override in derived services)
   */
  protected async validateCreate(data: CreateDTO): Promise<void> {
    if (!data) {
      throw this.createServiceError('Create data is required', 400);
    }
  }

  /**
   * Validate update data (override in derived services)
   */
  protected async validateUpdate(id: number, data: UpdateDTO): Promise<void> {
    if (!data || Object.keys(data).length === 0) {
      throw this.createServiceError('Update data is required', 400);
    }
    
    // Ensure entity exists
    await this.exists(id);
  }

  /**
   * Validate delete operation (override in derived services)
   */
  protected async validateDelete(id: number): Promise<void> {
    // Ensure entity exists
    const entityExists = await this.exists(id);
    if (!entityExists) {
      throw this.createServiceError('Entity not found', 404);
    }
  }

  /**
   * Create a service error with consistent format
   */
  protected createServiceError(
    message: string, 
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ): ServiceError {
    return {
      message,
      statusCode,
      errors,
      context: this.constructor.name,
    };
  }

  /**
   * Handle service errors consistently
   */
  protected handleServiceError(operation: string, error: any): ServiceError {
    // If it's already a service error, re-throw it
    if (error.context) {
      return error;
    }

    const message = error?.message || `Failed to ${operation}`;
    console.error(`Service Error [${this.constructor.name}] ${operation}:`, error);
    
    return this.createServiceError(
      message,
      error?.statusCode || 500,
      error?.errors
    );
  }

  /**
   * Get the repository instance (for advanced use cases)
   */
  protected getRepository(): BaseRepository<T, CreateDTO, UpdateDTO, QueryParams> {
    return this.repository;
  }
} 