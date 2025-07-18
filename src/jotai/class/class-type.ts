import { Student } from "../students/student-types";
import { Subject } from "../subject/subject-types";

export interface Class {
  id: number;
  name: string;
  students: Array<Student>;
  subjects: Array<Subject>;
}

export interface ClassResponse {
  limit: number;
  page: number;
  total: number;
  class: Array<Class>;
}
