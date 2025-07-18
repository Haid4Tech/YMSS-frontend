import { User } from "../auth/auth-types";
import { Subject } from "../subject/subject-types";

export interface Teacher {
  id: number;
  subjects: Array<Subject>;
  user: User;
  userId: number;
}

export interface TeachersResponse {
  limit: number;
  page: number;
  total: number;
  teachers: Array<Teacher>;
}
