// broadcaster.component.ts
import { Component, ElementRef, ViewChild, inject, signal, computed, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { UserService } from '../../app/features/user.service';
import { CallService } from '../../app/features/call.service';
import { decodeJwtPayload } from '../../shared/helpers';

@Component({
  selector: 'app-broadcaster',
  imports: [CommonModule, FormsModule],
  templateUrl: './broadcaster.html',
  styleUrl: './broadcaster.scss'
})
export class BroadcasterComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  userService = inject(UserService);
  callService = inject(CallService);

  private peerConnection?: RTCPeerConnection;
  private subs = new Subscription();

  private pendingCandidates: RTCIceCandidateInit[] = [];
  private tracksAdded = false;
  private incomingRemoteStream?: MediaStream;

  remoteUserName = signal('');
  pendingOffer = signal(false);
  lastOfferPayload?: { from: string; offer: RTCSessionDescriptionInit };

  public currentUserId = computed<string | null>(() => {
    const match = document.cookie.match(/access_token=([^;]+)/);
    if (!match) return null;
    const payload = decodeJwtPayload(match[1]);
    return payload?.id ?? null;
  });

  remoteUserId$ = toObservable(this.remoteUserName).pipe(
    debounceTime(500),
    distinctUntilChanged(),
    switchMap(n => {
      if (!n?.trim()) return of(null);
      return this.userService.getUserByNickname(n);
    })
  );
  remoteUserId = toSignal(this.remoteUserId$);

  stream?: MediaStream;

  constructor() { }

  onTyping(e: Event) {
    this.remoteUserName.set((e.target as HTMLInputElement).value);
  }

  async ngOnInit() {
    this.stream = await this.getUserMediaWithFallback();

    if (this.localVideo && this.stream) {
      try {
        const v = this.localVideo.nativeElement;
        v.muted = true;
        v.srcObject = this.stream;
        await v.play().catch(() => { });
      } catch (e) {
        console.warn('[broadcaster] local attach/play failed', e);
      }
    }

    this.callService.connect();

    this.subs.add(this.callService.incomingOffer$.subscribe(p => {
      this.lastOfferPayload = p;
      this.pendingOffer.set(true);
    }));
    this.subs.add(this.callService.incomingAnswer$.subscribe(async p => {
      if (!this.peerConnection) {
        console.warn('[broadcaster] onIncomingAnswer: no peerConnection');
        return;
      }
      try {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(p.answer));
        await this.drainPendingCandidates();
      } catch (e) {
        console.warn('[broadcaster] onIncomingAnswer failed', e);
      }
    }));
    this.subs.add(this.callService.icecandidates$.subscribe(async payload => {
      if (!this.peerConnection || !this.peerConnection.remoteDescription) {
        this.pendingCandidates.push(payload.candidate);
        return;
      }
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
      } catch (e) {
        console.warn('[broadcaster] addIceCandidate failed', e);
      }
    }));
  }

  ngOnDestroy(): void {
    this.closePeerConnection();
    this.subs.unsubscribe();
    this.stream?.getTracks().forEach(t => t.stop());
  }

  private async getUserMediaWithFallback(): Promise<MediaStream | undefined> {
    try {
      return await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true });
    } catch (err) {
      console.warn('[broadcaster] video failed, fallback audio-only', err);
      try {
        return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
      } catch (err2) {
        console.error('[broadcaster] audio fallback failed', err2);
        return undefined;
      }
    }
  }

  private closePeerConnection() {
    if (!this.peerConnection) return;
    try {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onconnectionstatechange = null;
      this.peerConnection.close();
    } catch (e) {
      console.warn('[broadcaster] close PC error', e);
    } finally {
      this.peerConnection = undefined;
      this.tracksAdded = false;
      this.pendingCandidates = [];
      this.incomingRemoteStream = undefined;
      try { if (this.remoteVideo?.nativeElement) this.remoteVideo.nativeElement.srcObject = null; } catch { }
    }
  }

  private createPeerConnection(remoteId: string) {
    if (this.peerConnection) {
      return this.peerConnection;
    }

    const configuration: RTCConfiguration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      // sdpSemantics: 'unified-plan'
    };

    this.peerConnection = new RTCPeerConnection(configuration);
    this.setupPeerConnectionTracksAndEvents(remoteId);
    return this.peerConnection;
  }
  private setupPeerConnectionTracksAndEvents(remoteId: string) {
    if (this.stream && !this.tracksAdded) {
      this.stream.getTracks().forEach(track => {
        if (!this.peerConnection!.getSenders().some(s => s.track === track)) {
          this.peerConnection!.addTrack(track, this.stream!);
        }
      });
      this.tracksAdded = true;
    }

    this.incomingRemoteStream = new MediaStream();
    if (this.remoteVideo?.nativeElement) {
      this.remoteVideo.nativeElement.srcObject = this.incomingRemoteStream;
    }

    this.peerConnection!.ontrack = (event) => this.handleOnTrack(event);
    this.peerConnection!.onicecandidate = (event) => {
      if (event.candidate) {
        this.callService.sendIce({ to: remoteId, candidate: event.candidate.toJSON() });
      }
    };
    // this.peerConnection!.onconnectionstatechange = () => {
    //   const state = this.peerConnection?.connectionState;
    // };
  }
  private handleOnTrack(event: RTCTrackEvent) {
    try {

      if (!this.incomingRemoteStream) return;

      // Avoid adding duplicate tracks
      if (!this.incomingRemoteStream.getTracks().some(t => t.id === event.track.id)) {
        this.incomingRemoteStream.addTrack(event.track);
      }

      // Merge any tracks from event.streams[0] (legacy fallback)
      if (event.streams && event.streams.length > 0) {
        const s = event.streams[0];
        s.getTracks().forEach(t => {
          if (!this.incomingRemoteStream!.getTracks().some(tt => tt.id === t.id)) {
            this.incomingRemoteStream!.addTrack(t);
          }
        });
      }

      // Attempt to play
      this.remoteVideo?.nativeElement?.play().catch(() => { });
    } catch (e) {
      console.warn('[broadcaster] handleOnTrack error', e);
    }
  }

  async acceptCall() {
    if (!this.lastOfferPayload) return;
    const from = this.lastOfferPayload.from;
    const offer = this.lastOfferPayload.offer;
    this.pendingOffer.set(false);

    this.createPeerConnection(from);
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      await this.drainPendingCandidates();

      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.callService.sendAnswer({ to: from, answer });
    } catch (e) {
      console.error('[broadcaster] acceptCall failed', e);
    }
  }

  async startCall() {
    const to = this.remoteUserId()?.id ?? '';
    if (!to) {
      console.warn('[broadcaster] startCall: no remote user selected');
      return;
    }
    this.createPeerConnection(to);
    if (!this.peerConnection) return;
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.callService.sendOffer({ to, offer });
    } catch (e) {
      console.error('[broadcaster] startCall failed', e);
    }
  }

  async endCall() {
    this.closePeerConnection();
  }

  private async drainPendingCandidates() {
    if (!this.peerConnection) return;
    if (!this.pendingCandidates.length) return;
    const cpy = [...this.pendingCandidates];
    this.pendingCandidates = [];
    for (const c of cpy) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(c));
      } catch (e) {
        console.warn('[broadcaster] drain candidate failed', e);
      }
    }
  }
}
