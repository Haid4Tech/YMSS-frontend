# 🏗️ Frontend Architecture Documentation

## Overview

This document outlines the modular, enterprise-grade architecture implemented for the YMSS Frontend application. The architecture follows Domain-Driven Design (DDD) principles and implements several design patterns for maintainability, scalability, and type safety.

## 📁 Directory Structure

```
src/
├── app/                     # Next.js App Router pages
├── components/              # Reusable UI components
├── hooks/                   # Custom React hooks (organized by domain)
│   ├── common/             # Shared hooks
│   │   ├── useAsyncOperation.ts
│   │   └── index.ts
│   ├── teacher/            # Teacher-specific hooks
│   │   ├── useTeachers.ts
│   │   └── index.ts
│   └── index.ts            # Main hooks export
├── lib/                     # Core libraries and utilities
│   └── api-client.ts       # Enhanced HTTP client
├── repositories/            # Data access layer (organized by domain)
│   ├── base/               # Base repository pattern
│   │   ├── BaseRepository.ts
│   │   └── index.ts
│   ├── teacher/            # Teacher data access
│   │   ├── TeacherRepository.ts
│   │   └── index.ts
│   ├── student/            # Student data access
│   │   ├── StudentRepository.ts
│   │   └── index.ts
│   └── index.ts            # Main repositories export
├── services/                # Business logic layer (organized by domain)
│   ├── base/               # Base service pattern
│   │   ├── BaseService.ts
│   │   └── index.ts
│   ├── teacher/            # Teacher business logic
│   │   ├── TeacherService.ts
│   │   └── index.ts
│   └── index.ts            # Main services export
├── types/                   # Type definitions (organized by concern)
│   ├── base.ts             # Base types and interfaces
│   ├── auth.ts             # Authentication types
│   ├── api.ts              # API-specific types
│   └── entities/           # Entity-specific types
│       ├── teacher.ts
│       ├── student.ts
│       └── index.ts
└── utils/                   # Utility functions (organized by purpose)
    └── error/              # Error handling utilities
        ├── constants.ts    # Error constants
        ├── ErrorHandler.ts # Core error handling
        ├── hooks.ts        # Error handling hooks
        └── index.ts        # Error utilities export
```

## 🎯 Design Patterns Implemented

### 1. Repository Pattern
**Location**: `src/repositories/`

**Purpose**: Abstracts data access logic and provides a consistent interface for database operations.

**Benefits**:
- Centralized data access logic
- Easy testing with mock implementations
- Consistent API interface
- Type-safe operations

**Example**:
```typescript
// Using the repository
import { teacherRepository } from '@/repositories/teacher';

const teachers = await teacherRepository.findAllWithDetails();
const teacher = await teacherRepository.findById(1);
```

### 2. Service Layer Pattern
**Location**: `src/services/`

**Purpose**: Encapsulates business logic and coordinates between repositories and UI components.

**Benefits**:
- Separation of business logic from UI
- Reusable business operations
- Centralized validation
- Transaction-like operations

**Example**:
```typescript
// Using the service
import { teacherService } from '@/services/teacher';

const result = await teacherService.getTeachers({ page: 1, limit: 10 });
const teacher = await teacherService.createTeacher({ userId: 123 });
```

### 3. Custom Hook Pattern
**Location**: `src/hooks/`

**Purpose**: Encapsulates stateful logic and provides clean interfaces for components.

**Benefits**:
- Reusable state logic
- Consistent loading/error states
- Optimistic updates
- Automatic cache invalidation

**Example**:
```typescript
// Using the hooks
import { useTeachers, useCreateTeacher } from '@/hooks/teacher';

function TeachersPage() {
  const { teachers, loading, error, refresh } = useTeachers();
  const { createTeacher, loading: creating } = useCreateTeacher();
  
  // Component logic...
}
```

### 4. Enhanced API Client Pattern
**Location**: `src/lib/api-client.ts`

**Purpose**: Provides type-safe, consistent HTTP communication with comprehensive error handling.

**Benefits**:
- Type-safe API calls
- Automatic token management
- Request/response interceptors
- Consistent error handling
- Request timing and logging

**Example**:
```typescript
import { apiClient } from '@/lib/api-client';

// Type-safe API calls
const response = await apiClient.get<Teacher[]>('/teachers');
const teacher = await apiClient.post<Teacher, CreateTeacherDTO>('/teachers', data);
```

### 5. Comprehensive Error Handling
**Location**: `src/utils/error/`

**Purpose**: Provides consistent error handling and user feedback mechanisms.

**Benefits**:
- Centralized error management
- Consistent user feedback
- Error categorization and logging
- Retry mechanisms
- Development vs production handling

