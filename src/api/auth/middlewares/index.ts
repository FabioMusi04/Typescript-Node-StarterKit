import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters long" }).max(20, { message: "Password must be at most 20 characters long" }),
});

export const registerSchema = z.object({
  username: z.string().trim().min(3, { message: "Username must be at least 3 characters long" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().trim().min(6, { message: "Password must be at least 6 characters long" }).max(20, { message: "Password must be at most 20 characters long" }),
  firstName: z.string().trim().min(2, { message: "First name must be at least 2 characters long" }),
  lastName: z.string().trim().min(2, { message: "Last name must be at least 2 characters long" }),
});
