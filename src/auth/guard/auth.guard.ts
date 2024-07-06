import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TokenUser } from 'src/user/interfaces';
import { JwtStrategy } from '../strategy';
import { PrismaService } from 'src/prisma/prisma.service';

// assume an authenticated user
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtStrategy,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req: Request & TokenUser = ctx.switchToHttp().getRequest();
    const res: Response = ctx.switchToHttp().getResponse();

    try {
      const { accessToken, refreshToken } = req.signedCookies;

      if (accessToken) {
        const payload = this.jwt.validate(accessToken);
        req.user = payload.user;
        return true;
      }

      const payload = this.jwt.validate(refreshToken);
      const existingToken = await this.prisma.token.findUnique({
        where: {
          userId: payload.user.id,
          refreshToken: payload.refreshToken,
        },
      });
      if (!existingToken?.isValid) {
        throw new UnauthorizedException('Authentication invalid');
      }

      this.jwt.attachCookiesToRes(res, { user: payload.user }, refreshToken);
      req.user = payload.user;
      return true;
      // const payload = await this.jwtService.verifyAsync(refreshToken, {
      //   secret: this.config.get('JWT_SECRET'),
      // });
      // check token db
      // check valid
      // if valid is true
      // attach cookies to response
      // accessToken cookie, refreshToken cookie
      // res.cookie('accessToken', '', {
      //   httpOnly: true,
      //   secure: false,
      //   signed: true,
      //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // });
      // res.cookie('refreshToken', '', {
      //   httpOnly: true,
      //   secure: false,
      //   signed: true,
      //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      // });
      // req.user = payload.user;
    } catch {
      throw new UnauthorizedException('Authentication invalid');
    }
  }
}
