import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { 
  SubjectAttendance, 
  SubjectAttendanceResponse, 
  CreateSubjectAttendanceData, 
  UpdateSubjectAttendanceData 
} from "@/types/subject-attendance";

export const subjectAttendanceListAtom = atom<SubjectAttendanceResponse | null>(null);
export const subjectAttendanceLoadingAtom = atom<boolean>(false);
export const subjectAttendanceErrorAtom = atom<string | null>(null);

export const subjectAttendanceAPI = {
  getAll: atom(null, async (_get, set) => {
    set(subjectAttendanceLoadingAtom, true);
    set(subjectAttendanceErrorAtom, null);

    try {
      const response = await axiosInstance.get<SubjectAttendanceResponse>("/attendance");
      set(subjectAttendanceListAtom, response.data);
    } catch (error: any) {
      set(subjectAttendanceErrorAtom, error.message || "Failed to fetch attendance");
    } finally {
      set(subjectAttendanceLoadingAtom, false);
    }
  }),

  getByEnrollment: async (enrollmentId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(`/attendance/enrollment/${enrollmentId}`);
    return response.data;
  },

  getBySubject: async (subjectId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(`/attendance/subject/${subjectId}`);
    return response.data;
  },

  getByStudent: async (studentId: number): Promise<SubjectAttendance[]> => {
    const response = await axiosInstance.get(`/attendance/student/${studentId}`);
    return response.data;
  },

  create: async (data: CreateSubjectAttendanceData): Promise<SubjectAttendance> => {
    const response = await axiosInstance.post("/attendance/subject", data);
    return response.data;
  },

  update: async (data: UpdateSubjectAttendanceData): Promise<SubjectAttendance> => {
    const response = await axiosInstance.patch(`/attendance/${data.id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/attendance/${id}`);
  },
}; 