// src/app/routes.ts
import type { Routes } from '@angular/router';
import { AuthPageComponent } from '../pages/auth-page/auth-page.component';
import { RegisterComponent } from '../pages/register/register.component';
import { OauthCallbackComponent } from '../pages/oauth-callback/oauth-callback.component';
import { SimpleAuthCheckComponent } from '../pages/check_jwt/auth_check.component';

export const routes: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'auth/callback', component: OauthCallbackComponent }, // receives ?token=...
  { path: 'auth/check_jwt', component: SimpleAuthCheckComponent },
  { path: '**', redirectTo: '' }
];
