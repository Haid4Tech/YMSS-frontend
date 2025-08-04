/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { loadable } from "jotai/utils";

import { Class } from "./class-type";

/*
  |--------------------------------------------------------------------------
  | GET ALL STUDENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to get student data
  |
*/
// Get all classes
export const getAllClassAtom = atom(async () => {
  try {
    const response = await axiosInstance.get(`/classes`);
    return response.data;
  } catch (error) {
    throw error;
  }
});
// Loadable atom to track class changes in state
export const allClassLoadableAtom = loadable(getAllClassAtom);

// create class
export const createClassAtom = atom(null, async (_get, _set, payload) => {
  try {
    const response = await axiosInstance.post(`/classes`, payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create class:", error);
    throw error;
  }
});

// delete specific class
export const deleteClassAtom = atom(
  null,
  async (_get, _set, classId: number) => {
    try {
      const response = await axiosInstance.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete class:", error);
      throw error;
    }
  }
);

// State atoms for consistent pattern
export const classListAtom = atom<Array<Class> | null>(null);
export const classLoadingAtom = atom<boolean>(false);
export const classErrorAtom = atom<string | null>(null);

export const classesAPI = {
  getAll: atom(null, async (_get, set) => {
    set(classLoadingAtom, true);
    set(classErrorAtom, null);

    try {
      const response = await axiosInstance.get("/classes");
      set(classListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(classErrorAtom, error.message || "Failed to fetch classes");
    } finally {
      set(classLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Class> => {
    const response = await axiosInstance.get(`/classes/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/classes", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/classes/${id}`);
    return response.data;
  },
};
