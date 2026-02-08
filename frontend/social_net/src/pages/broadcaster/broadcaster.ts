import { Component, ElementRef, ViewChild } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-broadcaster',
  templateUrl: './broadcaster.html',
  styleUrl: './broadcaster.scss',
})
export class Broadcaster {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;

  socket!: Socket;
  pc!: RTCPeerConnection;
  stream!: MediaStream;

  calleeUserId = '99f2a4dc-3657-4891-839f-29b1397452a6';

  async startCall() {
    this.socket = io('http://localhost:3000/call', {
      auth: {
        token: localStorage.getItem('token'),
      },
      transports: ['websocket'],
    });
    // console.log(await navigator.mediaDevices.enumerateDevices())
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    this.video.nativeElement.srcObject = this.stream;

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.stream.getTracks().forEach(track =>
      this.pc.addTrack(track, this.stream),
    );

    this.pc.onicecandidate = e => {
      if (e.candidate) {
        this.socket.emit('ice', {
          room: this.calleeUserId,
          candidate: e.candidate,
        });
      }
    };
    this.socket.on('answer', async data => {
      await this.pc.setRemoteDescription(
        new RTCSessionDescription(data.answer ?? data)
      );
    });


    this.socket.on('ice', async candidate => {
      await this.pc.addIceCandidate(candidate);
    });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.socket.emit('offer', {
      room: this.calleeUserId,
      offer,
    });

  }

  toggleMic() {
    this.stream.getAudioTracks().forEach(t => (t.enabled = !t.enabled));
  }

  toggleCam() {
    this.stream.getVideoTracks().forEach(t => (t.enabled = !t.enabled));
  }
}
