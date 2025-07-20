export * from './StudentRepository';
export { StudentRepository } from './StudentRepository';

// Export singleton instance for easy use
import { StudentRepository } from './StudentRepository';
export const studentRepository = new StudentRepository(); 