import { User } from "../auth/auth-types";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
  author: User;
}

export interface AnnouncementResponse {
  limit: number;
  page: number;
  total: number;
  teachers: Array<Announcement>;
}
