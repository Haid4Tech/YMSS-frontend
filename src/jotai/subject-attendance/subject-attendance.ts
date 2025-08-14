/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import {
  SubjectAttendance,
  SubjectAttendanceResponse,
  CreateSubjectAttendanceData,
  UpdateSubjectAttendanceData,
} from "./subject-attendance-type";

export const subjectAttendanceListAtom = atom<SubjectAttendanceResponse | null>(
  null
);
export const subjectAttendanceLoadingAtom = atom<boolean>(false);
export const subjectAttendanceErrorAtom = atom<string | null>(null);

export const subjectAttendanceAPI = {
  getAll: atom(null, async (_get, set) => {
    set(subjectAttendanceLoadingAtom, true);
    set(subjectAttendanceErrorAtom, null);

    try {
      const response = await axiosInstance.get<SubjectAttendanceResponse>(
        "/attendance"
      );
      set(subjectAttendanceListAtom, response.data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch attendance";
      set(subjectAttendanceErrorAtom, errorMessage);
    } finally {
      set(subjectAttendanceLoadingAtom, false);
    }
  }),

  getByEnrollment: async (
    enrollmentId: number
  ): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(
      `/attendance/subject/enrollment/${enrollmentId}`
    );
    return response.data;
  },

  getBySubject: async (subjectId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(
      `/attendance/subject/${subjectId}`
    );
    return response.data;
  },

  getByStudent: async (studentId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(
      `/attendance/student/${studentId}`
    );
    return response.data;
  },

  // New method: Get attendance by class and date
  getByClassAndDate: async (classId: number, date: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/attendance/class/${classId}/date/${date}`
    );
    return response.data;
  },

  // New method: Get attendance summary for a class
  getClassAttendanceSummary: async (
    classId: number,
    startDate?: string,
    endDate?: string
  ): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await axiosInstance.get(
      `/attendance/class/${classId}/summary?${params.toString()}`
    );
    return response.data;
  },

  getByClass: async (classId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(`/attendance/class/${classId}`);
    return response.data;
  },

  create: async (
    data: CreateSubjectAttendanceData
  ): Promise<SubjectAttendance> => {
    const response = await axiosInstance.post("/attendance/subject", data);
    return response.data;
  },

  update: async (
    data: UpdateSubjectAttendanceData
  ): Promise<SubjectAttendance> => {
    const response = await axiosInstance.patch(`/attendance/${data.id}`, data);
    return response.data;
  },

  // Updated method: Take class attendance (bulk)
  takeClassAttendance: async (data: {
    classId: number;
    date: string;
    attendanceData: Array<{
      studentId: number;
      subjectId: number;
      status: string;
    }>;
  }) => {
    const response = await axiosInstance.post("/attendance/class", data);
    return response.data;
  },

  // Legacy method for backward compatibility
  markBulk: async (data: {
    subjectId: number;
    date: string;
    attendanceRecords: Array<{
      studentId: number;
      status: string;
    }>;
  }) => {
    // Convert to new format
    const classId = 1; // This should be passed from the component
    const attendanceData = data.attendanceRecords.map((record) => ({
      studentId: record.studentId,
      subjectId: data.subjectId,
      status: record.status,
    }));

    const response = await axiosInstance.post("/attendance/class", {
      classId,
      date: data.date,
      attendanceData,
    });
    return response.data;
  },

  remove: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/attendance/${id}`);
  },
};

export const enhancedSubjectAttendanceAPI = {
  ...subjectAttendanceAPI,
  getByStudent: async (studentId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(
      `/attendance/student/${studentId}`
    );
    return response.data;
  },
  getByClass: async (classId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(`/attendance/class/${classId}`);
    return response.data;
  },
};
