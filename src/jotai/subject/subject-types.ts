import { Class } from "../class/class-type";
import { Teacher } from "../teachers/teachers-types";

export interface Subject {
  id: number;
  name: string;
  classId?: number;
  teacherId?: number;
  class?: Class;
  teacher?: Teacher;
}
