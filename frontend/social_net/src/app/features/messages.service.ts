import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { delay, firstValueFrom, Observable } from 'rxjs';
import { Message, SendMessageResponse } from '../entities/message';
import { ChatDto } from '../entities/chat.dto';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    constructor(private http: HttpClient) { }

    getMessages(peerNickname: string, limit: number = 100): Observable<Message[]> {
        return this.http.get<Message[]>(`http://localhost:3000/messages?peerNickname=${encodeURIComponent(peerNickname)}&limit=${encodeURIComponent(limit)}`, { withCredentials: true });
    }
    getChats(): Observable<ChatDto[]> {
        return this.http.get<ChatDto[]>(`http://localhost:3000/messages/chats`, { withCredentials: true });
    }
    deleteChat(secondUserId: string) {
        return this.http.post<{ success: boolean }>(
            `http://localhost:3000/messages/drop-chat/${encodeURIComponent(secondUserId)}`,
            null, // no body
            { withCredentials: true } // send cookies/session
        );
    }

    sendMessages(receiverNickname: string, text: string, files: File[], tempId?: string): Observable<SendMessageResponse> {
        const formData = new FormData();

        formData.append('receiverNickname', receiverNickname);
        formData.append('text', text);
        if (tempId) formData.append('tempId', tempId);
        files.forEach(file => formData.append('files', file));

        return this.http.post<SendMessageResponse>(
            'http://localhost:3000/messages',
            formData,
            { withCredentials: true }
        );
    }
}