import { Role } from "@/common/enum";

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
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

export interface AuthSession {
  user: User;
  token: string | null;
}
