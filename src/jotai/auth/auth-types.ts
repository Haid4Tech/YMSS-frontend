import { Role } from "@/common/enum";

export interface UserType {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface SignUpType {
  email: string;
  password: string;
  name: string;
  role: Role | undefined;
}

export interface SignInType {
  email: string;
  password: string;
}

export interface AuthSession {
  user: UserType;
  token: string | null;
}
