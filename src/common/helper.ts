import { Role } from "./enum";

// Mapping role to url
export const roleRedirectMap: Record<Role, string> = {
  [Role.ADMIN]: "/admin",
  [Role.PARENT]: "/parent",
  [Role.STUDENT]: "/student",
  [Role.TEACHER]: "/teacher",
};
