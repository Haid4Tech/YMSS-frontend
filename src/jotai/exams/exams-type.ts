import { Subject } from "../subject/subject-types";
import { Class } from "../class/class-type";
import { Teacher } from "../teachers/teachers-types";
import { Grade } from "../grades/grades-types";

export interface Exam {
  id: number;
  title: string;
  date: string;
  teacherId: number;
  classId: number;
  subjectId: number;
  class: Class;
  teacher: Teacher;
  subject: Subject;
  createdAt: string;
  grades: Array<Grade>;

  startTime?: string;
  endTime?: string;
  examType?: string; // 'quiz', 'midterm', 'final', etc.
  duration?: number; // in minutes

  instructions?: string;
}
