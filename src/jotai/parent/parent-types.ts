import { Student } from "../students/student-types";
import { User } from "../auth/auth-types";

export interface Parent {
  id: number;
  userId: number;
  user: User;
  students?: Array<Student>;
}

export interface CreateParentProp {
  userId: number;
}
