// Base repository
export * from './base';

// Entity repositories
export * from './teacher';
export * from './student';

// Easy imports for repository instances
export { teacherRepository } from './teacher';
export { studentRepository } from './student';

// You can add more repositories as you create them:
// export * from './parent';
// export * from './class';
// export * from './subject';
// export * from './exam';
// export * from './grade';
// export * from './attendance';
// export * from './announcement';
// export * from './event'; 