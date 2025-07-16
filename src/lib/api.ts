/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { UserType } from "@/jotai/auth/auth-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        window.location.href = "/portal/signin";
      }
    }
    return Promise.reject(error);
  }
);

// Re-export UserType for backward compatibility
export type User = UserType;

export interface StudentResponse {
  students: Student;
  page: number;
  limit: number;
  total: number;
}

export interface Student {
  id: number;
  userId: number;
  classId: number;
  parentId?: number;
  user: User;
  class: Class;
  parent?: Parent;
}

export interface Teacher {
  id: number;
  userId: number;
  user: User;
  subjects?: Subject[];
}

export interface Parent {
  id: number;
  userId: number;
  user: User;
  students?: Student[];
}

export interface Class {
  id: number;
  name: string;
  students?: Student[];
  subjects?: Subject[];
}

export interface Subject {
  id: number;
  name: string;
  classId?: number;
  teacherId?: number;
  class?: Class;
  teacher?: Teacher;
}

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

export interface Grade {
  id: number;
  studentId: number;
  examId: number;
  value: number;
  date: string;
  student: Student;
  exam: Exam;
}

export interface Attendance {
  id: number;
  studentId: number;
  date: string;
  present: boolean;
  student: Student;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
  author: User;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  createdById: number;
  createdBy: User;
}

export interface AcademicRecord {
  id: number;
  studentId: number;
  year: number;
  term: "FIRST" | "SECOND" | "THIRD";
  summary: string;
  student: Student;
}

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post("/auth/login", data);
    if (response.data.token) {
      localStorage.setItem("authToken", response.data.token);
    }
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("authToken");
  },
};

// Students API
export const studentsAPI = {
  getAll: async (): Promise<StudentResponse> => {
    const response = await api.get("/students");
    return response.data;
  },

  getById: async (id: number): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/students", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/students/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },
};

// Teachers API
export const teachersAPI = {
  getAll: async (): Promise<Teacher[]> => {
    const response = await api.get("/teachers");
    return response.data;
  },

  getById: async (id: number): Promise<Teacher> => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/teachers", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/teachers/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },
};

// Parents API
export const parentsAPI = {
  getAll: async (): Promise<Parent[]> => {
    const response = await api.get("/parents");
    return response.data;
  },

  getById: async (id: number): Promise<Parent> => {
    const response = await api.get(`/parents/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/parents", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/parents/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/parents/${id}`);
    return response.data;
  },
};

// Classes API
export const classesAPI = {
  getAll: async (): Promise<Class[]> => {
    const response = await api.get("/classes");
    return response.data;
  },

  getById: async (id: number): Promise<Class> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/classes", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/classes/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },
};

// Subjects API
export const subjectsAPI = {
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get("/subjects");
    return response.data;
  },

  getById: async (id: number): Promise<Subject> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/subjects", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/subjects/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  assignTeacher: async (subjectId: number, teacherId: number) => {
    const response = await api.patch(`/subjects/${subjectId}/assign-teacher`, {
      teacherId,
    });
    return response.data;
  },
};

// Exams API
export const examsAPI = {
  getAll: async (): Promise<Exam[]> => {
    const response = await api.get("/exams");
    return response.data;
  },

  getById: async (id: number): Promise<Exam> => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  getByStudentId: async (studentId: number): Promise<Exam[]> => {
    const response = await api.get(`/exams/student/${studentId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/exams", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/exams/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },
};

// Grades API
export const gradesAPI = {
  getAll: async (): Promise<Grade[]> => {
    const response = await api.get("/grades");
    return response.data;
  },

  getByStudent: async (studentId: number): Promise<Grade[]> => {
    const response = await api.get(`/grades/${studentId}`);
    return response.data;
  },

  getBySubject: async (subjectId: number): Promise<Grade[]> => {
    const response = await api.get(`/grades/subject/${subjectId}`);
    return response.data;
  },

  getByExam: async (examId: number): Promise<Grade[]> => {
    const response = await api.get(`/grades/exam/${examId}`);
    return response.data;
  },

  assign: async (data: any) => {
    const response = await api.post("/grades", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/grades/${id}`, data);
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (): Promise<Attendance[]> => {
    const response = await api.get("/attendance");
    return response.data;
  },

  getByStudent: async (studentId: number): Promise<Attendance[]> => {
    const response = await api.get(`/attendance/${studentId}`);
    return response.data;
  },

  mark: async (data: any) => {
    const response = await api.post("/attendance", data);
    return response.data;
  },
};

// Announcements API
export const announcementsAPI = {
  getAll: async (): Promise<Announcement[]> => {
    const response = await api.get("/announcements");
    return response.data;
  },

  getById: async (id: number): Promise<Announcement> => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/announcements", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/announcements/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    const response = await api.get("/events");
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/events", data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// Academic Records API
export const recordsAPI = {
  getAll: async (): Promise<AcademicRecord[]> => {
    const response = await api.get("/records");
    return response.data;
  },

  getByStudent: async (studentId: number): Promise<AcademicRecord[]> => {
    const response = await api.get(`/records/${studentId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post("/records", data);
    return response.data;
  },
};

export default api;
