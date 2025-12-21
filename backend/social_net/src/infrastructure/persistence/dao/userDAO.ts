import { email, z } from 'zod';

export const UserRowSchema = z.object({
  id: z.string(),
  email: z.email().optional().nullable(),
  password_hash: z.string(),
  nickname: z.string(),
  about_info: z.string().nullable().optional(),
  phone_number: z.string().nullable().optional(),
  avatar_file_id: z.string().nullable().optional(),
  verified: z.boolean().optional(),
  verification_token: z.string().nullable().optional(),
});

export type UserRow = z.infer<typeof UserRowSchema>;
