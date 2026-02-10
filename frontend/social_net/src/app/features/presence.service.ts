import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../environment';

@Injectable({ providedIn: 'root' })
export class PresenceService implements OnDestroy {
  private socket: Socket | null = null;
  private heartbeatInterval: any;

  // Observables for real-time updates
  friendOnline$ = new Subject<string>();  // friend ID
  friendOffline$ = new Subject<string>();

  connect(token: string) {
    if (this.socket) return;

    this.socket = io(`ws://localhost:3002/`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });

    // REGISTER LISTENERS FIRST
    this.socket.on('friend:online', (friendId: string) => {
      this.friendOnline$.next(friendId);
    });

    this.socket.on('friend:offline', (friendId: string) => {
      this.friendOffline$.next(friendId);
    });

    this.socket.on('connect', () => {
      this.heartbeatInterval = setInterval(() => {
        this.socket?.emit('presence:heartbeat');
      }, 25000);
    });

    this.socket.on('disconnect', () => {
      clearInterval(this.heartbeatInterval);
    });

    this.socket.connect();

  }

  disconnect() {
    if (!this.socket) return;
    clearInterval(this.heartbeatInterval);
    this.socket.disconnect();
    this.socket = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
