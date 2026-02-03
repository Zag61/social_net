import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { ChatDto } from '../../app/entities/chat.dto';
import { DatePipe } from '@angular/common';
import { MessagesService } from '../../app/features/messages.service';
import { decodeJwtPayload } from '../../shared/helpers';

@Component({
  selector: 'app-my-chats',
  imports: [DatePipe],
  templateUrl: './my-chats.html',
  styleUrl: './my-chats.scss',
})
export class MyChats {
  private route = inject(ActivatedRoute);
  private messagesService = inject(MessagesService);
  public currentUserId = computed<string>(() => {
    const match = document.cookie.match(/access_token=([^;]+)/);
    if (!match) return null;

    const payload = decodeJwtPayload(match[1]);
    return payload?.id ?? null;
  });
  chats: ChatDto[] = this.route.snapshot.data['chats'] ?? [];
  async deleteChat(chat: ChatDto) {
    try {
      const res = await firstValueFrom(this.messagesService.deleteChat(chat.user.id));
      if (res.success) {
        this.chats = this.chats.filter(c => c.user.id !== chat.user.id);
      }
    } catch (err) {
      console.error('Failed to delete chat', err);
    }
  }

}
