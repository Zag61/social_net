import { z } from 'zod';

export const CreateMessageWithFileSchema = z.object({
  receiverId: z.string().uuid(),
  text: z.string().min(1).max(2000),
});

export type CreateMessageWithFileDto = z.infer<typeof CreateMessageWithFileSchema>;