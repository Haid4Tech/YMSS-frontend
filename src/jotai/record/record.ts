/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { AcademicRecord } from "./record-types";
import { atom } from "jotai";

/*
  |--------------------------------------------------------------------------
  | RECORDS API - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to manage academic records data
  |
*/

// State atoms for consistent pattern
export const recordListAtom = atom<Array<AcademicRecord> | null>(null);
export const recordLoadingAtom = atom<boolean>(false);
export const recordErrorAtom = atom<string | null>(null);

export const recordsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(recordLoadingAtom, true);
    set(recordErrorAtom, null);

    try {
      const response = await axiosInstance.get("/records");
      set(recordListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(recordErrorAtom, error.message || "Failed to fetch records");
    } finally {
      set(recordLoadingAtom, false);
    }
  }),

  getByStudent: async (studentId: number): Promise<AcademicRecord[]> => {
    const response = await axiosInstance.get(`/records/${studentId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await axiosInstance.post("/records", data);
    return response.data;
  },
};
