import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy as GoogleStrategyPassport } from 'passport-google-oauth20';
import { AuthService } from "src/application/services/auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyPassport, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      // PKCE is optional for backend confidential clients
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    const { name, emails } = profile;
    const user = await this.authService.validateOAuthLogin({
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    });

    done(null, user);
  }
}
