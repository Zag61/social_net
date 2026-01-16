import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Data } from '@angular/router';
import { map, Observable } from 'rxjs';
import { decodeJwtPayload } from '../../shared/helpers';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-messages-component',
  imports: [DatePipe],
  templateUrl: './messages-component.html',
  // template:`
  // <h1>{{ messages()?[0].text}}</h1>
  // `,
  styleUrl: './messages-component.scss',
})
export class MessagesComponent {
  private route = inject(ActivatedRoute);
  public messages = toSignal<Message[] | null>(
    this.route.data.pipe(
      map(data => data['messages'] ?? null)
    ),
    { initialValue: null }
  );
  public currentUserId = computed<string | null>(() => {
  const match = document.cookie.match(/access_token=([^;]+)/);
  if (!match) return null;

  const payload = decodeJwtPayload(match[1]);
  return payload?.id ?? null;
});

  isOwnMessage = (msg: Message) =>
    msg.senderId === this.currentUserId();
}
