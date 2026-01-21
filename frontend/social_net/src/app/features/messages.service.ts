import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { delay, firstValueFrom, Observable } from 'rxjs';
import { Message, SendMessageResponse } from '../entities/message';

@Injectable({ providedIn: 'root' })
export class MessagesService {
    constructor(private http: HttpClient) { }

    getMessages(peerNickname: string, limit: number = 100): Observable<Message[]> {
        return this.http.get<Message[]>(`http://localhost:3000/messages?peerNickname=${encodeURIComponent(peerNickname)}&limit=${encodeURIComponent(limit)}`, { withCredentials: true });
    }
    sendMessages(receiverNickname: string, text: string, files: File[]): Observable<SendMessageResponse> {
        const formData = new FormData();

        formData.append('receiverNickname', receiverNickname);
        formData.append('text', text);

        // formData.append('files', files);
        files.forEach(file => formData.append('file', file));

        return this.http.post<SendMessageResponse>(
            'http://localhost:3000/messages',
            formData,
            { withCredentials: true }
        );
    }
}