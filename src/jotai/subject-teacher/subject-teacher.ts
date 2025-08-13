import axiosInstance from "@/utils/axios-instance";
import { atom } from "jotai";
import {
  SubjectTeacher,
  SubjectTeacherResponse,
  CreateSubjectTeacherData,
  DeleteSubjectTeacherData,
} from "@/jotai/subject-teacher/subject-teacher-type";
import { extractErrorMessage } from "@/utils/helpers";

export const subjectTeacherListAtom = atom<SubjectTeacherResponse | null>(null);
export const subjectTeacherLoadingAtom = atom<boolean>(false);
export const subjectTeacherErrorAtom = atom<string | null>(null);

export const subjectTeacherAPI = {
  getAll: atom(null, async (_get, set) => {
    set(subjectTeacherLoadingAtom, true);
    set(subjectTeacherErrorAtom, null);

    try {
      const response = await axiosInstance.get<SubjectTeacherResponse>(
        "/subject-teachers"
      );
      set(subjectTeacherListAtom, response.data);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      set(
        subjectTeacherErrorAtom,
        errorMessage || "Failed to fetch subject teachers"
      );
    } finally {
      set(subjectTeacherLoadingAtom, false);
    }
  }),

  getBySubject: async (subjectId: number): Promise<SubjectTeacher[]> => {
    const response = await axiosInstance.get(
      `/subject-teachers/subject/${subjectId}`
    );
    return response.data;
  },

  getByTeacher: async (teacherId: number): Promise<SubjectTeacher[]> => {
    const response = await axiosInstance.get(
      `/subject-teachers/teacher/${teacherId}`
    );
    return response.data;
  },

  create: async (data: CreateSubjectTeacherData): Promise<SubjectTeacher> => {
    const response = await axiosInstance.post("/subject-teachers", data);
    return response.data;
  },

  delete: async (data: DeleteSubjectTeacherData): Promise<void> => {
    await axiosInstance.delete("/subject-teachers", { data });
  },
};
