import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as exempt from the global JwtAuthGuard.
 * Used for register/login/OAuth callback and public read endpoints.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
