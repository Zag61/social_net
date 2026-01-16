// src/infrastructure/auth/optional-jwt.guard.ts
import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ExecutionContext } from '@nestjs/common';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(OptionalJwtAuthGuard.name);

  // Signature: (err, user, info, context)
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If passport strategy produced an error (parsing, db error, etc.), log it but do not throw.
    // We deliberately treat auth as optional: invalid token => treat as anonymous.
    if (err) {
      this.logger.debug({ msg: 'JWT guard error', err, info });
      return null;
    }

    // If `info` indicates token problems (expired, malformed), you can log and ignore.
    if (info) {
      // optional: log token issues for monitoring, but don't fail the request
      this.logger.debug({ msg: 'JWT info (token invalid/expired):', info });
      return null;
    }

    // `user` will be whatever `validate()` returned in JwtStrategy (or null)
    return user ?? null;
  }
}
