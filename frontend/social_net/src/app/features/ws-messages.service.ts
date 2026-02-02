// src/app/features/ws-messages.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsMessagesService implements OnDestroy {
  private socket: Socket | null = null;
  private incoming$ = new Subject<any>();

  get messages$(): Observable<any> {
    return this.incoming$.asObservable();
  }

  connect() {
    if (this.socket) return;

    const tokenMatch = document.cookie.match(/access_token=([^;]+)/);
    const token = tokenMatch?.[1];

    this.socket = io(`ws://localhost:3000/messages`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      // console.log('ws connected');
    });

    this.socket.on('message', (payload: any) => {
      this.incoming$.next(payload);
    });

    this.socket.on('disconnect', () => {
      // handle reconnection logic if desired
    });
  }

  ngOnDestroy() {
    this.socket?.disconnect();
    this.socket = null;
    this.incoming$.complete();
  }
}
