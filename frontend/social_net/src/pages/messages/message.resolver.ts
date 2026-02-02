import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { UserService } from "../../app/features/user.service";
import { firstValueFrom } from "rxjs";
import { UiMessage } from "../../app/entities/message";
export const messageResolver: ResolveFn<UiMessage[]> = async (route) => {
  const userService = inject(UserService);
  const nickname = route.paramMap.get('nickname')!;

  const raw = await firstValueFrom(userService.getMessages(nickname));

  return raw.map(m =>
    new UiMessage(
      m.id,
      m.senderId,
      m.receiverId,
      m.text,
      new Date(m.sentAt),
      m.attachments,
      'sent'
    )
  );
};
