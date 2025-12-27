import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../app/features/auth.service';

@Component({
  standalone: true,
  selector: 'app-oauth-callback',
  template: `<p>Signing you in…</p>`,
})
export class OauthCallbackComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Only run in browser
      this.auth.checkSession().subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: () => this.router.navigateByUrl('/login'),
      });
    }
  }
}
