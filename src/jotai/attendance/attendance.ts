/* eslint-disable @typescript-eslint/no-explicit-any */
import { Attendance } from "./attendance-types";
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { extractErrorMessage } from "@/utils/helpers";

/*
  |--------------------------------------------------------------------------
  | ATTENDANCE STORE (JOTAI)
  |--------------------------------------------------------------------------
  | Consuming APIs for attendance management
  |
*/
export const attendanceListAtom = atom<Array<Attendance> | null>(null);
export const attendanceLoadingAtom = atom<boolean>(false);
export const attendanceErrorAtom = atom<string | null>(null);

export const attendanceAPI = {
  // 🔹 Get all attendance
  getAll: atom(null, async (_get, set) => {
    set(attendanceLoadingAtom, true);
    set(attendanceErrorAtom, null);

    try {
      const response = await axiosInstance.get("/attendance");
      set(attendanceListAtom, response.data);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set(attendanceErrorAtom, errorMessage);
      console.error(errorMessage);
    } finally {
      set(attendanceLoadingAtom, false);
    }
  }),

  // 🔹 Get attendance by ID
  getById: async (id: number): Promise<Attendance> => {
    const response = await axiosInstance.get(`/attendance/${id}`);
    return response.data;
  },

  // 🔹 Get attendance by class & date
  getByClassIdDate: async (
    classId: number,
    date: string | Date
  ): Promise<Attendance[]> => {
    try {
      const response = await axiosInstance.get(
        `/attendance/class/${classId}/date/${date}`
      );
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Create attendance
  createAttendance: async (data: {
    studentId: number;
    classId: number;
    date: string | Date;
    status: string;
    notes?: string;
  }): Promise<Attendance> => {
    try {
      const response = await axiosInstance.post("/attendance", data);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Create bulk attendance
  createBulkAttendance: async (data: {
    classId: number;
    date: string | Date;
    attendanceRecords: Array<{
      studentId: number;
      status: string;
      notes?: string;
    }>;
  }): Promise<{ message: string; attendance: Attendance[]; totalRecords: number }> => {
    try {
      const response = await axiosInstance.post("/attendance/bulk", data);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Update attendance by ID
  updateAttendance: async (
    id: number,
    updates: {
      status: string;
      notes?: string;
    }
  ): Promise<Attendance> => {
    try {
      const response = await axiosInstance.put(`/attendance/${id}`, updates);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Get attendance by student
  getByStudent: async (studentId: number): Promise<Attendance[]> => {
    try {
      const response = await axiosInstance.get(`/attendance/student/${studentId}`);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Get attendance statistics for a class
  getStats: async (classId: number, startDate?: string, endDate?: string): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axiosInstance.get(`/attendance/class/${classId}/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Update attendance by class and date
  updateAttendanceByClassAndDate: async (
    classId: number,
    date: string | Date,
    records: any
  ): Promise<Attendance> => {
    try {
      const response = await axiosInstance.put(
        `/attendance/class/${classId}/date/${date}`,
        { records }
      );
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },

  // 🔹 Delete attendance
  deleteAttendance: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/attendance/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error(errorMessage);
      throw error;
    }
  },
};
