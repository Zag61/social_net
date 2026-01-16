import { z } from 'zod';

export const CreateUserDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(5, 'Password must be at least 5 characters'),
  nickname: z.string().min(2, 'Nickname must be at least 2 characters'),
});

export type CreateUserDto = z.infer<typeof CreateUserDtoSchema>;

export const LoginDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export interface PublicUser {
  id: string;
  nickname: string;
  aboutInfo?: string | null;
  avatarFileId?: string | null;
  createdAt: string; // ISO string
}

export interface PublicData {
  postsCount: number;
  friendsCount: number;
  nickname: string;
  created_at: string;
  aboutInfo: string;
}

export interface OwnerUser extends PublicUser {
  email: string;
  phoneNumber?: string | null;
  verified: boolean;
}
