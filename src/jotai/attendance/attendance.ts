/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { Attendance } from "./attendance-type";
import { atom } from "jotai";

/*
  |--------------------------------------------------------------------------
  | ATTENDANCE DATA - JOTAI
  |--------------------------------------------------------------------------
  | Consuming apis to manage attendance data
  |
*/

// State atoms for consistent pattern
export const attendanceListAtom = atom<Array<Attendance> | null>(null);
export const attendanceLoadingAtom = atom<boolean>(false);
export const attendanceErrorAtom = atom<string | null>(null);

export const attendanceAPI = {
  getAll: atom(null, async (_get, set) => {
    set(attendanceLoadingAtom, true);
    set(attendanceErrorAtom, null);

    try {
      const response = await axiosInstance.get("/attendance");
      set(attendanceListAtom, response.data);
      return response.data;
    } catch (error: any) {
      set(attendanceErrorAtom, error.message || "Failed to fetch attendance");
    } finally {
      set(attendanceLoadingAtom, false);
    }
  }),

  getByStudent: async (studentId: number): Promise<Attendance[]> => {
    const response = await axiosInstance.get(`/attendance/${studentId}`);
    return response.data;
  },

  mark: async (data: any) => {
    const response = await axiosInstance.post("/attendance", data);
    return response.data;
  },
};

export const enhancedAttendanceAPI = {
  ...attendanceAPI,
  getByStudent: async (studentId: number): Promise<Attendance[]> => {
    const response = await axiosInstance.get(
      `/attendance?studentId=${studentId}`
    );
    return response.data;
  },
  getByClass: async (classId: number): Promise<Attendance[]> => {
    const response = await axiosInstance.get(`/attendance?classId=${classId}`);
    return response.data;
  },
};
