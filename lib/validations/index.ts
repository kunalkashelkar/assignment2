import { z } from "zod";

export const UserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email(),
  role: z.enum(["user", "admin"]).default("user"),
});

export type UserInput = z.infer<typeof UserSchema>;
