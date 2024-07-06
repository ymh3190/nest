import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';
import { TokenUser } from 'src/user/interfaces';
import { randomBytes } from 'crypto';
import { JwtStrategy } from './strategy';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtStrategy,
  ) {}

  async signup(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      throw new BadRequestException('User already exist');
    }

    const users = await this.prisma.user.findMany();
    const role = users.length === 0 ? 'admin' : 'user';

    const hash = await argon.hash(dto.password);
    await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hash,
        role,
      },
    });
    return;
  }

  async signin(req: Request, res: Response, dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCorrectPassword = await argon.verify(user.password, dto.password);
    if (!isCorrectPassword) {
      throw new BadRequestException('Password not match');
    }

    const tokenUser: TokenUser = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
    let refreshToken = '';
    const existingToken = await this.prisma.token.findUnique({
      where: {
        userId: user.id,
      },
    });
    if (existingToken) {
      const { isValid } = existingToken;
      if (!isValid) {
        throw new ForbiddenException('Invalid Credentials');
      }
      refreshToken = existingToken.refreshToken;
      this.jwt.attachCookiesToRes(res, tokenUser, refreshToken);
      // const accessTokenJwt = this.jwt.createJwt(tokenUser);
      // const refreshTokenJwt = this.jwt.createJwt(tokenUser);
      // res.cookie('accessToken', accessTokenJwt, {
      //   httpOnly: true,
      //   secure: false,
      //   signed: true,
      //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // });
      // res.cookie('refreshToken', refreshTokenJwt, {
      //   httpOnly: true,
      //   secure: false,
      //   signed: true,
      //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      // });
      return tokenUser;
    }

    refreshToken = randomBytes(40).toString('hex');
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const userToken = { userId: user.id, ip, userAgent, refreshToken };

    await this.prisma.token.create({
      data: {
        ...userToken,
      },
    });

    this.jwt.attachCookiesToRes(res, tokenUser, refreshToken);
    // const accessTokenJwt = this.jwt.createJwt(tokenUser);
    // tokenUser.refreshToken = refreshToken;
    // const refreshTokenJwt = this.jwt.createJwt(tokenUser);
    // res.cookie('accessToken', accessTokenJwt, {
    //   httpOnly: true,
    //   secure: false,
    //   signed: true,
    //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    // });
    // res.cookie('refreshToken', refreshTokenJwt, {
    //   httpOnly: true,
    //   secure: false,
    //   signed: true,
    //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    // });
    return tokenUser;
  }
}
