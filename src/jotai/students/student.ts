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
const studentListRequestAtom = atom(0);

export interface StudentSearchParams {
  search?: string;
  classId?: number;
}

export const studentsAPI = {
  getAll: atom(
    null,
    async (get, set, params?: StudentSearchParams, signal?: AbortSignal) => {
      const request = get(studentListRequestAtom) + 1;
      set(studentListRequestAtom, request);
      set(studentLoadingAtom, true);
      set(studentErrorAtom, null);

      try {
        const response = await axiosInstance.get<StudentResponse>("/students", {
          params,
          signal,
        });
        if (!signal?.aborted && get(studentListRequestAtom) === request) {
          set(studentListAtom, response.data);
        }
      } catch (error: any) {
        if (!signal?.aborted && get(studentListRequestAtom) === request) {
          set(studentErrorAtom, error.message || "Failed to fetch students");
        }
      } finally {
        if (get(studentListRequestAtom) === request) set(studentLoadingAtom, false);
      }
    }
  ),

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

  getStudentsByClass: async (classId: number, academicYear?: string): Promise<Student[]> => {
    const response = await axiosInstance.get(`/students/${classId}/class`, { params: { academicYear } });
    return response.data;
  },

  getParents: async (studentId: number) => {
    const response = await axiosInstance.get(`/students/${studentId}/parents`);
    return response.data;
  },

  getByUserId: async (userId: number): Promise<Student | null> => {
    try {
      const response = await axiosInstance.get<StudentResponse>("/students");
      const students = response.data.students || [];
      return students.find((student: Student) => student.userId === userId) || null;
    } catch (error) {
      console.error("Error fetching student by userId:", error);
      return null;
    }
  },

  // getBySubjects: async (subjectId: number) => {},
};
