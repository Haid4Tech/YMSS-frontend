/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Grade, ReportCard, BulkGradeRequest } from "./grades-types";

/*
  |--------------------------------------------------------------------------
  | GRADES - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to manage grades data (both simple grades and comprehensive results)
  |
*/

// State atoms for consistent pattern
export const gradeListAtom = atom<Array<Grade> | null>(null);
export const gradeLoadingAtom = atom<boolean>(false);
export const gradeErrorAtom = atom<string | null>(null);
export const reportCardAtom = atom<ReportCard | null>(null);
export const reportCardLoadingAtom = atom<boolean>(false);
export const reportCardErrorAtom = atom<string | null>(null);

// ===== BASIC GRADE FUNCTIONS (Legacy) =====

export const gradesAPI = {
  // Get all grades (both simple and comprehensive)
  getAll: atom(null, async (_get, set) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.get("/grades");
      set(gradeListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to fetch grades");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Get grades by student
  getByStudent: atom(
    null,
    async (
      _get,
      set,
      studentId: number,
      academicYear?: string,
      term?: string
    ) => {
      set(gradeLoadingAtom, true);
      set(gradeErrorAtom, null);

      try {
        const params = new URLSearchParams();
        if (academicYear) params.append("academicYear", academicYear);
        if (term) params.append("term", term);

        const response = await axiosInstance.get(
          `/grades/${studentId}?${params}`
        );
        set(gradeListAtom, response.data);
        return response.data;
      } catch (error: any) {
        set(gradeErrorAtom, error.message || "Failed to fetch student grades");
        throw error;
      } finally {
        set(gradeLoadingAtom, false);
      }
    }
  ),

  // Get grades by subject
  getBySubject: atom(null, async (_get, set, subjectId: number) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.get(`/grades/subject/${subjectId}`);
      set(gradeListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to fetch subject grades");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Get grades by exam
  getByExam: atom(null, async (_get, set, examId: number) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.get(`/grades/exam/${examId}`);
      set(gradeListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to fetch exam grades");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Create/assign grade
  assign: atom(null, async (_get, set, data: any) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.post("/grades", data);
      // Refresh the list
      const allGrades = await axiosInstance.get("/grades");
      set(gradeListAtom, allGrades.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to assign grade");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Update grade
  update: atom(null, async (_get, set, id: number, data: any) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.patch(`/grades/${id}`, data);
      // Refresh the list
      const allGrades = await axiosInstance.get("/grades");
      set(gradeListAtom, allGrades.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to update grade");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Update comprehensive result (for result modal)
  updateResult: atom(null, async (_get, set, id: number, data: any) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.patch(`/grades/${id}`, data);
      // Don't refresh global results here - let the calling component handle refresh
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to update result");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Delete grade
  delete: atom(null, async (_get, set, id: number) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      await axiosInstance.delete(`/grades/${id}`);
      // Refresh the list
      const allGrades = await axiosInstance.get("/grades");
      set(gradeListAtom, allGrades.data);
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to delete grade");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // ===== COMPREHENSIVE RESULTS FUNCTIONS =====

  // Get all results (comprehensive grades)
  getAllResults: atom(null, async (_get, set) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.get("/grades/results/all");
      set(gradeListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to fetch results");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Get results by student
  getResultsByStudent: atom(
    null,
    async (
      _get,
      set,
      studentId: number,
      academicYear?: string,
      term?: string
    ) => {
      set(gradeLoadingAtom, true);
      set(gradeErrorAtom, null);

      try {
        const params = new URLSearchParams();
        if (academicYear) params.append("academicYear", academicYear);
        if (term) params.append("term", term);

        const response = await axiosInstance.get(
          `/grades/results/student/${studentId}?${params}`
        );
        set(gradeListAtom, response.data);
        return response.data;
      } catch (error: any) {
        set(gradeErrorAtom, error.message || "Failed to fetch student results");
        throw error;
      } finally {
        set(gradeLoadingAtom, false);
      }
    }
  ),

  // Get results by class and subject
  getResultsByClassAndSubject: atom(
    null,
    async (
      _get,
      set,
      classId: number,
      subjectId: number,
      academicYear?: string,
      term?: string
    ) => {
      set(gradeLoadingAtom, true);
      set(gradeErrorAtom, null);

      try {
        const params = new URLSearchParams();
        if (academicYear) params.append("academicYear", academicYear);
        if (term) params.append("term", term);

        const response = await axiosInstance.get(
          `/grades/results/class/${classId}/subject/${subjectId}?${params}`
        );
        set(gradeListAtom, response.data);
        return response.data;
      } catch (error: any) {
        set(
          gradeErrorAtom,
          error.message || "Failed to fetch class subject results"
        );
        throw error;
      } finally {
        set(gradeLoadingAtom, false);
      }
    }
  ),

  // Get results by class
  getResultsByClass: atom(
    null,
    async (
      _get,
      set,
      classId: number,
      academicYear?: string,
      term?: string
    ) => {
      set(gradeLoadingAtom, true);
      set(gradeErrorAtom, null);

      try {
        const params = new URLSearchParams();
        if (academicYear) params.append("academicYear", academicYear);
        if (term) params.append("term", term);

        const response = await axiosInstance.get(
          `/grades/results/class/${classId}?${params}`
        );
        set(gradeListAtom, response.data);
        return response.data;
      } catch (error: any) {
        set(gradeErrorAtom, error.message || "Failed to fetch class results");
        throw error;
      } finally {
        set(gradeLoadingAtom, false);
      }
    }
  ),

  // Get student report card
  getReportCard: atom(
    null,
    async (
      _get,
      set,
      studentId: number,
      academicYear?: string,
      term?: string
    ) => {
      set(reportCardLoadingAtom, true);
      set(reportCardErrorAtom, null);

      try {
        const params = new URLSearchParams();
        if (academicYear) params.append("academicYear", academicYear);
        if (term) params.append("term", term);

        const response = await axiosInstance.get(
          `/grades/results/report-card/${studentId}?${params}`
        );
        set(reportCardAtom, response.data);
        return response.data;
      } catch (error: any) {
        set(
          reportCardErrorAtom,
          error.message || "Failed to fetch report card"
        );
        throw error;
      } finally {
        set(reportCardLoadingAtom, false);
      }
    }
  ),

  // Create or update result
  createOrUpdateResult: atom(null, async (_get, set, data: any) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.post("/grades/results", data);
      // Refresh the list
      const allResults = await axiosInstance.get("/grades/results/all");
      set(gradeListAtom, allResults.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to create/update result");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  // Bulk create/update results
  bulkCreateOrUpdateResults: atom(
    null,
    async (_get, set, data: BulkGradeRequest) => {
      set(gradeLoadingAtom, true);
      set(gradeErrorAtom, null);

      try {
        const response = await axiosInstance.post("/grades/results/bulk", data);
        // Refresh the list
        const allResults = await axiosInstance.get("/grades/results/all");
        set(gradeListAtom, allResults.data);
        return response.data;
      } catch (error: any) {
        set(
          gradeErrorAtom,
          error.message || "Failed to bulk create/update results"
        );
        throw error;
      } finally {
        set(gradeLoadingAtom, false);
      }
    }
  ),

  // Delete result
  deleteResult: atom(null, async (_get, set, id: number) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      await axiosInstance.delete(`/grades/results/${id}`);
      // Refresh the list
      const allResults = await axiosInstance.get("/grades/results/all");
      set(gradeListAtom, allResults.data);
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to delete result");
      throw error;
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),
};
