import { Component, ElementRef, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss',
})
export class Viewer {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  socket!: Socket;
  pc!: RTCPeerConnection;

  callerUserId!: string;
  pendingOffer: RTCSessionDescriptionInit | null = null;

  iceQueue: RTCIceCandidateInit[] = [];
  remoteDescriptionSet = false;

  ngAfterViewInit() {
    this.socket = io('http://localhost:3000/call', {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
    });

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.pc.ontrack = e => {
      this.video.nativeElement.srcObject = e.streams[0];
    };

    this.pc.onicecandidate = e => {
      if (e.candidate && this.callerUserId) {
        this.socket.emit('ice', {
          room: this.callerUserId,
          candidate: e.candidate,
        });
      }
    };

    // Incoming offer
    this.socket.on('offer', data => {
      this.callerUserId = data.from;
      this.pendingOffer = data.offer;
    });

    // Incoming ICE
    this.socket.on('ice', async data => {
      if (!data?.candidate) return;

      if (!this.remoteDescriptionSet) {
        // queue if remote description not ready
        this.iceQueue.push(data.candidate);
      } else {
        try {
          await this.pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('ICE add error', err);
        }
      }
    });
  }

  async acceptCall() {
    if (!this.pendingOffer) return;

    await this.pc.setRemoteDescription(
      new RTCSessionDescription(this.pendingOffer)
    );
    this.remoteDescriptionSet = true;

    // flush queued ICE candidates
    for (const c of this.iceQueue) {
      await this.pc.addIceCandidate(new RTCIceCandidate(c));
    }
    this.iceQueue = [];

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    this.socket.emit('answer', {
      room: this.callerUserId,
      answer,
    });

    this.pendingOffer = null;
  }

  endCall() {
    this.pc.close();
    this.video.nativeElement.srcObject = null;
  }
}
