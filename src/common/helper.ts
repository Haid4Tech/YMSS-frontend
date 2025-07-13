import { Role } from "./enum";
import dayjs from "dayjs";
import { getDefaultStore } from "jotai";
import { authPersistedAtom } from "@/jotai/auth/auth";

// Mapping role to url
export const roleRedirectMap: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
  [Role.PARENT]: "/parent",
  [Role.STUDENT]: "/student",
  [Role.TEACHER]: "/teacher",
};

// Get user auth token
type AuthPersisted = { token?: string | null };

export const getToken = () => {
  const store = getDefaultStore();
  const result = store.get(authPersistedAtom) as AuthPersisted;
  return result?.token || null;
};

// Formatted Date
export const formatDate = (date: Date | string): string => {
  if (!date) return "";
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return dayjs(parsedDate).format("DD-MMM-YYYY");
};
