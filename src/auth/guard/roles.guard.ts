import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorator';
import { Request } from 'express';
import { TokenUser } from 'src/user/interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, ctx.getHandler());
    if (!roles) {
      return true;
    }

    const req: Request & TokenUser = ctx.switchToHttp().getRequest();
    return roles.includes(req.user.role);
  }
}
