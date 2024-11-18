import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().trim().min(6).max(20),
});

export const registerSchema = z.object({
  username: z.string().trim().min(3),
  email: z.string().email(),
  password: z.string().trim().min(6),
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
});

