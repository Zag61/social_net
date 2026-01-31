import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { decodeJwtPayload } from '../../shared/helpers';
import { DatePipe } from '@angular/common';
import { MessagesService } from '../../app/features/messages.service';
import { Message, UiMessage, UploadedFile } from '../../app/entities/message';
import { plainToInstance } from 'class-transformer';

@Component({
  selector: 'app-messages-component',
  imports: [DatePipe],
  templateUrl: './messages-component.html',
  styleUrl: './messages-component.scss',
})
export class MessagesComponent {
  private route = inject(ActivatedRoute);
  private msgSevice = inject(MessagesService);
  public messagesFromResolver = toSignal<Message[] | null>(
    this.route.data.pipe(
      map(data => data['messages'] ?? null)
    ),
    { initialValue: null }
  );
  nickname = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('nickname'))
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

  messageText = signal('');
  attachedFiles = signal<File[]>([]);
  sending = signal(false);

  canSend = computed(() =>
    !this.sending() &&
    (
      this.messageText().trim().length > 0 ||
      this.attachedFiles().length > 0
    )
  );

  messages = signal<UiMessage[]>([]);

  constructor() {
    effect(() => {
      if (this.messagesFromResolver()) {
        const msgs = plainToInstance(UiMessage, this.messagesFromResolver()!.map(m => ({
          ...m,
          status: 'sent'
        })));
        this.messages.set(msgs);
      }
    });
  }
  onTextInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.messageText.set(value);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.attachedFiles.set(
      input.files ? Array.from(input.files) : []
    );
  }

  sendMessage() {
    if (!this.canSend() || !this.nickname()) return;

    const tempId = crypto.randomUUID();
    const now = new Date();

    const optimisticMessage = new UiMessage(
      tempId,                     // id
      this.currentUserId()!,       // senderId
      this.nickname()!,            // receiverId
      this.messageText(),          // text
      now,                         // sentAt
      [],                         // attachments
      'sending',                   // status
      tempId                       // tempId
    );


    this.messages.update(msgs => [...msgs, optimisticMessage]);

    const text = this.messageText();
    const files = this.attachedFiles();
    this.messageText.set('');
    this.attachedFiles.set([]);

    this.msgSevice
      .sendMessages(this.nickname()!, text, files)
      .subscribe({
        next: (res) => {
          this.messages.update(msgs =>
            msgs.map(m => m.tempId === tempId
              ? (() => {
                const updated = new UiMessage(
                  res.id,
                  m.senderId,
                  m.receiverId,
                  m.text,
                  new Date(res.sentAt),
                  res.files.map(f => new UploadedFile(f.id, f.name, f.url)),
                  'sent',
                  m.tempId
                );
                // preserve editedAt if any
                updated.setEditedAt(m.getEditedAt()!);
                return updated;
              })()
              : m
            )
          );

        },
        error: () => {
          this.messages.update(msgs =>
            msgs.map(m => m.tempId === tempId
              ? (() => {
                const failed = new UiMessage(
                  m.id,
                  m.senderId,
                  m.receiverId,
                  m.text,
                  m.sentAt,
                  m.attachments,
                  'failed',
                  m.tempId
                );
                failed.setEditedAt(m.getEditedAt()!);
                return failed;
              })()
              : m
            )
          );

        },
      });

  }

  isImage(fileName: string) {
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(fileName);
  }
  isVideo(fileName: string) {
    return /\.(mp4)$/i.test(fileName);
  }
  isAudio(fileName: string) {
    return /\.(wav|mp3)$/i.test(fileName);
  }
  getType(fileName: string) {
    return 'video/' + (fileName.split('.').pop()?.toLowerCase() ?? '');
  }
}
