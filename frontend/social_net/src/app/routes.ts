// src/app/routes.ts
import type { Routes } from '@angular/router';
import { AuthPageComponent } from '../pages/auth-page/auth-page.component';
import { RegisterComponent } from '../pages/register/register.component';
import { OauthCallbackComponent } from '../pages/oauth-callback/oauth-callback.component';
import { SimpleAuthCheckComponent } from '../pages/check_jwt/auth_check.component';
import { UserProfileComponent } from '../pages/user-profile/user-profile.component';
import { userResolver } from '../pages/user-profile/user.resolver';
import { AccountResolver } from '../pages/user-profile/AccountResolver';
import { MessagesComponent } from '../pages/messages/messages-component';
import { messageResolver } from '../pages/messages/message.resolver';
import { FriendsComponent } from '../pages/friends/friends.component';

export const routes: Routes = [
  { path: '', component: AuthPageComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'auth/callback', component: OauthCallbackComponent }, // receives ?token=...
  { path: 'auth/check_jwt', component: SimpleAuthCheckComponent },
  { path: 'users/:nickname', component: UserProfileComponent, resolve: { user: userResolver } },
  { path: 'account', component: UserProfileComponent, resolve: { user: AccountResolver } },
  { path: 'messages/:nickname', component: MessagesComponent, resolve: {messages : messageResolver}},
  { path: 'friends', component: FriendsComponent },
  { path: '**', redirectTo: '' }
];
