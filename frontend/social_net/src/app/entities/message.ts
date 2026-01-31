// export interface Message {
//     id: string;
//     senderId: string;
//     receiverId: string;
//     text: string;
//     sentAt: Date;
//     editedAt: Date | undefined;
//     files: UploadedFile[]

import { UUID } from "./user.types";

// }
import { IsString, IsUrl } from 'class-validator';
import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class Message {
  private editedAt?: Date;

  constructor(
    public readonly id: UUID,
    public readonly senderId: UUID,
    public readonly receiverId: UUID,
    public text: string,
    public readonly sentAt: Date = new Date(),
    public attachments: UploadedFile[] = [], // <-- add attachments
  ) {}

  edit(newText: string) {
    if (newText === this.text) return;
    this.text = newText;
    this.editedAt = new Date();
  }

  getEditedAt(): Date | undefined {
    return this.editedAt;
  }

  // setter for editedAt is a bit weird — normally you don't expose it like this
  setEditedAt(date: Date) {
    this.editedAt = date;
  }

  addAttachment(file: UploadedFile) {
    this.attachments.push(file);
  }

  removeAttachment(fileId: string) {
    this.attachments = this.attachments.filter(f => f.id !== fileId);
  }
}

export class UploadedFile {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsUrl()
  url: string;

  constructor(id: string, name: string, url: string) {
    this.id = id;
    this.name = name;
    this.url = url;
  }
}


export class UiMessage extends Message {
  @IsOptional()
  status?: 'sending' | 'sent' | 'failed';

  @IsOptional()
  tempId?: string;

  constructor(
    id: string,
    senderId: string,
    receiverId: string,
    text: string,
    sentAt: Date,
    attachments: UploadedFile[] = [],
    status?: 'sending' | 'sent' | 'failed',
    tempId?: string
  ) {
    super(id, senderId, receiverId, text, sentAt, attachments);
    this.status = status;
    this.tempId = tempId;
  }
}

export type MessageStatus = 'sending' | 'sent' | 'failed';

export interface SendMessageResponse {
  id: string;
  sentAt: string; // or Date if you transform
  files: UploadedFile[]
}
