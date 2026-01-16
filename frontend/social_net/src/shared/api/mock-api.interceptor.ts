import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // normalize path: handle absolute URLs like http://localhost:4200/api/...
    const path = (() => {
      try {
        if (/^https?:\/\//i.test(req.url)) {
          return new URL(req.url).pathname;
        }
      } catch { /* ignore */ }
      return req.url;
    })();

    // debugging: uncomment to see urls in console
    console.log('[MockApiInterceptor] request', req.method, req.url, '-> path:', path);

    // only intercept API calls under /api/
    if (!path.startsWith('/api/')) {
      return next.handle(req);
    }

    // MATCH /api/users/:id  (id can be letters/numbers/-/_)
    if (req.method === 'GET' && /^\/api\/users\/[^\/]+$/.test(path)) {
      return of(new HttpResponse({
        status: 200,
        body: {
          id: 'u1',
          username: 'ivan',
          displayName: 'Иван Иванов',
          bio: 'Frontend dev',
          avatarUrl: '/assets/default-avatar.png',
          createdAt: new Date().toISOString(),
        },
      }));
    }

    // MATCH /api/users/:id/posts
    if (req.method === 'GET' && /^\/api\/users\/[^\/]+\/posts/.test(path)) {
      return of(new HttpResponse({
        status: 200,
        body: [
          {
            id: 'p1',
            authorId: 'u1',
            text: 'Мой первый пост',
            createdAt: new Date().toISOString(),
            likeCount: 5,
          },
        ],
      }));
    }

    // MATCH /api/users/:id/interactions
    if (req.method === 'GET' && /^\/api\/users\/[^\/]+\/interactions/.test(path)) {
      return of(new HttpResponse({
        status: 200,
        body: [
          {
            userId: 'u2',
            username: 'maria',
            displayName: 'Мария',
            avatarUrl: '/assets/default-avatar.png',
            lastInteractionAt: new Date().toISOString(),
          },
        ],
      }));
    }

    return next.handle(req);
  }
}
