import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message, SendMessageResponse } from '../entities/message';
import { ChatDto } from '../entities/chat.dto';
import { environment } from '../../environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    constructor(private http: HttpClient) { }

    getMessages(peerNickname: string, limit: number = 100): Observable<Message[]> {
        return this.http.get<Message[]>(`${environment.apiBaseUrl}/messages?peerNickname=${encodeURIComponent(peerNickname)}&limit=${encodeURIComponent(limit)}`, { withCredentials: true });
    }
    getChats(): Observable<ChatDto[]> {
        return this.http.get<ChatDto[]>(`${environment.apiBaseUrl}/messages/chats`, { withCredentials: true });
    }
    deleteChat(secondUserId: string) {
        return this.http.post<{ success: boolean }>(
            `${environment.apiBaseUrl}/messages/drop-chat/${encodeURIComponent(secondUserId)}`,
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
            `${environment.apiBaseUrl}/messages`,
            formData,
            { withCredentials: true }
        );
    }
}