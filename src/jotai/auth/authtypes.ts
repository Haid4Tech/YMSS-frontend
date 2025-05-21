import { Role } from "@/common/enum";

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

export interface SignInResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
  };
  token: string | null;
}

export interface SignUpResponse {
  user: {
    id: number;
    email: string;
    name: string;
    role: Role;
    createdAt: string;
  };

  token: string | null;
}
