import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenUser } from 'src/user/interfaces';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req: Express.Request & TokenUser = ctx.switchToHttp().getRequest();
    if (data) {
      return req.user[data];
    }
    return req.user;
  },
);
