import { Role } from "@/common/enum";

export interface User {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: Role;
  createdAt: string;
  gender: string;
  DOB: string;

  // Additional fields used in the application
  phone?: string;
  religion?: string;
  bloodGroup?: string;
  profileImage?: string;
  nationality?: string;
  street?: string;
  city?: string;
  zipcode?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  lastLogin?: string;
  updatedAt?: string;
}

export interface SignUpProps {
  email: string;
  password: string;
  name: string;
  role: Role | undefined | string;
}

export interface SignInProps {
  email: string;
  password: string;
}

interface UserRole {
  id: number;
  userId: number;
}

export interface AuthSession {
  user: User;
  token: string | null;
  teacher: UserRole;
}
