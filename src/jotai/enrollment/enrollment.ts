import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import { 
  Enrollment, 
  EnrollmentResponse, 
  CreateEnrollmentData, 
  DeleteEnrollmentData 
} from "@/types/enrollment";

export const enrollmentListAtom = atom<EnrollmentResponse | null>(null);
export const enrollmentLoadingAtom = atom<boolean>(false);
export const enrollmentErrorAtom = atom<string | null>(null);

export const enrollmentsAPI = {
  getAll: atom(null, async (_get, set) => {
    set(enrollmentLoadingAtom, true);
    set(enrollmentErrorAtom, null);

    try {
      const response = await axiosInstance.get<EnrollmentResponse>("/enrollments");
      set(enrollmentListAtom, response.data);
    } catch (error: any) {
      set(enrollmentErrorAtom, error.message || "Failed to fetch enrollments");
    } finally {
      set(enrollmentLoadingAtom, false);
    }
  }),

  getByStudent: async (studentId: number): Promise<Enrollment[]> => {
    const response = await axiosInstance.get(`/enrollments/student/${studentId}`);
    return response.data;
  },

  getBySubject: async (subjectId: number): Promise<Enrollment[]> => {
    const response = await axiosInstance.get(`/enrollments/subject/${subjectId}`);
    return response.data;
  },

  create: async (data: CreateEnrollmentData): Promise<Enrollment> => {
    const response = await axiosInstance.post("/enrollments", data);
    return response.data;
  },

  delete: async (data: DeleteEnrollmentData): Promise<void> => {
    await axiosInstance.delete(`/enrollments/${data.id}`);
  },
}; 