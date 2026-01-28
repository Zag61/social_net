import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';

export interface AttachmentVM {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
}

export interface PostVM {
  id: string;
  authorId?: string | null;
  text: string;
  attachmentsPresent: boolean;
  createdAt: string; // ISO
  attachmentsurls?: AttachmentVM[];
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss'],
})
export class PostCardComponent {
  @Input({ required: true }) post!: PostVM;

  isImage(mime?: string) {
    return !!mime && mime.startsWith('image/');
  }
  isVideo(mime?: string) {
    return !!mime && mime.startsWith('video/');
  }
  isAudio(mime?: string) {
    return !!mime && mime.startsWith('audio/');
  }

  trackByAttachment(_: number, att: AttachmentVM) {
    return att?.id;
  }
}
