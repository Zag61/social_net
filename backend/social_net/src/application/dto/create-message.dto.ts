// src/messages/schemas/create-message.schema.ts
import { z } from 'zod';

export const CreateMessageSchema = z.object({
  receiverId: z.string().uuid(),
  text: z.string().min(1).max(2000),
});

export type CreateMessageDto = z.infer<typeof CreateMessageSchema>;