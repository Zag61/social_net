export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    sentAt: Date;
    editedAt: Date | undefined;
    files: UploadedFile[]
}
export interface UploadedFile{
    id: string;
    name: string;
    url: string;
}
export interface UiMessage extends Message {
  status?: 'sending' | 'sent' | 'failed';
  tempId?: string;
}
export type MessageStatus = 'sending' | 'sent' | 'failed';
export interface SendMessageResponse {
  id: string;
  sentAt: string; // or Date if you transform
  files: string[]
}