**Example**:
```typescript
import { useErrorHandler } from '@/utils/error';

function Component() {
  const { handleAsyncError, handleSuccess } = useErrorHandler();
  
  const handleAction = async () => {
    const result = await handleAsyncError(
      someAsyncOperation(),
      'Action Context'
    );
    
    if (result) {
      handleSuccess('Action completed successfully!');
    }
  };
}
```

## 🔧 Type Safety & DTOs

### Type Organization
Types are organized by concern and domain:

- **Base Types** (`src/types/base.ts`): Common interfaces and base entities
- **Auth Types** (`src/types/auth.ts`): Authentication and user management
- **API Types** (`src/types/api.ts`): HTTP and API-specific interfaces
- **Entity Types** (`src/types/entities/`): Domain-specific entity definitions

### DTO Pattern
Data Transfer Objects provide clear contracts for API operations:

```typescript
// Entity definition
export interface Teacher extends BaseEntity {
  userId: number;
  employeeId?: string;
  // ... other fields
}

// Create DTO
export interface CreateTeacherDTO {
  userId: number;
  employeeId?: string;
  // ... creation fields
}

// Update DTO
export interface UpdateTeacherDTO {
  employeeId?: string;
  // ... updatable fields (userId might be restricted)
}
```

## 🚀 Usage Examples

### Adding a New Entity

1. **Create Types**:
```typescript
// src/types/entities/subject.ts
export interface Subject extends BaseEntity {
  name: string;
  code: string;
  credits: number;
}

export interface CreateSubjectDTO {
  name: string;
  code: string;
  credits: number;
}
```

2. **Create Repository**:
```typescript
// src/repositories/subject/SubjectRepository.ts
export class SubjectRepository extends BaseRepository<
  Subject,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  SubjectQueryParams
> {
  constructor() {
    super({ endpoint: "/subjects", resourceName: "subject" });
  }
  
  // Add custom methods...
}
```

3. **Create Service**:
```typescript
// src/services/subject/SubjectService.ts
export class SubjectService extends BaseService<
  Subject,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  SubjectQueryParams
> {
  // Add business logic...
}
```

4. **Create Hooks**:
```typescript
// src/hooks/subject/useSubjects.ts
export function useSubjects() {
  // Implementation using common patterns...
}
```

### Error Handling Best Practices

```typescript
// In a component
const { handleAsyncError, handleSuccess } = useErrorHandler();

// For async operations
const result = await handleAsyncError(
  teacherService.createTeacher(data),
  'Create Teacher'
);

// For success feedback
if (result) {
  handleSuccess(`Teacher "${result.user?.name}" created successfully!`);
  refresh(); // Refresh the list
}
```

### Import Patterns

```typescript
// Entity-specific imports
import { Teacher, CreateTeacherDTO } from '@/types/entities/teacher';
import { teacherService } from '@/services/teacher';
import { useTeachers, useCreateTeacher } from '@/hooks/teacher';

// Common utilities
import { handleSuccess, useErrorHandler } from '@/utils/error';
import { apiClient } from '@/lib/api-client';

// Base patterns (when extending)
import { BaseRepository } from '@/repositories/base';
import { BaseService } from '@/services/base';
```

## 🔄 Migration Guide

To migrate existing code to the new architecture:

1. **Update Imports**: Replace old import paths with new organized structure
2. **Replace Jotai Atoms**: Use custom hooks instead of direct atom usage
3. **Add Type Safety**: Add proper TypeScript types for better development experience
4. **Error Handling**: Replace ad-hoc error handling with the centralized system
5. **Business Logic**: Move business logic from components to services

## 📊 Benefits of This Architecture

### For Developers:
- **Type Safety**: Complete TypeScript coverage prevents runtime errors
- **Consistency**: Standardized patterns across all data operations
- **Maintainability**: Clear separation of concerns and single responsibility
- **Testability**: Each layer can be tested independently
- **Scalability**: Easy to add new entities using existing patterns

### For Users:
- **Better Performance**: Optimistic updates and intelligent caching
- **Enhanced UX**: Loading states, error recovery, and real-time feedback
- **Reliability**: Robust error handling and retry mechanisms
- **Accessibility**: Consistent UI patterns and keyboard navigation

### For the Codebase:
- **Reduced Complexity**: Well-organized, feature-rich code
- **Better Error Handling**: From basic error states to comprehensive user feedback
- **Enhanced Developer Experience**: IntelliSense, autocomplete, and compile-time checking
- **Future-Proof**: Scalable architecture that grows with the application

## 🎉 Conclusion

This modular architecture provides a solid foundation for enterprise-level development while maintaining developer productivity and code quality. The patterns implemented are industry-standard and will scale beautifully as the application grows. 