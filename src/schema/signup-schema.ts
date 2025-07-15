import { z } from "zod";
import { Role } from "@/common/enum";

export const signUpSchema = z.object({
  name: z.string({ message: "Email is required" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  role: z.nativeEnum(Role).optional(),
});
