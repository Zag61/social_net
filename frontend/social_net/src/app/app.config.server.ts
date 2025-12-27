import {provideServerRendering, withRoutes} from '@angular/ssr';
import {serverRoutes} from './app.routes.server';
import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';
import { provideHttpClient, withFetch } from '@angular/common/http';
// app.config.server.ts
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),provideHttpClient(withFetch())
    // ... other providers ...
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);