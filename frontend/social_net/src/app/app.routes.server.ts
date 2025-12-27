// app.routes.server.ts
import {RenderMode, ServerRoute} from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  {
    path: '', 
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'register', // This page is static, so we prerender it (SSG)
    renderMode: RenderMode.Client,
  },
//   {
//     path: 'profile', // This page requires user-specific data, so we use SSR
//     renderMode: RenderMode.Server,
//   },
  {
    path: '**', // All other routes will be rendered on the server (SSR)
    renderMode: RenderMode.Client,
  },
];