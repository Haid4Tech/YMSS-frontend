import { StudentType } from "../students/student-types";
import { SubjectType } from "../subject/subject-types";

export interface ClassType {
  id: number;
  name: string;
  students: Array<StudentType>;
  subjects: Array<SubjectType>;
}
