/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Exam } from "./exams-type";

/*
  |--------------------------------------------------------------------------
  | GET EXAMS DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get exams data
  |
*/

// State atoms for consistent pattern
export const examListAtom = atom<Array<Exam> | null>(null);
export const examLoadingAtom = atom<boolean>(false);
export const examErrorAtom = atom<string | null>(null);

export const examsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(examLoadingAtom, true);
    set(examErrorAtom, null);

    try {
      const response = await axiosInstance.get("/exams");
      set(examListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(examErrorAtom, error.message || "Failed to fetch exams");
    } finally {
      set(examLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Exam> => {
    const response = await axiosInstance.get(`/exams/${id}`);
    return response.data;
  },

  getByStudentId: async (studentId: number): Promise<Exam[]> => {
    const response = await axiosInstance.get(`/exams/student/${studentId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/exams", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/exams/${id}`);
    return response.data;
  },
};

export const enhancedExamsAPI = {
  ...examsAPI,
  getById: async (id: number): Promise<Exam> => {
    const response = await axiosInstance.get(`/exams/${id}`);
    return response.data;
  },
};
