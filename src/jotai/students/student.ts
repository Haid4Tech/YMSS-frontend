/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Student, StudentResponse } from "./student-types";

/*
  |--------------------------------------------------------------------------
  | GET ALL STUDENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get student data
  |
*/
export const studentListAtom = atom<StudentResponse | null>(null);
export const studentLoadingAtom = atom<boolean>(false);
export const studentErrorAtom = atom<string | null>(null);

export const studentsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(studentLoadingAtom, true);
    set(studentErrorAtom, null);

    try {
      const response = await axiosInstance.get<StudentResponse>("/students");
      set(studentListAtom, response.data);
    } catch (error: any) {
      set(studentErrorAtom, error.message || "Failed to fetch students");
    } finally {
      set(studentLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<any> => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/students", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/students/${id}`);
    return response.data;
  },
};

// Enhanced API methods for detail pages
export const enhancedStudentsAPI = {
  ...studentsAPI,
  getById: async (id: number): Promise<Student> => {
    const response = await axiosInstance.get(`/students/${id}`);
    return response.data;
  },
};
