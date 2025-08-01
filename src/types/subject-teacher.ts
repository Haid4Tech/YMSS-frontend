import { Teacher } from "@/jotai/teachers/teacher-types";
import { Subject } from "@/jotai/subject/subject-types";

export interface SubjectTeacher {
  id: number;
  subjectId: number;
  teacherId: number;
  subject: Subject;
  teacher: Teacher;
}

export interface SubjectTeacherResponse {
  subjectTeachers: SubjectTeacher[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateSubjectTeacherData {
  subjectId: number;
  teacherId: number;
}

export interface DeleteSubjectTeacherData {
  subjectId: number;
  teacherId: number;
} 