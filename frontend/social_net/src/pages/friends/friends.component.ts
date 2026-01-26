import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed
} from '@angular/core';

import { Subject, Subscription, of, firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { PresenceService } from '../../app/features/presence.service';
import { UserService } from '../../app/features/user.service';
import { AuthService } from '../../app/features/auth.service';
import { Friend } from '../../app/entities/user.types';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit, OnDestroy {
  // ---------------- STATE ----------------
  friends = signal<Friend[]>([]);
  searchQuery = signal('');
  addMode = signal(false);
  searchResults = signal<Friend[]>([]);
  openMenuId = signal<number | string | null>(null);

  // pending state for requests (keyed by user id)
  pendingRequests = signal<Record<string, boolean>>({});
  pendingRemovals = signal<Record<string, boolean>>({});

  displayedFriends = computed(() => {
    if (this.addMode()) {
      return this.searchResults();
    }

    const q = this.searchQuery().toLowerCase();
    if (!q) return this.friends();

    return this.friends().filter(f =>
      f.nickname?.toLowerCase().includes(q)
    );
  });

  // ---------------- services ----------------
  private users = inject(UserService);
  private auth = inject(AuthService);
  private presence = inject(PresenceService);

  // ---------------- RxJS ----------------
  private search$ = new Subject<string>();
  private subs = new Subscription();

  // ---------------- lifecycle ----------------
  async ngOnInit() {
    // load friends
    const friends = await firstValueFrom(this.users.getFriends()) || [];
    this.friends.set(friends.map(f => ({ ...f, online: false })));

    // presence
    this.subs.add(
      this.presence.friendOnline$.subscribe(id =>
        this.friends.update(list =>
          list.map(f => f.id === id ? { ...f, online: true } : f)
        )
      )
    );

    this.subs.add(
      this.presence.friendOffline$.subscribe(id =>
        this.friends.update(list =>
          list.map(f => f.id === id ? { ...f, online: false } : f)
        )
      )
    );

    this.presence.connect(this.auth.getToken()!);

    // SEARCH PIPELINE
    this.subs.add(
      this.search$
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(text => {
            // local mode → just store query
            if (!this.addMode()) {
              this.searchQuery.set(text);
              return of<Friend[]>([]);
            }

            // add mode + empty → default backend query (list/popular)
            if (!text) {
              return this.users.findPersonByNickname();
            }

            // add mode → backend search
            return this.users.findPersonByNickname(text);
          })
        )
        .subscribe(results => {
          if (this.addMode()) {
            this.searchResults.set(results || []);
          }
        })
    );
  }

  ngOnDestroy() {
    this.presence.disconnect();
    this.subs.unsubscribe();
  }

  // ---------------- UI ----------------
  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.search$.next(value);
  }

  toggleAddMode() {
    const newMode = !this.addMode();
    this.addMode.set(newMode);

    // reset local UI state
    this.searchQuery.set('');
    this.openMenuId.set(null);

    // trigger initial backend query when entering add mode
    if (newMode) {
      // emit empty query so pipeline requests default list
      this.search$.next('');
    } else {
      // leaving add mode: optionally clear results (we keep results cleared)
      this.searchResults.set([]);
    }
  }

  toggleMenu(id: number | string) {
    this.openMenuId.update(curr => curr === id ? null : id);
  }

  getInitials(f: Friend) {
    return (f.nickname ?? '')
      .split(' ')
      .map(p => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  isFriend(u: Friend) {
    return this.friends().some(f => f.id === u.id);
  }

  // ---------- Send friend request ----------
  async sendFriendRequest(user: Friend) {
    const id = user.id;
    // mark pending
    this.pendingRequests.update(p => ({ ...p, [id]: true }));

    try {
      console.log(id)
      await firstValueFrom(this.users.sendFriendRequest(id));
      // keep pending flag to indicate "requested" state
      // optionally you may keep it as true or set to a special status map
      // we'll keep it true so template shows "Requested"
    } catch (err) {
      console.error('Failed to send friend request', err);
      // rollback pending flag
      this.pendingRequests.update(p => {
        const copy = { ...p };
        delete copy[id];
        return copy;
      });
    }
  }

  // ---------- Remove friend (unfriend) ----------
  async sendUnfriendRequest(friend: Friend) {
    const id = friend.id;
    this.openMenuId.set(null);

    // mark pending removal
    this.pendingRemovals.update(p => ({ ...p, [id]: true }));

    // optimistic UI: remove immediately
    const prev = this.friends();
    this.friends.update(list => list.filter(f => f.id !== id));

    try {
      await firstValueFrom(this.users.removeFriend(id));
      // success -> removed permanently
      // clear pending flag
      this.pendingRemovals.update(p => {
        const copy = { ...p };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error('Failed to remove friend', err);
      // rollback
      this.friends.set(prev);
      this.pendingRemovals.update(p => {
        const copy = { ...p };
        delete copy[id];
        return copy;
      });
    }
  }
}
