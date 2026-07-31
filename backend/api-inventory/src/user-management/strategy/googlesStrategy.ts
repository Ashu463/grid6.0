import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from '../um.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: UserService) {
    // Names must match GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET as set in
    // docker-compose.yml and .env.example. Falls back to placeholder values
    // so the app can boot without OAuth configured — passport-oauth2 throws
    // at construction time if clientID is empty/undefined.
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'not-configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'not-configured',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:9000/auth/google/callback',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done:VerifyCallback) {
    // const user = await this.authService.validateOAuthLogin(profile);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // return user;
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    done(null, user);
  }
}
