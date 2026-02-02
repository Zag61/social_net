import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, Subscription } from 'rxjs';
import { decodeJwtPayload } from '../../shared/helpers';
import { DatePipe } from '@angular/common';
import { MessagesService } from '../../app/features/messages.service';
import { Message, UiMessage, UploadedFile } from '../../app/entities/message';
import { plainToInstance } from 'class-transformer';
import { WsMessagesService } from '../../app/features/ws-messages.service';

@Component({
  selector: 'app-messages-component',
  imports: [DatePipe],
  templateUrl: './messages-component.html',
  styleUrl: './messages-component.scss',
})
export class MessagesComponent {
  private route = inject(ActivatedRoute);
  private msgSevice = inject(MessagesService);
  private ws = inject(WsMessagesService);
  private subs = new Subscription();
  private mediaRecorder?: MediaRecorder;
  private audioChunks: Blob[] = [];

  isRecording = signal(false);

  public messagesFromResolver = toSignal<UiMessage[] | null>(
  this.route.data.pipe(map(d => d['messages'])),
  { initialValue: null }
);

constructor() {
  effect(() => {
    const resolved = this.messagesFromResolver();
    if (resolved) this.messages.set(resolved);
  });

  this.ws.connect();
}

ngOnInit() {
  this.subs.add(
    this.ws.messages$.subscribe(payload => {
      const incoming = new UiMessage(
        payload.id,
        payload.senderId,
        payload.receiverId,
        payload.text,
        new Date(payload.sentAt),
        (payload.attachments ?? []).map(
          (f: any) => new UploadedFile(f.id, f.name, f.url)
        ),
        payload.status,
        payload.tempId
      );

      this.messages.update(list => {
        if (incoming.tempId) {
          const idx = list.findIndex(m => m.tempId === incoming.tempId);
          if (idx !== -1) {
            const copy = [...list];
            copy[idx] = incoming;
            return copy;
          }
        }

        if (list.some(m => m.id === incoming.id)) return list;
        return [...list, incoming];
      });
    })
  );
}

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
  createObjectUrl(file: File): string {
    return URL.createObjectURL(file);
  }
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

  ngOnDestroy() {
    this.ws.disconnect();
    this.subs.unsubscribe();
  } onTextInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.messageText.set(value);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.attachedFiles.set(
      input.files ? Array.from(input.files) : []
    );
  }
  async startRecording() {
    if (this.isRecording()) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) this.audioChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.audioChunks, { type: 'audio/webm' });

      const file = new File(
        [blob],
        `voice-${Date.now()}.webm`,
        { type: 'audio/webm' }
      );

      this.attachedFiles.update(files => [...files, file]);
      stream.getTracks().forEach(t => t.stop());
    };

    this.mediaRecorder.start();
    this.isRecording.set(true);
  }
  toggleRecording(){
    if (this.isRecording()){
      this.stopRecording()
    } else{
      this.startRecording()
    }
  }
  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording()) return;

    this.mediaRecorder.stop();
    this.isRecording.set(false);
  }
removePendingFile(index: number) {
  this.attachedFiles.update(files =>
    files.filter((_, i) => i !== index)
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


    // this.messages.update(msgs => [...msgs, optimisticMessage]);

    const text = this.messageText();
    const files = this.attachedFiles();
    this.messageText.set('');
    this.attachedFiles.set([]);

    this.msgSevice
      .sendMessages(this.nickname()!, text, files)
      .subscribe({
        next: (res) => {
        },
        error: () => {
          this.messages.update(msgs =>
            msgs.map(m => m.tempId === tempId
              ? (() => {
                const failed = new UiMessage(
                  m.id, m.senderId, m.receiverId, m.text, m.sentAt, m.attachments, 'failed', m.tempId);
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
    return /\.(wav|mp3|webm)$/i.test(fileName);
  }
  getType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'webm': return 'audio/webm';
    case 'ogg': return 'audio/ogg';
    case 'mp4': return 'video/mp4';
    default: return '';
  }
}

}
