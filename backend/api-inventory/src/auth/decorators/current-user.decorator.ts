import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Reads the JWT payload attached to the request by JwtAuthGuard.
 * @CurrentUser()      -> whole payload ({ sub, email })
 * @CurrentUser('sub') -> just the authenticated user's id
 */
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return field ? user?.[field] : user;
  },
);
