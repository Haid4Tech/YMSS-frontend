import { UserType } from "../auth/auth-types";
import { ClassType } from "../class/class-type";
import { ParentType } from "../parent/parenttypes";

export interface Student {
  id: number;
  userId: number;
  classId: number;
  parentId: number;
  user: UserType;
  class: ClassType;
  parent: ParentType;
}

export interface GetStudentResponse {
  students: Array<Student>;
}
