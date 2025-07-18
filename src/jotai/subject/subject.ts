/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Subject } from "./subject-types";

/*
  |--------------------------------------------------------------------------
  | SUBJECT API - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get subject data
  |
*/

// State atoms for consistent pattern
export const subjectListAtom = atom<Array<Subject> | null>(null);
export const subjectLoadingAtom = atom<boolean>(false);
export const subjectErrorAtom = atom<string | null>(null);

// Subjects API
export const subjectsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(subjectLoadingAtom, true);
    set(subjectErrorAtom, null);

    try {
      const response = await axiosInstance.get("/subjects");
      set(subjectListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(subjectErrorAtom, error.message || "Failed to fetch subjects");
    } finally {
      set(subjectLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Subject> => {
    const response = await axiosInstance.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/subjects", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/subjects/${id}`);
    return response.data;
  },

  assignTeacher: async (subjectId: number, teacherId: number) => {
    const response = await axiosInstance.patch(
      `/subjects/${subjectId}/assign-teacher`,
      {
        teacherId,
      }
    );
    return response.data;
  },
};

export const enhancedSubjectsAPI = {
  ...subjectsAPI,
  getById: async (id: number): Promise<Subject> => {
    const response = await axiosInstance.get(`/subjects/${id}`);
    return response.data;
  },
};
