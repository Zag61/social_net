import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { PresenceService } from '../../app/features/presence.service';
import { UserService } from '../../app/features/user.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { Friend } from '../../app/entities/user.types';
import { AuthService } from '../../app/features/auth.service';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html'
})
export class FriendsComponent implements OnInit, OnDestroy {
  // ✅ Make friends a signal
  friends = signal<Friend[]>([]);

  private users = inject(UserService);
  private authService = inject(AuthService);
  private presenceSubs: Subscription[] = [];

  constructor(private presence: PresenceService) {}

  async ngOnInit() {
    // 1️⃣ Load friends from backend
    const friendsFromBackend = await firstValueFrom(this.users.getFriends());
    // Initialize signal with offline status
    this.friends.set(friendsFromBackend.map(f => ({ ...f, online: false })));

    // 2️⃣ Subscribe to presence updates
    this.presenceSubs.push(
      this.presence.friendOnline$.subscribe(id => {
        this.friends.update(friends =>
          friends.map(f => (f.id === id ? { ...f, online: true } : f))
        );
      })
    );

    this.presenceSubs.push(
      this.presence.friendOffline$.subscribe(id => {
        this.friends.update(friends =>
          friends.map(f => (f.id === id ? { ...f, online: false } : f))
        );
      })
    );

    // 3️⃣ Connect presence socket with dynamic token
    this.presence.connect(this.authService.getToken()!);
  }

  ngOnDestroy() {
    this.presence.disconnect();
    this.presenceSubs.forEach(s => s.unsubscribe());
  }
}
