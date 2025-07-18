import { User } from "../auth/auth-types";
import { Class } from "../class/class-type";
import { Parent } from "../parent/parent-types";

export interface Student {
  id: number;
  userId: number;
  classId: number;
  parentId?: number;
  user: User;
  class: Class;
  parent?: Parent;
}

export interface StudentResponse {
  students: Array<Student>;
  page: number;
  limit: number;
  total: number;
}
