import { Subject } from "../subject/subject-types";
import { Class } from "../class/class-type";

export interface Exam {
  id: number;
  title: string;
  date: string;
  classId: number;
  subjectId: number;
  class: Class;
  subject: Subject;
  createdAt: string;
}
