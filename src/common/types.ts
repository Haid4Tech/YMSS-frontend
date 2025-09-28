import { Role } from "./enum";

export interface MenuStatesProp {
  logoutState: boolean;
  portalState: boolean;
  isAuthLoading: boolean;
}

export interface SignInStatesProp {
  loginState: boolean;
  portalLoginState: boolean;
  portalRedirectState: boolean;
}

export interface IStudentFormData {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  DOB?: string;
  gender: string;
  phone: string;
  religion: string;
  bloodGroup: string;
  photo?: File | null;

  street: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;

  // Student specific data
  classId?: string | null;
  parentId?: string | null;

  admissionDate: string;
  previousSchool?: string;

  conditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
  doctorName?: string | null;
  doctorPhone?: string | null;

  parentfirstname?: string;
  parentlastname?: string;
  parentphone?: string;
  parentemail: string;
  relationship?: string;
}

export interface ITeacherFormData {
  DOB: string;
  city?: string;
  degree: string;
  email: string;

  employmentType: string;
  experience: string;
  firstname: string;
  gender: string;
  graduationYear: number;
  hireDate: string;
  lastname: string;
  nationality: string;
  religion?: string;
  password?: string;
  phone: string;
  previousInstitution: string;
  role?: Role | null;

  salary: number;
  state?: string;
  street?: string;
  country?: string;
  zipcode?: string;
  subjectId?: number;
  university: string;
  photo?: File | null | string;

  // Not added yet
  maxClassesPerWeek?: number;
  preferredGrades?: string;
  qualification?: string;

  // Not added - should be added
  subjectSpecialization?: string;
}

export interface IExamFormData {
  title: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  date: string;
  startTime: string;
  duration: string | number;
  examType: string;
}

export interface IClassFormData {
  name: string;
  gradeLevel: string;
  capacity: string;
  roomNumber: string;
  description: string;
  teacherId: string;
  academicYear: string;
  schedule: {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    days: string[];
  };
  subjects: string[];
}
