import { User } from "../auth/auth-types";

export interface Parent {
  id: number;
  userId: number;
  user: User;
}

export interface CreateParentProp {
  userId: number;
}

export interface ParentStudentResponse {
  id: number;
  parent: { user: User };
  studentId: number;
  parentId: number;
}
