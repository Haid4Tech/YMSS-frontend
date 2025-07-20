import { useState, useEffect, useCallback } from 'react';
import { teacherService } from '@/services/teacher';
import { Teacher, TeacherFilters, CreateTeacherDTO, UpdateTeacherDTO } from '@/types/entities/teacher';
import { PaginationMetadata } from '@/types/base';
import { useAsyncOperation, useBooleanAsyncOperation } from '../common/useAsyncOperation';

// Hook state interfaces
interface UseTeachersState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
  pagination?: PaginationMetadata;
}

interface UseTeacherState {
  teacher: Teacher | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing teachers list with filtering and pagination
 */
export function useTeachers(filters?: TeacherFilters) {
  const [state, setState] = useState<UseTeachersState>({
    teachers: [],
    loading: false,
    error: null,
  });

  const fetchTeachers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await teacherService.getTeachers(filters);
      setState({
        teachers: result.teachers,
        pagination: result.pagination,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch teachers',
      }));
    }
  }, [filters]);

  const refresh = useCallback(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const searchTeachers = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await teacherService.searchTeachers(query, filters);
      setState({
        teachers: result.teachers,
        pagination: result.pagination,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to search teachers',
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    ...state,
    refresh,
    searchTeachers,
  };
}

/**
 * Hook for managing single teacher data
 */
export function useTeacher(id?: number) {
  const [state, setState] = useState<UseTeacherState>({
    teacher: null,
    loading: false,
    error: null,
  });

  const fetchTeacher = useCallback(async (teacherId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const teacher = await teacherService.getById(teacherId);
      setState({
        teacher,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch teacher',
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    if (id) {
      fetchTeacher(id);
    }
  }, [id, fetchTeacher]);

  useEffect(() => {
    if (id && id > 0) {
      fetchTeacher(id);
    }
  }, [id, fetchTeacher]);

  return {
    ...state,
    refresh,
  };
}

/**
 * Hook for teacher creation using common async operation pattern
 */
export function useCreateTeacher() {
  const { data, loading, error, execute, reset } = useAsyncOperation<Teacher, [CreateTeacherDTO]>();

  const createTeacher = useCallback(async (data: CreateTeacherDTO): Promise<Teacher | null> => {
    return execute(teacherService.create.bind(teacherService), data);
  }, [execute]);

  return {
    data,
    loading,
    error,
    createTeacher,
    reset,
  };
}

/**
 * Hook for teacher updates using common async operation pattern
 */
export function useUpdateTeacher() {
  const { data, loading, error, execute, reset } = useAsyncOperation<Teacher, [number, UpdateTeacherDTO]>();

  const updateTeacher = useCallback(async (
    id: number, 
    data: UpdateTeacherDTO
  ): Promise<Teacher | null> => {
    return execute(teacherService.update.bind(teacherService), id, data);
  }, [execute]);

  return {
    data,
    loading,
    error,
    updateTeacher,
    reset,
  };
}

/**
 * Hook for teacher deletion using boolean async operation pattern
 */
export function useDeleteTeacher() {
  const { data, loading, error, execute, reset } = useBooleanAsyncOperation<[number]>();

  const deleteTeacher = useCallback(async (id: number): Promise<boolean> => {
    return execute(teacherService.delete.bind(teacherService), id);
  }, [execute]);

  return {
    data,
    loading,
    error,
    deleteTeacher,
    reset,
  };
}

/**
 * Hook for teacher statistics
 */
export function useTeacherStats() {
  const [state, setState] = useState<{
    stats: Awaited<ReturnType<typeof teacherService.getTeacherStats>> | null;
    loading: boolean;
    error: string | null;
  }>({
    stats: null,
    loading: false,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const stats = await teacherService.getTeacherStats();
      setState({
        stats,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch teacher statistics',
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    ...state,
    refresh,
  };
}

/**
 * Hook for teacher-subject assignment using common async operation pattern
 */
export function useTeacherSubjectAssignment() {
  const assignOperation = useAsyncOperation<Teacher, [number, number]>();
  const removeOperation = useBooleanAsyncOperation<[number, number]>();

  const assignToSubject = useCallback(async (
    teacherId: number, 
    subjectId: number
  ): Promise<Teacher | null> => {
    return assignOperation.execute(
      teacherService.assignTeacherToSubject.bind(teacherService), 
      teacherId, 
      subjectId
    );
  }, [assignOperation.execute]);

  const removeFromSubject = useCallback(async (
    teacherId: number, 
    subjectId: number
  ): Promise<boolean> => {
    return removeOperation.execute(
      teacherService.removeTeacherFromSubject.bind(teacherService),
      teacherId,
      subjectId
    );
  }, [removeOperation.execute]);

  const reset = useCallback(() => {
    assignOperation.reset();
    removeOperation.reset();
  }, [assignOperation.reset, removeOperation.reset]);

  return {
    assignData: assignOperation.data,
    assignLoading: assignOperation.loading,
    assignError: assignOperation.error,
    removeData: removeOperation.data,
    removeLoading: removeOperation.loading,
    removeError: removeOperation.error,
    assignToSubject,
    removeFromSubject,
    reset,
  };
} 