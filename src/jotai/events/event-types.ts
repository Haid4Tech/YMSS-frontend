import { User } from "../auth/auth-types";

export interface Event {
  id: number;
  title: string;
  description?: string;
  date: string;
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
  category?: string;  // Event category
  color?: string;     // Hex color code
  createdAt: string;
  createdById: number;
  createdBy?: User;
}
