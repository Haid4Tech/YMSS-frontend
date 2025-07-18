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
  
  // Additional fields used in the application
  totalMarks?: number;
  duration?: number; // in minutes
  description?: string;
  instructions?: string;
  startTime?: string;
  endTime?: string;
  examType?: string; // 'quiz', 'midterm', 'final', etc.
  passingMarks?: number;
  isPublished?: boolean;
}
