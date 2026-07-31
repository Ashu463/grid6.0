import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Registered globally via APP_GUARD (see auth.module.ts) — every route
 * requires a valid JWT unless explicitly marked @Public().
 *
 * A01/A07 — this replaces the old design where no guard existed at all and
 * every `requestingUserId` check in the *.service.ts files was dead code.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException({ success: false, message: 'Missing bearer token' });
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException({ success: false, message: 'Invalid or expired token' });
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const authHeader: string | undefined = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice('Bearer '.length);
    }
    // Legacy header used by the gateway's forward() helper.
    return request.headers['jwt-token'];
  }
}
