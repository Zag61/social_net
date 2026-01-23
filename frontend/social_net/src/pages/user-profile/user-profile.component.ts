import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
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
}

export interface PublicStatsVM {
  postsCount?: number;
  friendsCount?: number;
  createdAt?: string;
  [k: string]: any;
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

