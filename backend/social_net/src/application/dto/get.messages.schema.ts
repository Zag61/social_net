// src/messages/schemas/get-messages.schema.ts
import { z } from 'zod';

export const GetMessagesSchema = z.object({
  peerNickname: z.string(), // the other participant's user id
  limit: z.string()
    .optional()
    .transform(val => (val ? Number(val) : undefined))
    .pipe(z.number().int().min(1).max(200).default(50)),
});
export type GetMessagesQuery = z.infer<typeof GetMessagesSchema>;
