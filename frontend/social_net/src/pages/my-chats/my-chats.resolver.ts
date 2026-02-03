import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { MessagesService } from "../../app/features/messages.service";
import { ChatDto } from "../../app/entities/chat.dto";
export const chatResolver: ResolveFn<ChatDto[]> = async () => {
  const messagesService = inject(MessagesService);
  const info = await firstValueFrom(messagesService.getChats());
  return info;
};
