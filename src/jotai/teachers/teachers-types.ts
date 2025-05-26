import { UserType } from "../auth/auth-types";
import { SubjectType } from "../subject/subject-types";

export interface TeacherType {
  id: number;
  subjects: SubjectType[];
  user: UserType;
  userId: number;
}

export interface TeachersResponse {
  state: "hasDate" | "loading" | "hasError";
  data: {
    limit: number;
    page: number;
    total: number;
    teachers: TeacherType[];
  };
}
