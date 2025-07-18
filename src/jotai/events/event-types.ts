import { User } from "../auth/auth-types";

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  createdById: number;
  createdBy: User;
}
