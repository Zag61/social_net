
import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../environment';
import { decodeJwtPayload } from '../../shared/helpers';

@Injectable({ providedIn: 'root' })
export class CallService implements OnDestroy {
  private socket: Socket | null = null;

  // signaling subjects
  incomingOffer$ = new Subject<{ from: string; offer: RTCSessionDescriptionInit }>();
  incomingAnswer$ = new Subject<{ from: string; answer: RTCSessionDescriptionInit }>();
  icecandidates$ = new Subject<{ from: string; candidate: RTCIceCandidateInit }>();

  connect(token?: string) {
    if (this.socket) return;

    // if token not passed, read cookie
    if (!token) {
      const match = document.cookie.match(/access_token=([^;]+)/);
      if (!match) return;
      token = match[1];
    }

    this.socket = io(`${environment.apiBaseUrl}/call`, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });

    this.socket.on('offer', (payload: { from: string; offer: RTCSessionDescriptionInit }) => {
      this.incomingOffer$.next(payload);
    });

    this.socket.on('answer', (payload: { from: string; answer: RTCSessionDescriptionInit }) => {
      this.incomingAnswer$.next(payload);
    });

    this.socket.on('ice', (payload: { from: string; candidate: RTCIceCandidateInit }) => {
      this.icecandidates$.next(payload);
    });

    this.socket.on('disconnect', () => {
      // handle disconnect if needed
    });

    this.socket.connect();
    console.log('CallService connected');
  }

  // signaling senders (use 'to' field)
  sendOffer(payload: { to: string; offer: RTCSessionDescriptionInit }) {
    this.socket?.emit('offer', payload);
  }

  sendAnswer(payload: { to: string; answer: RTCSessionDescriptionInit }) {
    this.socket?.emit('answer', payload);
  }

  sendIce(payload: { to: string; candidate: RTCIceCandidateInit }) {
    this.socket?.emit('ice-candidate', payload);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  ngOnDestroy() {
    this.disconnect();
  }
}
