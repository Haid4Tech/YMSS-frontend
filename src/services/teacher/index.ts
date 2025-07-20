export * from './TeacherService';
export { TeacherService } from './TeacherService';

// Export singleton instance for easy use
import { TeacherService } from './TeacherService';
export const teacherService = new TeacherService(); 