import { UserType } from "../auth/auth-types";
import { ClassType } from "../class/class-type";
import { Parent } from "../parent/parenttypes";

export interface StudentType {
  id: number;
  userId: number;
  classId: number;
  parentId: number;
  user: UserType;
  class: ClassType;
  parent: Parent;
}

export interface GetStudentResponse {
  students: Array<StudentType>;
}

export interface loadableStudentResponseProp {
  data: {
    limit: number;
    page: number;
    students: Array<StudentType>;
    total: number;
  };
}
