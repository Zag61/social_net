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
      autoConnect: false, // 👈 IMPORTANT
    });

    // REGISTER LISTENERS FIRST
    this.socket.on('friend:online', (friendId: string) => {
      console.log('friend:online received', friendId);
      this.friendOnline$.next(friendId);
    });

    this.socket.on('friend:offline', (friendId: string) => {
      console.log('friend:offline received', friendId);
      this.friendOffline$.next(friendId);
    });

    this.socket.on('connect', () => {
      console.log('Connected to presence socket', this.socket?.id);
      this.heartbeatInterval = setInterval(() => {
        this.socket?.emit('presence:heartbeat');
      }, 25000);
    });

    this.socket.on('disconnect', () => {
      console.log('disconnected from presence socket');
      clearInterval(this.heartbeatInterval);
    });

    // NOW connect
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
