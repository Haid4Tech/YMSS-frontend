import { Role } from "./enum";
import { getDefaultStore } from "jotai";
import { authResultAtom } from "@/jotai/auth/auth";

// Mapping role to url
export const roleRedirectMap: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
  [Role.PARENT]: "/parent",
  [Role.STUDENT]: "/student",
  [Role.TEACHER]: "/teacher",
};

// Get user auth token
export const getToken = () => {
  const store = getDefaultStore();
  const result = store.get(authResultAtom);
  return result?.token;
};
