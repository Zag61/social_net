import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ChatDto } from '../../app/entities/chat.dto';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-chats',
  imports: [DatePipe],
  templateUrl: './my-chats.html',
  styleUrl: './my-chats.scss',
})
export class MyChats {
  private route = inject(ActivatedRoute);
   chats: ChatDto[] = this.route.snapshot.data['chats'] ?? [];
}
