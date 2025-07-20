import { Role } from "@/common/enum";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;

  // Additional fields used in the application
  phone?: string;
  bio?: string;
  profileImage?: string;
  dateOfBirth?: string;
  address?: string;
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
