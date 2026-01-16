import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from '../environment';
import { MockApiInterceptor } from '../shared/api/mock-api.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi()),
    ...(environment.mockApi
      ? [
          {
            provide: HTTP_INTERCEPTORS,
            useClass: MockApiInterceptor,
            multi: true,
          },
        ]
      : []),]
};