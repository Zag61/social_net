// // src/app/auth/pages/auth-page/auth-page.component.ts
// import { Component, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule, Validators, NonNullableFormBuilder, FormGroup } from '@angular/forms';
// import { RouterModule, Router } from '@angular/router';
// import { CookieService } from 'ngx-cookie-service';
// import { AuthService } from '../../app/features/auth.service';

// @Component({
//   selector: 'app-auth-page',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterModule],
//   templateUrl: './auth-page.component.html',
//   styleUrls: ['./auth-page.component.scss']
// })
// export class AuthPageComponent {
//   form: FormGroup;
//   loading = signal(false);
//   error = signal<string | null>(null);
//   cookieService = inject(CookieService);

// constructor(
//     private fb: NonNullableFormBuilder,
//     private auth: AuthService,
//     private router: Router
//   ) {
//     this.form = this.fb.group({
//       email: ['', [Validators.required, Validators.email]],
//       password: ['', Validators.required],
//     });
//   }

//   async submit() {
//     if (this.form.invalid) {
//       this.error.set('Please fill valid email and password.');
//       return;
//     }
//     this.loading.set(true);
//     this.error.set(null);
//     try {
//       const response = await this.auth.login(this.form.value);
//       console.log('Login response:', response); // ← Add this line
//       this.cookieService.set('Authorization', 'Bearer ' + response.access_token);
//     // Store the token
//     // localStorage.setItem('access_token', response.access_token);
//       // on success redirect to app root or dashboard
//       this.router.navigateByUrl('/');
//     } catch (err: any) {
//       this.error.set(err?.error?.message || err?.message || 'Login failed');
//     } finally {
//       this.loading.set(false);
//     }
//   }

//   goRegister() { this.router.navigateByUrl('/register'); }
//   onGoogle() { this.auth.startGoogleAuth(); }
// }

// src/app/auth/pages/auth-page/auth-page.component.ts
import { Component, Inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../app/features/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);

  private isBrowser: boolean;

  constructor(
    private fb: NonNullableFormBuilder,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // keep initial values consistent with prerendered HTML (empty strings)
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.error.set('Please fill valid email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');

    try {
      const response = await this.auth.login(this.form.value);

      // only access document/cookies in the browser
      if (this.isBrowser) {
        // simple, safe cookie set (or use CookieService if you ensure it is safe server-side)
        document.cookie = `access_token=${response.access_token}; path=/; SameSite=Lax`;
        // then redirect
        await this.router.navigateByUrl('/');
      } else {
        // If somehow called on server, don't try to set cookie or navigate.
        // (Under normal prerender/hydration this branch won't be used.)
      }
    } catch (err: any) {
      this.error = err?.error?.message || err?.message || 'Login failed';
    } finally {
      this.loading.set(false);
    }
  }

  goRegister() {
    if (this.isBrowser) this.router.navigateByUrl('/register');
  }

  onGoogle() {
    if (this.isBrowser) this.auth.startGoogleAuth();
  }
  hidePassword = true;

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }
}
