/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Grade } from "./grades-types";

/*
  |--------------------------------------------------------------------------
  | GRADES - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to manage grades data
  |
*/

// State atoms for consistent pattern
export const gradeListAtom = atom<Array<Grade> | null>(null);
export const gradeLoadingAtom = atom<boolean>(false);
export const gradeErrorAtom = atom<string | null>(null);

export const gradesAPI = {
  getAll: atom(null, async (_get, set) => {
    set(gradeLoadingAtom, true);
    set(gradeErrorAtom, null);

    try {
      const response = await axiosInstance.get("/grades");
      set(gradeListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(gradeErrorAtom, error.message || "Failed to fetch grades");
    } finally {
      set(gradeLoadingAtom, false);
    }
  }),

  getByStudent: atom(async (studentId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades/${studentId}`);
    return response.data;
  }),

  getBySubject: atom(async (subjectId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades/subject/${subjectId}`);
    return response.data;
  }),

  getByExam: atom(async (examId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades/exam/${examId}`);
    return response.data;
  }),

  assign: atom(async (data: any) => {
    const response = await axiosInstance.post("/grades", data);
    return response.data;
  }),

  update: atom(async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/grades/${id}`, data);
    return response.data;
  }),
};

export const enhancedGradesAPI = {
  ...gradesAPI,
  getByStudent: async (studentId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades?studentId=${studentId}`);
    return response.data;
  },
  getByClass: async (classId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades?classId=${classId}`);
    return response.data;
  },
  getBySubject: async (subjectId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades?subjectId=${subjectId}`);
    return response.data;
  },
  getByExam: async (examId: number): Promise<Grade[]> => {
    const response = await axiosInstance.get(`/grades?examId=${examId}`);
    return response.data;
  },
};
