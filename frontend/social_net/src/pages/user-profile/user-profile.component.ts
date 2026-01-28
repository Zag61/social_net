import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  imports:[DatePipe],
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  private route = inject(ActivatedRoute);
  public data = toSignal<{ user?: ProfileVM } | null>(this.route.data);
  public profile = computed(() => this.data()?.user);
  public posts = computed(() => this.profile()?.posts ?? []);
  constructor(private router: Router) {}

  goToChat(nickname: string) {
    this.router.navigate(['/messages', nickname]);
  }
}


export interface PostVM {
  id: string;
  authorId?: string | null;
  text: string;
  attachmentsPresent: boolean;
  createdAt: string; // ISO
  attachmentsurls?: AttachmentVM[];
}

export interface PublicStatsVM {
  postsCount?: number;
  friendsCount?: number;
  createdAt?: string;
  [k: string]: any;
}
export interface AttachmentVM {
  id: string;
  name: string;
  url: string;
  mimeType?: string; // image/png, video/mp4, audio/mpeg, application/pdf
}
export interface ProfileVM {
  id: string;
  nickname: string;
  email?: string | null;
  aboutInfo?: string | null;
  verified?: boolean;
  posts: PostVM[];
  friends: any[]; // refine later
  publicStats?: PublicStatsVM | null;
  isOwner: boolean;
  avatarUrl?: string,
  _raw?: any;
}

