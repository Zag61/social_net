import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type UserPayload = {
  id: string;
  email?: string;
  roles?: string[];
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPayload | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as UserPayload | undefined;
  },
);
