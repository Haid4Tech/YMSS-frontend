import { Role } from "@/common/enum";

export interface UserManagement {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  lastLogin?: string;

  // Additional fields for user management
  phone?: string;
  photo?: string;
  bio?: string;
  profileImage?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface UserResponse {
  users?: Array<UserManagement>;
  user?: UserManagement;
  page?: number;
  limit?: number;
  total?: number;
  message?: string;
}

export interface CreateUserProps {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
}

export interface UpdateUserProps {
  name?: string;
  email?: string;
  role?: Role;
  password?: string;
  phone?: string;
  bio?: string;
  dateOfBirth?: string;
  address?: string;
  isActive?: boolean;
}

export interface UserFilters {
  role?: Role;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
