import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenUser } from 'src/user/interfaces';

@Injectable()
export class JwtStrategy {
  constructor(
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  validate(token: string) {
    const payload: TokenUser = this.jwt.verify(token, {
      secret: this.config.get('JWT_SECRET'),
    });
    return payload;
  }

  attachCookiesToRes(res: Response, user: TokenUser, refreshToken: string) {
    const accessTokenJwt = this.createJwt(user);
    const refreshTokenJwt = this.createJwt({ ...user, refreshToken });

    res.cookie('accessToken', accessTokenJwt, {
      httpOnly: true,
      secure: false,
      signed: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    res.cookie('refreshToken', refreshTokenJwt, {
      httpOnly: true,
      secure: false,
      signed: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    });
  }

  private createJwt(payload: TokenUser) {
    return this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
    });
  }
}
