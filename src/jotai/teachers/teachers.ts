/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { Teacher, TeachersResponse } from "./teachers-types";
import { atom } from "jotai";

/*
  |--------------------------------------------------------------------------
  | GET ALL STUDENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get student data
  |
*/
export const teacherListAtom = atom<TeachersResponse | null>(null);
export const teachersLoadingAtom = atom<boolean>(false);
export const teacherErrorAtom = atom<string | null>(null);

// Teachers API
export const teachersAPI = {
  getAll: atom(null, async (_get, set) => {
    set(teachersLoadingAtom, true);
    set(teacherErrorAtom, null);

    try {
      const response = await axiosInstance.get("/teachers");
      set(teacherListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(teacherErrorAtom, error.message || "Failed to fetch students");
    } finally {
      set(teachersLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<any> => {
    const response = await axiosInstance.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/teachers", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/teachers/${id}`);
    return response.data;
  },
};

export const enhancedTeachersAPI = {
  ...teachersAPI,
  getById: async (id: number): Promise<Teacher> => {
    const response = await axiosInstance.get(`/teachers/${id}`);
    return response.data;
  },
};
