import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    try {
      const { accessToken, refreshToken } = req.signedCookies;

      if (accessToken) {
        const payload = await this.jwt.verifyAsync(accessToken, {
          secret: this.config.get('JWT_SECRET'),
        });
        req.user = payload.user;
        return true;
      }

      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      const existingToken = await this.prisma.token.findUnique({
        where: {
          userId: payload.user.userId,
          refreshToken: payload.refreshToken,
        },
      });
      if (!existingToken?.isValid) {
        throw new ForbiddenException('Authentication Invalid');
      }

      const accessJwt = await this.jwt.signAsync(payload.user, {
        secret: this.config.get('JWT_SECRET'),
      });
      const refreshJwt = await this.jwt.signAsync(
        {
          ...payload.user,
          ...payload.refreshToken,
        },
        { secret: this.config.get('JWT_SECRET') },
      );

      res.cookie('accessToken', accessJwt, {
        httpOnly: true,
        secure: false,
        signed: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      });
      res.cookie('refreshToken', refreshJwt, {
        httpOnly: true,
        secure: false,
        signed: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      });
      req.user = payload.user;
      return true;
    } catch {
      throw new ForbiddenException('Authentication Invalid');
    }
  }
}
