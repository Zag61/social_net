import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../app/features/user.service';
import { PostVM, ProfileVM } from './user-profile.component';

function mapPost(p: any): PostVM {
  return {
    id: p.id ?? p._id ?? '',
    authorId: p.authorId ?? p.author_id ?? p.author_id ?? null,
    text: p.text ?? p.body ?? '',
    attachmentsPresent: !!(p.attachmentsPresent ?? p.attachments_present),
    createdAt: p.createdAt ?? p.created_at ?? p.created ?? '',
    attachmentsurls:  Array.isArray(p.attachmentsurls)
      ? p.attachmentsurls.map((a: any) => ({
          id: a.id ?? a._id ?? '',
          name: a.name ?? '',
          url: a.url ?? '',
          mimeType: a.mimeType
        }))
      : [],
  };
}

function normalizeProfile(raw: any): ProfileVM {
  // case 1: owner view with fullUser + posts + friends
  if (raw?.fullUser) {
    const fu = raw.fullUser;
    const posts = (raw.posts ?? []).map(mapPost);
    return {
      id: fu.id,
      nickname: fu.nickname,
      email: fu.email ?? null,
      aboutInfo: fu.aboutInfo ?? fu.about_info ?? null,
      verified: !!fu.verified,
      posts,
      friends: raw.friends ?? [],
      publicStats: null,
      isOwner: true,
      _raw: raw,
      avatarUrl: fu.avatarUrl
    };
  }

  // case 2: public view (flat object, snake_case possible)
  // sometimes the response may be the object itself (not nested)
  const obj = raw ?? {};
  const publicStats = raw.publicStats ?? raw.public_stats ?? null;
  const postsSource = raw.posts ?? [];
  const posts = (postsSource ?? []).map(mapPost);
  // pick about info from several places
  const aboutInfo =
    obj.aboutInfo ??
    obj.about_info ??
    publicStats?.aboutInfo ??
    publicStats?.about_info ??
    null;

  return {
    id: obj.id ?? obj._id ?? '',
    nickname: obj.nickname ?? (publicStats && publicStats.nickname) ?? '',
    email: obj.email ?? null,
    aboutInfo,
    verified: !!obj.verified,
    posts,
    friends: [], // public view doesn't include friends
    publicStats: publicStats
      ? {
          postsCount: publicStats.postsCount ?? publicStats.posts_count,
          friendsCount: publicStats.friendsCount ?? publicStats.friends_count,
          createdAt: publicStats.createdAt ?? publicStats.created_at,
          ...publicStats,
        }
      : null,
    isOwner: false,
    _raw: raw,
  };
}

export const AccountResolver: ResolveFn<ProfileVM> = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const userService = inject(UserService);
  const raw = await firstValueFrom(userService.getUserById());
  console.log(raw)
  return normalizeProfile(raw);
};
