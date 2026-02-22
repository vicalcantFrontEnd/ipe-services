import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;
    return data ? (user[data] as string) : user;
  },
);
