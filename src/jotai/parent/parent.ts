/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { Parent } from "./parent-types";

/*
  |--------------------------------------------------------------------------
  | PARENT DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to manage parent data
  |
*/

// State atoms for consistent pattern
export const parentListAtom = atom<Array<Parent> | null>(null);
export const parentLoadingAtom = atom<boolean>(false);
export const parentErrorAtom = atom<string | null>(null);

export const parentsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(parentLoadingAtom, true);
    set(parentErrorAtom, null);

    try {
      const response = await axiosInstance.get("/parents");
      set(parentListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(parentErrorAtom, error.message || "Failed to fetch parents");
    } finally {
      set(parentLoadingAtom, false);
    }
  }),

  getById: async (id: number): Promise<Parent> => {
    const response = await axiosInstance.get(`/parents/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/parents", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await axiosInstance.patch(`/parents/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await axiosInstance.delete(`/parents/${id}`);
    return response.data;
  },
};
