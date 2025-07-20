export * from './TeacherRepository';
export { TeacherRepository } from './TeacherRepository';

// Export singleton instance for easy use
import { TeacherRepository } from './TeacherRepository';
export const teacherRepository = new TeacherRepository(); 